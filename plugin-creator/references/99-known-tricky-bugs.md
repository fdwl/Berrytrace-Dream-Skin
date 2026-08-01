# 99 — 高频奇葩问题 FAQ（Known Tricky Bugs）

> **本文件专门收录那些：症状明显、根因反直觉、容易反复踩坑的奇葩 Bug。**
>
> 维护规则：每次修复一个"以前被修好但又复现"的问题，必须在此补录，并说明根因与防止复现的方法。

---

## Bug #001 — `AnimatePresence` 子元素提示缺少 `key` prop

**严重程度**：⚠️ 低（不影响运行，但干扰控制台日志）  
**影响范围**：所有使用 `framer-motion` 动画组件的插件 View

### 错误症状

```
Each child in a list should have a unique "key" prop.
Check the render method of `AnimatePresence`.
```

### ✅ 使用规范与避免方式

1. **直接子元素必须带唯一 `key`**：
   `<AnimatePresence>` 的直接子元素（如 `<motion.div>`）必须指定唯一、稳定的 `key` 属性（如 `key={currentStep}` 或 `key="panel-active"`）。

2. **步骤切换 / 多 Tab 场景推荐使用 Component 映射表**：
   对于步骤切换或多选项卡场景，推荐使用声明式 Component 映射表分发：

   ```tsx
   const STEP_COMPONENTS: Record<number, React.ComponentType> = {
     1: WelcomeStep,
     2: WorkspaceStep,
     3: ModelConfigStep,
   }

   const ActiveStep = STEP_COMPONENTS[currentStep] || WelcomeStep

   <AnimatePresence mode="wait">
     <motion.div key={`step-${currentStep}`} className="w-full h-full">
       <ActiveStep />
     </motion.div>
   </AnimatePresence>
   ```

3. **修改后生效规则**：
   修改插件代码后，需运行以下命令完成单插件增量编译与宿主热重载：
   ```bash
   npm run build:plugin <plugin-name>
   ```

### 历史修复记录

| 日期 | 文件 | 修复内容 |
|------|------|---------|
| 2026-07-30 | `builtin-plugins/berrytrace-online/src/views/onboarding/OnboardingWizard.tsx` | 修复并排 `&&` 短路及预实例化 JSX 缺失 key 问题：映射表改为 ComponentType + `<StepComponent key={...} />` 并重新 `npm run build:plugin` |
| 2026-07-29 | `voice-agents/jarvis-ai-voice-dialog/src/App.tsx` | 4 处 `AnimatePresence` 内 `motion.div` 缺 key |
| 2026-07-29 | `voice-agents/jarvis-ai-voice-dialog/src/components/RemindersList.tsx` | 空状态 `<div>` 缺 key |
| 2026-07-29 | `typeless-keyboard-shortcut-guide/src/components/SandboxWorkspace.tsx` | `motion.div` 缺 key |
| 2026-07-29 | `typeless-keyboard-shortcut-guide/src/components/MacSettingsMockup.tsx` | `motion.div` 缺 key |

---

## Bug #002 — React 18 `createRoot` 重复挂载同一容器报错

**严重程度**：🔴 高（视图白屏，React 树崩溃）  
**复现次数**：已复现 3+ 次  
**影响范围**：所有实现了 `View` 子类的插件（`onboarding:view`、`workspace:view` 等）

### 错误症状

```
You are calling ReactDOMClient.createRoot() on a container that has already been 
passed to createRoot() before. Instead, call root.render() on the existing root 
instead if you want to update it.
```

### 根本原因

1. 插件 View 的 `onOpen()` 被二次调用（热重载、路由切换、宿主重新挂载）；
2. `this.container` 仍然保留着上次 React 18 在上面绑定的 `__reactContainer$` 内部属性；
3. 直接对 `this.container` 调用 `createRoot()` 触发 React 18 的冲突检测报错。

### ✅ 解决方案：DOM Sub-Container Pattern

```typescript
export class MyView extends View {
  private root: ReturnType<typeof createRoot> | null = null;
  private subContainer: HTMLDivElement | null = null;

  async onOpen(opts?: { container?: HTMLDivElement }) {
    if (opts?.container) this.container = opts.container;
    if (!this.container) return;

    // 每次都在新的 subContainer 上 createRoot，而不是直接在 this.container 上
    if (!this.subContainer || !this.container.contains(this.subContainer)) {
      this.container.innerHTML = '';
      this.subContainer = document.createElement('div');
      this.subContainer.className = 'w-full h-full';
      this.container.appendChild(this.subContainer);
      this.root = createRoot(this.subContainer);
    } else if (!this.root) {
      this.root = createRoot(this.subContainer);
    }

    this.root?.render(<MyComponent />);
  }

  async onClose() {
    if (this.root) {
      const rootToUnmount = this.root;
      this.root = null;
      // 微任务延迟 unmount，避免 React 批处理冲突
      queueMicrotask(() => {
        try { rootToUnmount.unmount(); } catch { /* ignore */ }
      });
    }
    if (this.subContainer?.parentNode) {
      this.subContainer.parentNode.removeChild(this.subContainer);
    }
    this.subContainer = null;
    if (this.container) this.container.innerHTML = '';
  }
}
```

