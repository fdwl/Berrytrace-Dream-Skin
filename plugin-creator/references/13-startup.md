# 13 — 插件启动与生命周期

## 启动阶段

应用启动分 4 个阶段：

| 阶段 | 触发时机 | 执行内容 |
|------|---------|---------|
| **Phase 1: 核心同步** | `app.whenReady()` | 数据库初始化 → 创建主窗口 → `PluginManager.initEarly()` —— 仅加载 `startupPriority: "high"` 的插件 |
| **Phase 2: 界面渲染** | 浏览器 `did-finish-load` | 销毁 Splash → 显示主窗口 → 工作区路径就绪 |
| **Phase 3: 延迟服务** | Phase 2 后 1s | `PluginManager.initDeferred()` 加载普通优先级插件 → 注册快捷键/菜单/划词 |
| **Phase 4: 重度服务** | Phase 2 后 10s / 空闲时 | 启动 LocalAI、全文索引等重量级服务 |

## startupPriority

在 `plugin.json` 中配置：

```json
{
  "startupPriority": "normal"
}
```

| 值 | 加载时机 | 适用场景 |
|----|---------|---------|
| `"high"` | Phase 1 | 基础编辑器、核心渲染插件（限 1-2 个） |
| `"normal"` | Phase 3 | 默认值，功能插件、AI 内核、后台同步 |

## 事件驱动的按需加载

插件通过 `plugin.json` 的 `contributes.events.listens` 声明关心的事件。当事件触发时，宿主自动唤醒未运行的插件。

```
事件触发 → EventSubscriptionRegistry 查询订阅者
  → 插件已运行 → 直接转发 sdk:events:on
  → 插件未运行 → ensurePluginLoaded → 创建进程 → 重放触发事件
```

**示例**：

```json
{
  "contributes": {
    "events": {
      "listens": [
        { "name": "agent:step_update", "description": "监听 Agent 步骤状态" }
      ]
    }
  }
}
```

当 `agent:step_update` 事件触发时，即使插件尚未加载，宿主也会自动启动该插件并将事件重放给它。

## 事件触发的激活方式

除了 `activationEvents`，以下事件也能触发按需加载：

| 触发方式 | 来源 | 说明 |
|---------|------|------|
| `onView:{viewId}` | 用户打开视图 | `activationEvents` 声明 |
| `onCommand:{id}` | 执行命令 | `activationEvents` 声明 |
| `onMcpCall:{name}` | AI 调用 MCP 工具 | `activationEvents` 声明 |
| `onFileExtension:{ext}` | 打开文件 | `activationEvents` 声明 |
| `contributes.events.listens` | 平台/自定义事件 | 事件驱动自动唤醒 |

## 插件销毁时机

| 销毁条件 | 说明 |
|---------|------|
| **空闲超时** | 后台插件 5 分钟无活动 → 自动卸载（`PLUGINS_IDLE_TIMEOUT_MS`） |
| **用户禁用** | 用户在设置中禁用插件 → `deactivatePlugin()` |
| **插件卸载** | 用户卸载插件 → `uninstallPlugin()` |
| **热重载** | 开发模式下重新加载 → 先卸载再加载 |
| **进程崩溃** | Watchdog 检测到崩溃 → 尝试重启（最多 3 次） |

**常驻插件**（不参与空闲回收）：

- `com.berrytrace.plugin.desktop-pet`
- `com.berrytrace.plugin.voice-assistant`
- `com.berrytrace.plugin.daily-chronicle`
- `berrytrace-mastra-agent-plugin`
- `berrytrace-cline-agent-plugin`

## 完整生命周期图

