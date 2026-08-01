# 04 — 插件类型与入口规范

## 四种类型

| type | 运行环境 | 入口 | 典型场景 |
|------|---------|------|---------|
| `panel` | 渲染进程（浏览器） | `view` 文件 | 纯 UI 插件：编辑器、时钟、天气 |
| `background` | utilityProcess（Node.js） | `main` 文件 | 纯后台：数据同步、定时任务、MCP |
| `hybrid` | utilityProcess + 渲染进程 | `main` + `view` | UI + 后台：HTTP Server + 前端面板 |
| `main` | 主进程 | `main` 文件 | 系统级：全局快捷键、托盘 |

## 默认选择规则

当用户需求不明确时：

| 用户描述 | 选择 |
|---------|------|
| 涉及"看""显示""界面""窗口" | `panel` |
| 涉及"后台""服务""监听""同步" | `background` |
| 涉及"后台 + 界面""服务 + 面板" | `hybrid` |
| 涉及"快捷键""全局""系统" | `main` |
| 不确定 | **默认 `panel`** |

---

## `panel` — 纯 UI 插件

```json
{
  "type": "panel",
  "view": "dist/renderer.js"
}
```

```typescript
// src/renderer.tsx — 唯一入口
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

function App() {
  // ... UI 逻辑
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

- **不需要** `main` 字段
- **不需要** `activate()` / `deactivate()`
- UI 贡献通过 `plugin.json` 的 `contributes` 声明
- SDK 通过 Import Maps 或 esbuild shim 注入

---

## `background` — 纯后台插件

```json
{
  "type": "background",
  "main": "dist/background.js"
}
```

```typescript
// src/background.ts
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  sdk.log.info('后台服务启动');

  // 注册 MCP 工具
  sdk.mcp.registerToolHandler('my_tool', async (args) => {
    return { content: [{ type: 'text', text: `处理: ${args.input}` }] };
  });

  // 注册事件监听
  sdk.events.on('clipboard-change', (data) => {
    sdk.log.info('剪贴板变化:', data);
  });
}

export async function deactivate() {
  sdk.log.info('后台服务停止');
}

// utilityProcess 必须自激活
activate().catch(err => {
  console.error('[Plugin] 激活失败:', err);
});
```

- 必须有自激活调用 `activate().catch(...)`
- 不需要 `view` 字段
- 不需要 `contributes`（无 UI）

---

## `hybrid` — UI + 后台插件

```json
{
  "type": "hybrid",
  "main": "dist/background.js",
  "view": "dist/renderer.js"
}
```

### 后台入口 (`src/background.ts`)

```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  // 启动后台服务
  // 注册 MCP 工具、事件监听等
  sdk.mcp.registerToolHandler('my_tool', async (args) => {
    return { content: [{ type: 'text', text: 'OK' }] };
  });
}

export async function deactivate() {
  // 清理资源
}

