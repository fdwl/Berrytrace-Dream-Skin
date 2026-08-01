# 14 — MCP Host Tools 与工具命名规范

## 一、 MCP 工具命名规范 (MCP Tool Naming Standard)

为了防止不同插件注册的 MCP 工具产生命名冲突，以及在 Agent 检索和调用链路中保证 100% 的一致性，所有插件工具的命名必须严格遵守以下规范：

### 1. 强制前缀命名空间
任何插件声明的 MCP 工具，其名称必须以**插件 ID 的短后缀（Short Name）**作为下划线前缀：
* **规则**：`[plugin_id_short]_[tool_name]`
* **示例**：
  - 插件 ID 为 `com.berrytrace.plugin.datahub` ──> 前缀为 `datahub_`。工具应命名为 `datahub_list_datasources`、`datahub_inspect_schema`。
  - 插件 ID 为 `com.berrytrace.plugin.daily-chronicle` ──> 前缀为 `daily_chronicle_`。工具应命名为 `daily_chronicle_save_summary`。
  - 插件 ID 为 `com.berrytrace.plugin.npx-tools` ──> 前缀为 `npx_` / `scheduler_` 等。

### 2. 例外情况：核心平台能力工具
对于核心推理内核（如 `cline-agent`）向外暴露的、会被前端界面（如图片渲染、视频渲染、窗口操控）和大量内置文档直接硬编码引用的**核心平台通用能力**，允许使用全局系统前缀（如 `os_`、`generate_`、`segment_`、`upload_`），例如 `generate_image`、`os_capture_window`。非核心业务插件严禁侵占此类命名空间。

### 3. 静态声明与注册一致性
* **禁止运行时动态改名**：宿主框架（`McpHost`）和插件 SDK 在注册工具时，将忠实地按声明载入，绝不对工具名称进行任何运行时的“前缀补全”或“动态替换”。
* **前后端名称绝对一致**：
  1. 必须在 `plugin.json` 的 `mcp.tools` 声明中写写好包含前缀的最终工具名（例如 `datahub_list_datasources`）。
  2. 必须在插件后台代码中，以相同的名字进行注册绑定：
     ```typescript
     sdk.mcp.registerToolHandler('datahub_list_datasources', async (args) => { ... })
     ```
  这保证了在 `plugin.json` ──> `McpHost` ──> `McpGateway` ──> `SDK.register` 整个链条中名字绝对一致，杜绝任何名称分裂与调用阻断。

---

## 二、 物理调试与热重载通道

开发过程中，AI Agent 与开发者可通过以下通道完成插件构建、载入与热重载。

### 通道 1：BerryTrace SDK CLI + Local Server（推荐，解耦 MCP）

使用 `berrytrace-sdk` 本地命令行进行编译，并自动通过宿主的 Local Server HTTP REST 接口发送热重载命令。适用于所有终端和 Agent 环境。

```bash
# 构建并通知宿主热重载
npx berrytrace-plugin-sdk build --reload

# 或手动触发热重载/解包加载
npx berrytrace-plugin-sdk reload [path|pluginId]
```

Local Server 运行在 `http://127.0.0.1:31828`（访问凭证保存在 `~/.berrytrace/local_server.json`），提供以下 REST 接口：
- `GET /reload-plugin?id=<pluginId>`
- `GET /load-unpacked-plugin?path=<absolutePath>`

### 通道 2：berrytrace:// 协议

通过 OS 协议唤起宿主。

```bash
open 'berrytrace://load-plugin?path=plugins-dev/my-plugin'
open 'berrytrace://reload-plugin?id=com.berrytrace.plugin.my-plugin-xxx'
```

### 通道 3：MCP Host Tools（仅在宿主内部集成 Agent 时可用）

| 工具 | 用途 | 参数 |
|------|------|------|
| `plugin_manager_load_unpacked` | 首次加载开发模式插件 | `{ path: "plugins-dev/xxx" }` |
| `plugin_manager_reload` | 构建后热重载 | `{ pluginId: "..." }` |
| `plugin_manager_get_logs` | 查看插件日志 | `{ pluginId: "...", limit: 30 }` |

### 完整开发循环：
```
改代码 → npx berrytrace-plugin-sdk build --reload → 宿主自动热重载生效
```
