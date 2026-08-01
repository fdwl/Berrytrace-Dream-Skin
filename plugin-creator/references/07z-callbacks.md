# 回调注册 API 汇总

以下方法的 handler 为 JS 函数，**必须在后台进程注册**。


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
| 命名空间 | 方法 | 说明 |
|----------|------|------|
| `system` | `registerGlobalShortcut` | 注册全局快捷键，按下时自动执行指定的 commandId。 |
| `system` | `unregisterGlobalShortcut` | 注销全局快捷键。 |
| `system` | `registerShortcutAction` | 注册快捷动作（显示在快捷键列表 UI 中）。必须在后台进程注册。 |
| `system` | `unregisterShortcutAction` | 注销快捷动作。 |
| `commands` | `register` | 注册命令。 |
| `commands` | `unregister` | 注销命令。 |
| `mcp` | `registerDynamicTool` | 动态注册 MCP 工具（运行时注册，非 plugin.json 声明）。 |
| `mcp` | `unregisterDynamicTool` | 注销动态 MCP 工具。 |
| `mcp` | `registerSystemPrompt` | 注册系统提示词（注入到 AI Agent 的 system prompt 中）。 |
| `mcp` | `unregisterSystemPrompt` | 注销系统提示词。 |
| `scheduler` | `register` | 注册定时任务（cron 或 interval）。必须在后台进程注册。 await callApi("scheduler", "register", [{ id: "daily-sync", cron: "0 9 * * *" }]); |
| `scheduler` | `unregister` | 注销定时任务。 |
| `selectionMenu` | `registerItem` | 注册划词菜单项。 |
| `selectionMenu` | `unregisterItem` | 注销划词菜单项。 |
| `hooks` | `register` | 注册 Hook 处理器。 |
| `hooks` | `unregister` | 注销 Hook。 |
| `hooks` | `unregisterPlugin` | 清理指定插件的所有 hooks |
