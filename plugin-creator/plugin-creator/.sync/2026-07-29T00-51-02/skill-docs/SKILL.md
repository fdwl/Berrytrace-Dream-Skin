---
name: plugin-creator
description: BerryTrace 插件开发指南。创建、修改、调试 BerryTrace 插件，或将现有的 GitHub 代码库、NPM 命令行工具包包装/封装为可供 AI 调用的本地插件与 MCP 工具。
last_synced_git: 73e0e5451d2676e00efe027fa18bb5ccdf6c621d
---

# BerryTrace 插件开发指南

## 怎么做 → 得到什么

UI 注册、命令、菜单、激活条件全部在 `plugin.json` 声明，不写代码。

| 要做的事 | 写在 `plugin.json` | 状态 |
|---------|-------------------|:---:|
| 声明事件订阅/发射 | `contributes.events` | ✅ 已实现 |
| 加划词菜单 | `contributes.selectionMenuItems` | ✅ 已实现 |
| 加快捷动作 | `contributes.shortcutActions` | ✅ 已实现 |
| 加侧边栏图标 | `contributes.ribbonIcons` | ✅ 已实现 |
| 加工作区标签页 | `contributes.workspaceViews` | ✅ 已实现 |
| 加命令 | `contributes.commands` | ✅ 已实现 |
| 加右键菜单 | `contributes.folderContextMenuItems` | ✅ 已实现 |
| 控制启动时机 | `activationEvents` | ✅ 已实现 |
| 文件类型关联 | `fileAssociations` | ✅ 已实现 |

---

## 参考文档

| 主题 | 文件 |
|------|------|
| 架构 | [01-architecture.md](./references/01-architecture.md) |
| 快速上手 | [02-quickstart.md](./references/02-quickstart.md) |
| plugin.json 规范 | [03-plugin-json.md](./references/03-plugin-json.md) |
| 插件类型 | [04-plugin-types.md](./references/04-plugin-types.md) |
| SDK 导入 | [05-sdk-setup.md](./references/05-sdk-setup.md) |
| 声明式贡献 | [06-contributions.md](./references/06-contributions.md) |
| **运行时 API（入口）** | [07-runtime-api.md](./references/07-runtime-api.md) |
| 　├ system 系统 | [07a-system.md](./references/07a-system.md) |
| 　├ filesystem 文件系统 | [07b-filesystem.md](./references/07b-filesystem.md) |
| 　├ storage 存储 | [07c-storage.md](./references/07c-storage.md) |
| 　├ ai / mcp | [07d-ai-mcp.md](./references/07d-ai-mcp.md) |
| 　├ window / dialog / log | [07e-window.md](./references/07e-window.md) |
| 　├ workspace 系列 | [07f-workspace.md](./references/07f-workspace.md) |
| 　├ local-ai / search | [07g-local-ai-search.md](./references/07g-local-ai-search.md) |
| 　├ publish / user | [07h-publish-user.md](./references/07h-publish-user.md) |
| 　├ hooks | [07i-hooks.md](./references/07i-hooks.md) |
| 　├ 系统事件 | [07y-events.md](./references/07y-events.md) |
| 　└ 回调注册 | [07z-callbacks.md](./references/07z-callbacks.md) |
| 　└ 回调注册（详细签名） | [20-callback-signatures.md](./references/20-callback-signatures.md) |
| 　└ hooks（详细说明） | [21-hooks-detail.md](./references/21-hooks-detail.md) |
| 构建 | [08-build.md](./references/08-build.md) |
| 开发工作流 | [09-workflow.md](./references/09-workflow.md) |
| 验证 | [10-verification.md](./references/10-verification.md) |
| 排错 | [11-troubleshooting.md](./references/11-troubleshooting.md) |
| **代码缺口** | [12-gap.md](./references/12-gap.md) |
| **启动与生命周期** | [13-startup.md](./references/13-startup.md) |
| **MCP 开发工具** | [14-mcp-tools.md](./references/14-mcp-tools.md) |
| **测试** | [15-testing.md](./references/15-testing.md) |
| **发布** | [16-publishing.md](./references/16-publishing.md) |
| **插件事件总览** | [22-plugin-events.md](./references/22-plugin-events.md) |
| **npm 与代码复用** | [17-npm.md](./references/17-npm.md) |
| **代码规范** | [18-code-style.md](./references/18-code-style.md) |
| **事件系统** | [19-events.md](./references/19-events.md) |
| **API 映射** | [api-map.json](./api-map.json) |
| **错误码** | [error-map.json](./error-map.json) |
| **本地小型 LLM 调试与调用** | [23-local-llm.md](./references/23-local-llm.md) |

---

## 快速决策树

```
用户需求
  │
  ├─ "需要一个界面/窗口"
  │   → type: "panel"   view: "dist/index.js"
  │
  ├─ "需要后台服务（无 UI）"
  │   → type: "background"   main: "dist/index.js"
  │
  ├─ "需要 UI + 后台服务"
  │   → type: "hybrid"   main + view 各独立文件
  │
  └─ "不确定"
      → 默认 type: "panel"
```

