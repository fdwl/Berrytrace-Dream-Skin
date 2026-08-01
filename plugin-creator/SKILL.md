---
name: plugin-creator
description: BerryTrace 插件开发指南。创建、修改、调试 BerryTrace 插件，或将现有的 GitHub 代码库、NPM 命令行工具包包装/封装为可供 AI 调用的本地插件与 MCP 工具。
last_synced_git: 68041f7bb7ef9b1278af7924b3c1fed7a831b0b1
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
| 	├ local-ai / search | [07g-local-ai-search.md](./references/07g-local-ai-search.md) |
| 	├ **插件运行时（子进程/WS/HTTP代理）** | [07k-plugin-runtime.md](./references/07k-plugin-runtime.md) |
| 　├ publish / user | [07h-publish-user.md](./references/07h-publish-user.md) |
| 	├ hooks | [07i-hooks.md](./references/07i-hooks.md) |
| 	├ **UI / 主题** | [07j-ui-theme.md](./references/07j-ui-theme.md) |
| 	├ 系统事件 | [07y-events.md](./references/07y-events.md) |
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
| **🐛 高频奇葩问题 FAQ** | [99-known-tricky-bugs.md](./references/99-known-tricky-bugs.md) |

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
11. view 构建使用全局 shim — `berrytrace-plugin-sdk`、`react`、`react-dom`、`zustand`、`lucide-react`、`framer-motion`（及 `motion`）、`xterm`（及 `xterm-addon-fit`）、`react-tooltip` 均从 `window` 全局变量读取，无需 external；新增宿主全局变量时需同步更新 `plugins-sdk/cli.js` 的 shim 列表（参见代码注释）
    - `window.React` ← react
    - `window.ReactDOM` ← react-dom
    - `window.Zustand` ← zustand
    - `window.__lucide` ← lucide-react
    - `window.FramerMotion` ← framer-motion 与 motion
    - `window.XTerm` ← xterm 与 xterm-addon-fit
    - `window.ReactTooltip` ← react-tooltip
12. 进程隔离 — `required`/`recommended` 独立进程，`optional` 共享池，不做运行时动态切换
13. View 容器隔离与 createRoot 生命周期 — 编写 `View` 视图子类时，严禁直接对 `this.container` 调用 `createRoot`。必须创建内部 `subContainer = document.createElement('div')` 追加到 `this.container` 后对其调用 `createRoot`，并在 `onClose` 时解绑移除 `subContainer`，防止重载或重复打开时抛出 "passed to createRoot() before" 错误。
14. **遇到反复出现的 Bug 必须先查 FAQ** — 如果遇到 React warning（如 key、createRoot）、插件不激活、事件丢失、环境 URL 错误等问题，**必须优先查阅 [99-known-tricky-bugs.md](./references/99-known-tricky-bugs.md)**，这些问题已有归档根因和修复方案，禁止重复"盲猜+补丁"。
15. **主题插件三种模式**：
    - **简单 Skin**（CSS 一次写入）：用 `sdk.ui.persistStyle(id, css)` — 宿主 SkinLayer 重启自动恢复，插件无需始终运行。
    - **复杂 Skin**（动态响应）：在 `plugin.json` 声明 `"activationEvents": ["onStartupFinished"]`，用 `sdk.ui.broadcastStyle()` + `sdk.ui.onThemeChange()` 实时更新。
    - **混合 Skin**（按需切换常驻）：用 `sdk.plugin.setStartupResident(true/false)` 动态控制下次启动是否常驻，80% 静态用户零进程占用，动态用户自动开机常驻。
16. **替换品牌色必须用 `sdk.ui.setToken('--color-brand', '#hex')`** — 直接调用 `style.setProperty` 只改 `--color-brand`，不会同步 `--brand-rgb`，导致 Tailwind `bg-brand/10`、`ring-brand/40` 等带透明度工具类不跟随主题。`setToken` 自动处理伴生变量。
17. **窗口差异化样式**：不同窗口有唯一 `<html>` class，`quick-panel-root-page`、`float-web-root-page` 等在 `index.css` 静态声明；**`main-window-root-page`** 由宿主在 `did-finish-load` 事件中动态注入（已实现）。插件用 CSS 选择器按窗口控制样式，无需宿主额外配合。参见 [07j-ui-theme.md](./references/07j-ui-theme.md)。
18. **壁纸控制**：使用 `sdk.ui.setWallpaper(url, options)` 一键挂载全屏壁纸，宿主自动处理背景图激活、持久化恢复和多窗口广播。毛玻璃效果由插件自行注入 CSS 实现。参见 [07j-ui-theme.md](./references/07j-ui-theme.md)。

---

## 构建、安装与热重载 (SDK CLI & Local Server)

在插件开发过程中，**无需依赖宿主 MCP 链接**，也**无需在宿主代码库中运行 npm 命令**。可以直接使用 `berrytrace-sdk` (`berrytrace-cli`) 本地构建，并自动通过宿主的 Local Server HTTP 接口完成实时热重载与解包插件加载。