```
插件声明
  plugin.json → contributes.events.listens → EventSubscriptionRegistry 索引
  plugin.json → activationEvents → 激活条件索引

启动
  Phase 1: startupPriority:"high" 插件立即加载
  Phase 3: startupPriority:"normal" 插件延迟加载
  按需: 事件触发 / 用户操作 → ensurePluginLoaded

运行
  sdk.events.on() → 注册事件监听
  sdk.events.emit() → 发射事件
  → 广播给已运行的订阅者
  → 唤醒未运行的订阅者

空闲回收
  5 分钟无活动 → 自动卸载
  → EventSubscriptionRegistry 保留声明（不删除）
  → 下次事件触发时重新唤醒

销毁
  禁用/卸载 → deactivatePlugin()
  → 注销 MCP 工具
  → 注销事件订阅
  → 注销划词菜单/快捷动作
  → 停止进程
  → 关闭子窗口
```

## 热重载生命周期

```
改代码 → npm run build → plugin_manager_reload → plugin_manager_get_logs
```

热重载时必须清理：
- MCP 工具注销
- IPC 监听注销
- 子窗口销毁
- 文件句柄释放

## activate(context) 生命周期钩子参数

在插件的 `main` 入口中，`activate(context)` 接收宿主传递的 `context` 生命周期上下文：

```typescript
export interface PluginLifecycleContext {
  action: 'install' | 'initial-load' | 'enable' | 'disable' | 'uninstall' | 'reload' | 'normal';
  loadMode: 'setup' | 'normal';
  updatedAt: string;
  trigger?: {
    eventName: string;
    payload: unknown;
  };
}

export async function activate(context?: PluginLifecycleContext): Promise<void> {
  console.log(`[my_plugin] 激活运行，触发动作: ${context?.action || 'normal'}`);

  // 1. 判断是否为首次安装 (install) 或缓存缺失
  const isFirstInstall = context?.action === 'install';
  
  if (isFirstInstall) {
    // 首次安装：执行全量环境探索/初始化建图，生成本地缓存与声明文件
    await performInitialSetupAndCaching();
  } else {
    // 按需唤醒：检查 48h TTL 缓存，效期内直接复用缓存，跳过昂贵搜盘
    await loadWithTtlCache();
  }
}
```

### 生命周动作 (`context.action`) 说明：

| action | 触发场景 | 插件推荐行为 |
| :--- | :--- | :--- |
| **`'install'`** | 用户或系统首次安装该插件 | **强制全量初始化**：搜盘环境、建立初始数据库、生成 `declared-contributions.json` |
| **`'initial-load'`** | 软件启动时的首次加载 | 优先读取本地缓存，验证效期，快速响应 |
| **`'enable'`** | 用户在设置中手动启用插件 | 恢复背景服务与事件监听 |
| **`'disable'`** | 用户在设置中手动禁用插件 | 清理定时器，关闭连接 |
| **`'reload'`** | 开发者热重载 (`berrytrace-cli reload`) | 重置本地变量，重新加载新配置 |
| **`'normal'`** | 响应事件 / 按需唤醒 | 执行特定任务 |

---

## 动态生成式声明文件 (Generative Declared Contributions)

为了兼顾“零开机开销”与“动态菜单/视图暴露”，插件可在首次安装 (`install`) 或首次激活时，将扫描到的环境贡献写入数据目录：

- **保存路径**：`pluginData/<cleanPluginId>/.berrytrace/declared-contributions.json`
- **文件格式**：
  ```json
  {
    "contributes": {
      "tabCreateMenuItems": [ ... ],
      "subagents": [ ... ]
    }
  }
  ```

**宿主工作机制**：
宿主启动在 `PluginScanner` 阶段解析 `plugin.json` 时，会自动尝试读取该 `declared-contributions.json` 并与 manifest 的 `contributes` 进行深度合并。**这意味着下次应用启动时，即使插件完全不被拉起运行，宿主也能静态感知并展示插件探出的菜单、Sub-Agent 与 Tab 项！**

---

## 完整加载流程