activate().catch(err => console.error(err));
```

### UI 入口 (`src/renderer.tsx`)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

function App() {
  // ... UI 逻辑，可以用 sdk 进行数据操作
  return <div>Hybrid Plugin UI</div>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

**关键规则**：
- `main` 和 `view` 是两个**完全独立**的文件
- `main` 不可引用浏览器 API（DOM、React）
- `view` 不可引用 Node.js API（fs、path）
- UI 贡献（Ribbon、View 等）在 `plugin.json` 的 `contributes` 声明

---

## `main` — 主进程插件

```json
{
  "type": "main",
  "main": "dist/index.js"
}
```

```typescript
// src/index.ts
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  sdk.log.info('主进程插件启动');
  // 注册全局快捷键、系统托盘等
}
```

- 运行在主进程上下文，有完整 Electron 权限
- 谨慎使用，权限最大

---

## 入口文件对比

| type | 入口文件 | 导出什么 | 如何激活 |
|------|---------|---------|---------|
| `panel` | `view` 文件 | React 组件（默认） | `plugin.json` 的 `contributes` |
| `background` | `main` 文件 | `activate()` / `deactivate()` | `activate().catch(...)` 自激活 |
| `hybrid` | `main` + `view` 两个文件 | 后台: `activate()` / `deactivate()`<br>UI: React 组件 | 后台自激活，UI 由 contributes 触发 |
| `main` | `main` 文件 | `activate()` | 主进程自动调用 |

---

## SDK View 视图子类与 React 18 `createRoot` 生命周期规范 (CRITICAL)

当实现 `View` 视图子类（如注册 `onboarding:view`, `workspace:view` 等自定义 View 扩展）时，**严禁直接在 `this.container` 上调用 `createRoot(this.container)`**！

### 为什么不能直接在 `this.container` 上 `createRoot`？
1. React 18 的 `createRoot` 会在传入的 DOM 节点上标记 `__reactContainer$` 内部属性。
2. 视图重新加载、热重载或快速切换时，`onClose()` 通常使用微任务异步调用 `root.unmount()`，如果在此期间 `onOpen()` 被二次触发，`this.root` 为 `null` 但 `this.container` 上的 React 18 容器标记尚未被移除。
3. 直接调用 `createRoot(this.container)` 会触发 React 18 的抛错：`You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before.`

### 推荐的标准防线范式 (DOM Sub-Container Pattern)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { View } from 'berrytrace-plugin-sdk';
import MyViewComponent from './components/MyViewComponent.js';

export class MyPluginWorkspaceView extends View {
  private root: ReturnType<typeof createRoot> | null = null;
  private subContainer: HTMLDivElement | null = null;

  getViewType() {
    return 'my-plugin:workspace';
  }

  getDisplayText() {
    return '我的自定义视图';
  }

  async onOpen(opts?: { container?: HTMLDivElement }) {
    if (opts?.container) {
      this.container = opts.container;
    }
    if (!this.container) return;

    // 隔离防线：保证每次 createRoot 挂载在独立的 DOM 子节点上
    if (!this.subContainer || !this.container.contains(this.subContainer)) {
      this.container.innerHTML = '';
      this.subContainer = document.createElement('div');
      this.subContainer.className = 'w-full h-full min-h-0 flex-1 flex flex-col';
      this.container.appendChild(this.subContainer);
      this.root = createRoot(this.subContainer);
    } else if (!this.root) {
      this.root = createRoot(this.subContainer);
    }

    if (this.root) {
      this.root.render(<MyViewComponent />);
    }
  }

  async onClose() {
    if (this.root) {
      const rootToUnmount = this.root;
      this.root = null;
      queueMicrotask(() => {
        try {
          rootToUnmount.unmount();
        } catch {
          /* ignore */
        }
      });
    }
    if (this.subContainer && this.subContainer.parentNode) {
      this.subContainer.parentNode.removeChild(this.subContainer);
    }
    this.subContainer = null;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
```

---

## ⚠️ AnimatePresence 内所有子元素必须有 key (CRITICAL - 反复出现的高频 Bug)

> **这是整个项目中出现最频繁的 React warning，已修复超过 5 次，每次都因为习惯性忘记而复发！**

### 错误症状

```
Each child in a list should have a unique "key" prop.
Check the render method of `ForwardRef(motion.div)`.
```

### 根本原因

`AnimatePresence` (framer-motion) 需要追踪每个子元素的进入/退出状态，因此它的**所有直接子元素都必须有 `key` prop**，包括：
- 条件渲染的 `motion.div`（`{condition && <motion.div ...>}`）
- 三元运算符的两个分支（`condition ? <motion.div> : <div>`）
- `.map()` 返回的元素（通常已经有 key，但也要检查）

### ❌ 错误写法（条件渲染忘记加 key）

```tsx
// 错误！AnimatePresence 里的 motion.div 没有 key
<AnimatePresence>
  {isVisible && (
    <motion.div  // ← ⚠️ 缺少 key！
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      内容
    </motion.div>
  )}
</AnimatePresence>

// 错误！三元运算符两个分支都没有 key
<AnimatePresence>
  {isEmpty ? (
    <div>空状态</div>          // ← ⚠️ 缺少 key！
  ) : (
    items.map(item => (
      <motion.div key={item.id} ...>  // ← ✅ 这个有，但上面那个没有
      </motion.div>
    ))
  )}
</AnimatePresence>
```

### ✅ 正确写法（每个分支都有 key）

```tsx
// 正确！条件渲染的 motion.div 有 key
<AnimatePresence>
  {isVisible && (
    <motion.div
      key="my-panel"  // ← ✅ 必须有 key
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      内容
    </motion.div>
  )}
</AnimatePresence>

// 正确！三元运算符的每个分支都有 key
<AnimatePresence>
  {isEmpty ? (
    <div key="empty-state">空状态</div>  // ← ✅ 有 key
  ) : (
    items.map(item => (
      <motion.div key={item.id} ...>      // ← ✅ 有 key
      </motion.div>
    ))
  )}
</AnimatePresence>
```

### 规则摘要

**凡是写 `<AnimatePresence>` 的地方，必须立刻检查其直接子元素是否每一个都有 `key`。**

这个错误不是框架问题，是开发者习惯性遗忘，需要养成每次写 AnimatePresence 时立即检查 key 的习惯。