### 1. 统一构建、更新与热重载指令 (CLI 零配置)

在插件根目录或指定插件路径下直接运行：

```bash
# 1. 热监视开发工作流 (推荐开发时使用)：自动监听文件变动 ➔ 重新打包 (.btp) ➔ 解压更新至 ~/.berrytrace/plugins/ ➔ 宿主实时刷新
berrytrace-cli dev [path]

# 2. 一键编译打包与本地安装：打包生成 .btp ➔ 更新至 ~/.berrytrace/plugins/ ➔ 触发宿主热重载
berrytrace-cli install [path]
# 或：berrytrace-cli pack [path] --install

# 3. 未打包源码原地构建与热重载：
berrytrace-cli build [path] --reload

# 4. 单独通知宿主进行插件热重载/解包载入：
berrytrace-cli reload [path|pluginId]
```

> **工作原理**：
> 1. `berrytrace-cli dev / install` 会使用内置的零配置 esbuild 引擎（或运行 `npm run build`）完成构建，随后执行签名与 `.btp` 归档。
> 2. 将 `.btp` 自动解压安装到本地宿主插件目录 `~/.berrytrace/plugins/<pluginId>`。
> 3. 读取 `~/.berrytrace/local_server.json` 中的访问 Token，向宿主 LocalServer (`http://127.0.0.1:31828`) 发送 `/reload-plugin?id=<pluginId>` 请求，实现真实的本地插件打包、安装与实时热刷新全流程。

### 2. 宿主 MCP 开发辅助工具 (可选/在宿主集成模式下)

若 Agent 已经集成链接在 BerryTrace 宿主内部环境，也可配合调用以下 Host MCP 工具：

| 工具 | 用途 |
|------|------|
| `plugin_manager_load_unpacked` | 首次解包加载插件<br>`{ path: "plugins-dev/xxx" }` |
| `plugin_manager_reload` | 构建后热重载<br>`{ pluginId: "..." }` |
| `plugin_manager_get_logs` | 查看插件运行日志<br>`{ pluginId: "...", limit: 30 }` |

**标准极简开发循环**：

```
berrytrace-cli dev → 保存文件自动打包、本地更新并触发宿主刷新
```

---

## 日志查看与 AI 实时调试通道 (Logging & Diagnostics)

AI Agent 在开发或调试插件时，可通过以下三种途径无缝获取宿主与插件的运行日志：

### 1. SDK CLI 一键获取日志 (推荐 AI 使用)

```bash
# 获取当前插件或全局宿主最近的 50 条运行日志
npx berrytrace-plugin-sdk logs [pluginId|path] [--limit 50]
```
> CLI 会优先请求 LocalServer (`http://127.0.0.1:31828/get-logs`) 获取实时内存日志；若宿主未连接，会自动降级读取本地磁盘 `app.log` 日志文件。

### 2. HTTP LocalServer REST API
宿主默认在 `http://127.0.0.1:31828` 运行（Token 位于 `~/.berrytrace/local_server.json`）：
- `GET /get-logs?pluginId=<id>&limit=50`
- 请求头：`Authorization: Bearer <token>`

### 3. 磁盘物理日志文件路径
若宿主离线或需要分析全量堆栈历史，AI 可直接读取磁盘日志文件：
- **开发环境/项目目录**：`<project_root>/logs/app.log`
- **macOS User Data 目录**：`~/Library/Application Support/berrytrace-dev/logs/app.log` （生产版为 `berrytrace`）
- **Windows User Data 目录**：`%APPDATA%/berrytrace/logs/app.log`
- **Linux User Data 目录**：`~/.config/berrytrace/logs/app.log`

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
| system | [07a-system.md](./references/07a-system.md) | 40 |
| filesystem | [07b-filesystem.md](./references/07b-filesystem.md) | 16 |
| storage | [07c-storage.md](./references/07c-storage.md) | 13 |
| ai / mcp | [07d-ai-mcp.md](./references/07d-ai-mcp.md) | 22 |
| window / dialog / log / commands | [07e-window.md](./references/07e-window.md) | 21 |
| workspace / scheduler / plugin / context | [07f-workspace.md](./references/07f-workspace.md) | 27 |
| local-ai / search | [07g-local-ai-search.md](./references/07g-local-ai-search.md) | 13 |
| 插件运行时 (plugin:*) | [07k-plugin-runtime.md](./references/07k-plugin-runtime.md) | 4 |
| publish / user | [07h-publish-user.md](./references/07h-publish-user.md) | 12 |
| hooks | [07i-hooks.md](./references/07i-hooks.md) | 4 |
| ui / 主题 | [07j-ui-theme.md](./references/07j-ui-theme.md) | 12 |
| 回调注册 | [07z-callbacks.md](./references/07z-callbacks.md) | 17 |
<!-- API_INDEX_END -->