详见 [04-plugin-types.md](./04-plugin-types.md) 中的完整规范。

---

## Bug #003 — 插件 `activate()` 写了但从不执行（无声失败）

**严重程度**：🔴 高（所有 MCP 工具不可用，完全静默）  
**复现次数**：已复现 4+ 次  
**影响范围**：`type: "background"` 或 `type: "hybrid"` 插件

### 错误症状

- `plugin_manager_get_logs` 没有任何输出（连"插件启动"日志都没有）
- `plugin_manager_list_tools` 返回空列表
- 调用 MCP 工具报 `tool not found`

### 根本原因

`background` 插件通过 `utilityProcess.fork()` 作为独立 Node.js 子进程运行。ESM 模块只负责**导出** `activate()` 函数，子进程启动后不会自动调用它。

### ✅ 修复：在文件末尾手动调用

```typescript
// src/index.ts 末尾必须加这一行
activate().catch(err => {
  console.error('[Plugin] 激活失败:', err);
});
```

---

## Bug #004 — OEM 插件路径 / 环境 URL 在测试环境仍指向生产服务器

**严重程度**：🟡 中（测试环境数据污染生产）  
**复现次数**：已复现 2+ 次（2026-07-29）  
**影响范围**：涉及网络请求的插件（如 voice-agents、berrytrace-online）

### 错误症状

开发/测试环境中，插件请求 URL 仍然是 `https://berrytrace.getdear.cn`（生产环境），而不是 `https://dev-berrytrace.getdear.cn`（测试环境）。

### 根本原因

插件内部硬编码了 API Base URL，没有读取宿主注入的环境配置；或者读取的是 `window.electronAPI.oem.getOEMConfig()` 但漏掉了对 `env` 字段的判断。

### ✅ 解决方案

插件中获取环境 URL 必须通过宿主 API 动态读取，**禁止硬编码**：

```typescript
const cfg = await window.electronAPI.oem.getOEMConfig();
// cfg.env === 'development' | 'production' | 'test'
// cfg.apiBaseUrl 由宿主根据当前环境自动注入
const baseUrl = cfg.apiBaseUrl ?? 'https://berrytrace.getdear.cn';
```

---

## Bug #005 — `window.electronAPI` 在插件 panel 渲染进程中为 `undefined`

**严重程度**：🔴 高（功能完全不可用）  
**复现次数**：已复现 3+ 次  
**影响范围**：新创建的 panel 插件

### 错误症状

```
TypeError: Cannot read properties of undefined (reading 'callApi')
// 或
window.electronAPI is undefined
```

### 根本原因

panel 插件通过 `BrowserView` / `WebContents` 渲染，它运行在**受限的浏览器沙箱**中。`window.electronAPI` 由宿主 `preload.js` 注入，但插件沙箱的 preload 只注入了**通用插件 SDK**，而不是完整的 `electronAPI`。

插件必须通过 **`berrytrace-plugin-sdk`** 提供的 `sdk.*` 方法访问宿主能力。

**例外**：`builtin-plugins/` 内置插件直接运行在宿主渲染进程中，**可以**使用 `window.electronAPI`。

### ✅ 解决方案

```typescript
// ❌ 错误 — panel 插件不能用 window.electronAPI
const result = await window.electronAPI.filesystem.readFile(path);

// ✅ 正确 — 用 SDK
const result = await sdk.filesystem.readFile(path);

// ✅ 也可以通过通用 callApi
const result = await sdk.system.callApi('filesystem', 'readFile', [path]);
```

---

## Bug #006 — 插件热重载后界面"闪回旧内容"（Stale Closure / 状态未清理）

**严重程度**：🟡 中（视觉异常，不影响最终正确性）  
**复现次数**：已复现 2+ 次  
**影响范围**：使用 `zustand` store 或模块级单例的插件

### 错误症状

热重载后，界面短暂显示旧数据（旧的 store 状态），然后才更新为最新状态。

### 根本原因

插件 `onClose()` 未正确重置 Zustand store 或模块级单例（如 `OnboardingMachine.getInstance()`）的状态。热重载时，新代码重新挂载，但旧的全局状态仍然存在，导致 UI 短暂读到了旧值。

### ✅ 解决方案

在 `onClose()` 中显式重置所有 store 状态：

```typescript
async onClose() {
  // 重置 store（推荐 store 提供标准 reset() action）
  useMyStore.getState().reset();
  // 销毁单例
  MySingleton.destroy();
  // 最后 unmount React 树
  this.root?.unmount();
  this.root = null;
}
```

推荐在 Zustand store 中统一提供 `reset()` action：

```typescript
const useMyStore = create<MyState>((set) => ({
  data: null,
  loading: false,
  reset: () => set({ data: null, loading: false }),  // 标准 reset
}));
```

---

## Bug #007 — `sdk.events.emit(...)` 在 background 进程中无法触发 UI 更新

