# 01 — 架构

## 进程模型

```
┌─ 主进程 (Electron Main) ─────────────────────────────┐
│  PluginManager, PluginLauncher                        │
│  EventSubscriptionRegistry（事件订阅索引）              │
│                                                      │
│  ┌─ utilityProcess（Node.js 独立进程）────────┐      │
│  │  type: background 插件                      │      │
│  │  type: hybrid 的 main 入口                  │      │
│  │  可用: 完整 Node.js + berrytrace SDK        │      │
│  │  职责: MCP 工具、文件系统、后台任务            │      │
│  └────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
         │  IPC
┌─ 渲染进程 (Renderer) ────────────────────────────────┐
│  window.electronAPI（统一 IPC 桥）                    │
│                                                      │
│  ┌─ 插件 UI（动态 import）────────────────────┐      │
│  │  type: panel 插件                          │      │
│  │  type: hybrid 的 view 入口                  │      │
│  │  可用: 浏览器 API + berrytrace SDK（Proxy）  │      │
│  │  职责: UI 渲染、用户交互                     │      │
│  └────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
```

## 插件类型

| type | main 入口 | view 入口 | 运行位置 |
|------|----------|----------|---------|
| `panel` | 不需要 | 必填 | 渲染进程 |
| `background` | 必填 | 不需要 | utilityProcess |
| `hybrid` | 必填 | 必填 | utilityProcess + 渲染进程 |
| `main` | 必填 | 不需要 | 主进程 |

## OEM 内置插件机制

宿主支持 OEM 配置（`oem.config.json`），可以预置内置插件：

- `builtinPlugins`: 白名单数组，指定哪些插件为 OEM 内置
- 内置插件在生产环境下自动标记为 `APPROVED` 状态，用户无法禁用
- 内置插件目录：打包后 `dist/plugins/`，开发时 `builtin-plugins/`
- 扫描顺序：用户安装插件 → OEM 内置插件（白名单过滤）

```json
// oem.config.json 示例
{
  "oemId": "partner",
  "appName": "合作方应用",
  "appId": "com.partner.app",
  "apiGateway": "https://api.partner.com",
  "builtinPlugins": ["com.berrytrace.plugin.online"]
}
```

## plugin.json 加载流程

```
主进程 PluginManager
  → 扫描用户插件目录（~/.berrytrace/plugins/）
  → 扫描 OEM 内置插件目录（builtin-plugins/），白名单过滤
  → 根据 type 启动进程
     background/hybrid → PluginLauncher → utilityProcess
     main → 主进程内联
     panel/hybrid(view) → 等待渲染进程触发
  → 广播 plugins:list 到渲染进程
渲染进程 PluginRegistry
  → 接收 manifest 列表
  → import(pluginUrl) 动态加载 view 入口
  → 创建 SDK instance, 渲染 UI
```

## 事件驱动的插件生命周期

插件通过 `plugin.json` 的 `contributes.events` 声明事件注册（监听和发射），宿主根据声明自动管理插件的加载和销毁。

```
plugin.json 声明
  contributes.events.listens  → 声明本插件关心的事件
  contributes.events.emits    → 声明本插件会发射的事件

启动流程
  → PluginManager.performInit() 扫描所有 plugin.json
  → EventSubscriptionRegistry 构建订阅索引 Map<eventName, Set<pluginId>>
  → 注册 IPC 转发器（registerInteractionForwarders）
  → 仅加载 startupPriority:"high" 的插件

事件触发时
  → 主进程 broadcastSystemEvent / 插件 sdk:events:emit
  → 查询 EventSubscriptionRegistry 找到订阅者
  → 订阅者已运行 → 直接转发事件
  → 订阅者未运行 → 自动 ensurePluginLoaded → 唤醒插件 → 重放事件

空闲回收
  → 后台插件 5 分钟无活动 → 自动卸载（idle timeout）
  → 下次事件触发时重新唤醒
```

**核心机制：事件 = 插件的唤醒信号**