```
app.whenReady()
  → PluginManager.initEarly()          // Phase 1: 高优先级插件
  → 主窗口渲染
  → PluginManager.initDeferred()       // Phase 3: 普通插件
      → PluginLauncher.spawn()          // utilityProcess 后台进程
      → SDK 初始化（createPluginSDK）
      → activate(context)               // 传入 context.action ('install' | 'normal' ...)
      → 注册 MCP 工具/回调
  → 定期检查热重载
```

| 值 | 加载时机 | 适用场景 |
|----|---------|---------|
| `"high"` | Phase 1 | 基础编辑器、核心渲染插件（限 1-2 个） |
| `"normal"` | Phase 3 | 默认值，功能插件、AI 内核、后台同步 |

## 按需激活（4 种触发方式）

### 1. 用户操作触发

通过 `berrytrace://` 协议、关联文件、命令面板等触发未加载的插件，`PluginManager.ensurePluginLoaded(pluginId)` 实时加载。

### 2. 事件自动唤醒

**核心机制**：当事件发生时，宿主自动加载声明了该事件的所有未运行 background 插件。

```
事件发射 → EventSubscriptionRegistry.getSubscribers(eventName)
         → 对每个 subscriber:
            ├─ 已运行 → 直接 postMessage 转发
            └─ 未运行 → ensurePluginLoaded() 自动启动 → 转发事件
```

**插件必须在 plugin.json 中声明才能收到事件**：

```json
{
  "contributes": {
    "events": {
      "listens": [{ "name": "agent:step_update", "description": "监听 Agent 步骤状态" }],
      "emits": [{ "name": "my-plugin:dataReady", "description": "数据就绪通知" }]
    }
  }
}
```

未声明的事件会被 `EventSubscriptionRegistry` 静默忽略——`sdk.events.on()` 代码能执行但永远收不到消息。

### 3. MCP 工具触发

AI 调用插件注册的 MCP 工具时，若插件未运行，`MCP Host` 自动调用 `ensurePluginLoaded()` 加载后再执行。

### 4. activationEvents 声明触发

```json
{ "activationEvents": ["onView:my-editor", "onCommand:myPlugin.search", "onFileExtension:md", "onMcpCall:my_tool"] }
```

不声明 → 插件不自动启动（除非被事件唤醒或 MCP 触发）。

---

## 插件销毁

### 空闲自动卸载

background 插件在空闲超过阈值后自动卸载以释放内存：

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `idleTimeout` (plugin.json) | 5 分钟 | 插件自定义空闲超时（毫秒） |

空闲判定：`recordPluginActivity()` 在每次 API 调用和事件接收时更新。超时后 `PluginManager` 自动调用 `deactivatePlugin()`。

### 手动卸载

```typescript
// 插件主动请求卸载（释放内存）
sdk.plugin.requestUnload();

// 宿主侧
PluginManager.deactivatePlugin(pluginId);
```

### 卸载清理清单

卸载时宿主自动执行：
1. 注销 `EventSubscriptionRegistry` 中的所有事件订阅
2. 注销 MCP 工具、selectionMenuItems、shortcutActions
3. 停止后台进程（utilityProcess / child_process）
4. 关闭浮动窗口
5. 渲染进程调用 `onunload(context)` 钩子

### 崩溃重启

`PluginWatchdog` 监控所有 background 进程：
- 心跳超时（15s）→ kill + restart
- 内存 OOM（95% 堆，连续 6 次）→ restart
- CPU 过载（>95%）→ kill + restart
- 最多重启 3 次 / 3 分钟冷却窗口

---

## 完整加载流程

```
app.whenReady()
  → PluginManager.initEarly()          // Phase 1: 高优先级插件
  → 主窗口渲染
  → PluginManager.initDeferred()       // Phase 3: 普通插件
      → PluginLauncher.spawn()          // utilityProcess 后台进程
      → SDK 初始化（createPluginSDK）
      → activate()
      → 注册 MCP 工具/回调
  → 定期检查热重载
  → 定期检查空闲超时 → 自动卸载
```