---

## 关键规则

1. `plugin.json` 声明优先 — 菜单、激活条件、事件订阅、文件关联都在此声明
2. 入口分离 — `main`(Node.js) 和 `view`(浏览器) 必须独立文件，不可混用 API
3. ID 规范 — `com.berrytrace.plugin.{name}-{uuid}`，name 为 kebab-case 英文
4. panel 类型不要写 `main` 字段
5. 回调 API 在后台 — `sdk.mcp.registerToolHandler`、`sdk.commands.registerHandler` 必须在 background/hybrid 的 main 中注册
6. `sdk.storage`、`sdk.ai`、`sdk.filesystem` 等 JSON 序列化 API 渲染进程和后台进程都能用
7. panel 类型不需要 `activate()` / `deactivate()`
8. 事件驱动加载 — `contributes.events.listens` 声明的事件会自动唤醒未运行的插件，注意控制声明范围
9. 事件声明规范 — `listens` 声明监听的事件，`emits` 声明发射的事件，未声明的事件不会推送给该插件
10. OEM 内置插件 — 在 `oem.config.json` 的 `builtinPlugins` 白名单中的插件始终启用，用户无法禁用
11. view 构建使用全局 shim — `berrytrace-plugin-sdk`、`react`、`react-dom`、`zustand`、`lucide-react` 均从 `window` 全局变量读取，无需 external；新增宿主全局变量时需同步更新 `plugins-sdk/cli.js` 的 shim 列表（参见代码注释）
12. 进程隔离 — `required`/`recommended` 独立进程，`optional` 共享池，不做运行时动态切换
13. View 容器隔离与 createRoot 生命周期 — 编写 `View` 视图子类时，严禁直接对 `this.container` 调用 `createRoot`。必须创建内部 `subContainer = document.createElement('div')` 追加到 `this.container` 后对其调用 `createRoot`，并在 `onClose` 时解绑移除 `subContainer`，防止重载或重复打开时抛出 "passed to createRoot() before" 错误。

---

## 开发工具（MCP Host Tools）

AI 在 BerryTrace 宿主中可调用以下工具完成开发流程：

| 工具 | 用途 |
|------|------|
| `plugin_manager_load_unpacked` | 首次加载插件<br>`{ path: "plugins-dev/xxx" }` |
| `plugin_manager_reload` | 构建后热重载<br>`{ pluginId: "..." }` |
| `plugin_manager_get_logs` | 查看插件日志<br>`{ pluginId: "...", limit: 30 }` |
| `plugin_manager_list_tools` | 查看插件注册的 MCP 工具列表<br>`{ pluginId: "..." }` |
| `plugin_manager_get_tool` | 查询单个 MCP 工具状态和 schema<br>`{ pluginId: "...", toolName: "..." }` |
| `plugin_manager_enable_plugin` | 启用插件<br>`{ pluginId: "..." }` |
| `plugin_manager_disable_plugin` | 禁用插件<br>`{ pluginId: "..." }` |
| `capability_search` | 搜索 Agent 能力（MCP 工具 + Skill）<br>`{ query: "..." }` |

**完整开发循环**：

```
改代码 → npm run build → plugin_manager_reload → plugin_manager_get_logs
```

---

## 脚本工具

skill 自带 `scripts/` 目录，包含以下工具：

| 脚本 | 用途 |
|------|------|
| `scripts/generate-uuid.js` | 生成插件 UUID |
| `scripts/berrytrace-cli.js` | 插件脚手架 CLI（create / pack / publish） |
| `scripts/berrytrace-sdk.js` | SDK 运行时（供测试 mock 或离线参考） |

<!-- API_INDEX_START -->
| 模块 | 文件 | 方法数 |
|------|------|--------|
| system | [07a-system.md](./references/07a-system.md) | 14 |
| filesystem | [07b-filesystem.md](./references/07b-filesystem.md) | 14 |
| storage | [07c-storage.md](./references/07c-storage.md) | 5 |
| ai / mcp | [07d-ai-mcp.md](./references/07d-ai-mcp.md) | 13 |
| window / dialog / log / commands | [07e-window.md](./references/07e-window.md) | 21 |
| workspace / scheduler / plugin / context / selectionMenu | [07f-workspace.md](./references/07f-workspace.md) | 31 |
| local-ai / search | [07g-local-ai-search.md](./references/07g-local-ai-search.md) | 2 |
| user | [07h-publish-user.md](./references/07h-publish-user.md) | 5 |
| hooks | [07i-hooks.md](./references/07i-hooks.md) | 3 |
| 系统事件 | [07y-events.md](./references/07y-events.md) | — |
| 回调注册 | [07z-callbacks.md](./references/07z-callbacks.md) | 17 |
<!-- API_INDEX_END -->