**严重程度**：🟡 中（事件丢失，UI 不响应）  
**复现次数**：已复现 2+ 次  
**影响范围**：hybrid 类型插件的 background → UI 通信

### 错误症状

background 进程调用 `sdk.events.emit('my:event', data)` 后，panel（UI）端的事件监听器没有收到消息。

### 根本原因

`sdk.events.emit` 在 background 进程中走 **IPC 管道**（`background → 宿主主进程 → 宿主渲染进程`）。如果 `plugin.json` 的 `contributes.events.emits` 中**没有声明**该事件，宿主主进程会过滤丢弃它。

### ✅ 解决方案

在 `plugin.json` 中显式声明所有要发射的事件：

```json
{
  "contributes": {
    "events": {
      "emits": ["my:event", "my:other-event"],
      "listens": ["system:ready"]
    }
  }
}
```

**注意**：`emits`（我发射）和 `listens`（我接收）是两个独立字段，两者默认都不转发，必须显式声明。

---

## Bug #008 — 插件自定义协议 `berrytrace-plugin://` 动态加载 `.mjs` / WebAssembly 模块被拦截

**严重程度**：🔴 高（导致 ONNX Runtime / VAD 无法初始化，语音/算法核心崩溃）  
**复现次数**：已复现 1+ 次（2026-07-31）  
**影响范围**：包含 WASM / `.mjs` 动态模块依赖的插件（如 voice-agents、VAD、WebAssembly AI 引擎）

### 错误症状

```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
[VoiceCoreEngine:setupMicVAD:FAILED] Error: no available backend found.
```

### 根本原因

1. 插件中动态 `import()` 加载 `.mjs` 脚本或 WASM 模板（如 `ort-wasm-simd-threaded.mjs`）。
2. 宿主自定义协议 `berrytrace-plugin://` 在响应请求时，MIME 类型判断逻辑缺少 `.mjs` 和 `.wasm` 识别，回退为 `application/octet-stream`。
3. Chromium 渲染进程依据 HTML 规范对 ESM 模块注入执行严格 MIME 类型校验 (Strict MIME Type Checking)，拒绝加载非 `application/javascript` 或 `text/javascript` 类型的脚本，导致后端加载失败。

### ✅ 解决方案（SSOT 动态 MIME 类型解析与二进制 fallback 校验）

宿主已在 [protocol-handler.ts](file:///Users/li/work/work/berrytrace_app/electron/services/protocol-handler.ts) 中重构了 `getMimeType(filePath, buffer)`：
1. **已知类型映射表 (`KNOWN_MIME_MAP`)**：覆盖标准 Web 脚本（.mjs/.cjs/.wasm）、压缩包（.zip/.rar/.7z/.tar）、文档（.pdf/.docx）、媒体（.mp4/.mp3/.webp）、AI 模型（.onnx/.pth/.safetensors/.gguf）等全量文件格式；
2. **未知自定义格式动态探测 (`isBinaryBuffer`)**：对于未预设的自定义扩展名（如 `.dat`, `.mydata`），自动采样文件前 1024 字节判断是否存在 `0x00` 空字节：
   * 包含 `0x00` ➔ 判定为二进制文件 `application/octet-stream`
   * 无 `0x00` ➔ 判定为文本文件 `text/plain; charset=utf-8`

```typescript
const mimeType = getMimeType(fullPath, data);
```

---

## Bug #009 — `keybindings` 绑定了 Command 但未注册 `shortcutActions` 导致 `Action not found`

**严重程度**：⚠️ 低（打印控制台 Warning，手势可能无法触发界面联动）  
**复现次数**：已复现 1+ 次（2026-07-31）  
**影响范围**：所有绑定物理手势/长按快捷键的插件

### 错误症状

```
[ShortcutActionRegistry] Action not found: com.berrytrace.plugin.voice-agents:ptt-start
```

### 根本原因

在 `plugin.json` 的 `contributes.keybindings` 中配置了快捷键/手势映射到的 `command` ID（如 `ptt-start`），但在 `contributes.shortcutActions` 列表中未申明对应的 Action ID 与描述元数据，导致 `ShortcutActionRegistry` 查找失败报警。

### ✅ 解决方案

在 `plugin.json` 的 `contributes.shortcutActions` 中补全所有关联 Command 的 Action 注册：

```json
"shortcutActions": [
  {
    "id": "com.berrytrace.plugin.voice-agents:ptt-start",
    "label": "按键通话 — 按住开始录音",
    "icon": "<svg>...</svg>"
  }
]
```

---

## 维护指南

当你修复了一个"修好又复发"的 Bug，按此模板追加：

```markdown
## Bug #XXX — [一句话描述问题]

**严重程度**：🔴 高 / 🟡 中 / ⚠️ 低  
**复现次数**：已复现 X+ 次  
**影响范围**：[受影响的插件类型/场景]

### 错误症状
[控制台输出 / 现象描述]

### 根本原因
[为什么会这样，用"因为...所以..."的结构说清楚]

### ✅ 解决方案
[最小可行的修复代码/步骤]

### 历史修复记录（可选）
| 日期 | 文件 | 修复内容 |
```