- 声明 `listens` 的插件会被事件自动唤醒（按需加载）
- 声明 `emits` 的插件在 `plugin.json` 中声明意图，便于工具链和 AI 了解数据流
- 未声明的事件不会推送给该插件（减少 70%+ IPC 冗余）

## SDK 通信路径

宿主采用**双通道旁路直连架构**进行通信分流：

1. **控制/低频通道（主进程中介）**：
   * 适用场景：调用系统 API（如文件系统、数据库写入、窗口创建）。
   * 通信路径：
     ```
     代码调用 sdk.storage.kv.set('key', 'value')
       → berrytrace SDK (Proxy)
       → window.electronAPI.callApi(namespace, method, args, pluginId)
       → IPC 到主进程
       → 权限校验 → 执行 → 返回结果
     ```

2. **高频/流式直连通道（Renderer ↔ Plugin Process 旁路直连）**：
   * 适用场景：AI 聊天流式响应（`stream-chunk`）、进度条事件（`progress:*`）、回调响应等。
   * 通信路径：
     ```
     后台进程 (sdk.postMessage / emit) 
       → MessagePort (Port2)
       → 操作系统底层网关/IPC 管道（完全绕过主进程）
       → MessagePort (Port1)
       → 渲染进程 (sdk.events.on / callback)
     ```
   * 优势：零主进程 Event Loop 阻塞，帧率稳定，心跳包不会因消息堆积而被饿死。这套直连在窗口重载/刷新时会自动重建握手进行自愈。

## 声明 vs 运行时（当前状态）

```
声明式（plugin.json）                      运行时（SDK API）
───────────                               ────────────────
contributes.selectionMenuItems  ✅        sdk.storage.kv.*  ✅
contributes.shortcutActions     ✅        sdk.storage.db.*  ✅
contributes.events              ✅        sdk.ai.chat       ✅
contributes.ribbonIcons         ✅        sdk.filesystem.*  ✅
contributes.workspaceViews      ✅        sdk.mcp.registerToolHandler  ✅
contributes.commands            ✅        sdk.window.create  ✅
contributes.folderContextMenuItems ✅     sdk.events.on      ✅
contributes.views               ✅        sdk.events.emit    ✅
contributes.settingsSections    ✅        sdk.workspace.registerView    ✅
contributes.voiceHandlers       ✅        sdk.workspace.registerRibbonIcon ✅
mcp.tools（声明）               ✅        sdk.commands.register  ✅
activationEvents                ✅        sdk.hooks.register  ✅
fileAssociations                ✅        sdk.scheduler.register  ✅
permissions                     ✅        sdk.user.*          ✅ (NEW)
                                               sdk.system.getAppInfo  ✅ (NEW)
                                               sdk.events.*          ✅
                                               sdk.settings.*        ✅ (NEW)
                                               sdk.selectionMenu.*   ✅
                                               sdk.host.*            ✅
                                               sdk.lifecycle.*       ✅
```
声明式（plugin.json）                      运行时（SDK API）
───────────────────                      ────────────────
contributes.selectionMenuItems  ✅        sdk.storage.kv.*  ✅
contributes.shortcutActions     ✅        sdk.storage.db.*  ✅
contributes.events              ✅        sdk.ai.chat       ✅
contributes.ribbonIcons         ✅        sdk.filesystem.*  ✅
contributes.workspaceViews      ✅        sdk.mcp.registerToolHandler  ✅
contributes.commands            ✅        sdk.window.create  ✅
contributes.folderContextMenuItems ✅     sdk.events.on      ✅
contributes.views               ✅        sdk.events.emit    ✅
contributes.settingsSections    ✅        sdk.workspace.registerView    ✅
contributes.voiceHandlers       ✅        sdk.workspace.registerRibbonIcon ✅
mcp.tools（声明）               ✅        sdk.commands.register  ✅
activationEvents                ✅        sdk.hooks.register  ✅
fileAssociations                ✅        sdk.scheduler.register  ✅
permissions                     ✅
```
