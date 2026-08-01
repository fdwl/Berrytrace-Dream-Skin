# 22 — 插件事件总览

> 自动扫描于 2026-07-30 02:35:52
> 来源: `plugins-dev/`

## 交叉索引（按事件）

| 事件名 | 发射方 | 监听方 |
|--------|--------|--------|
| `agent-scanner:bridge-port` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent-scanner:request-port` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:cancel_session` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:change_local_llm` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:chat_message` | — | `com.berrytrace.plugin.desktop-pet` |
| `agent:chat_request` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:download_local_llm` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:execute_task` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:kernel_ready` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.cline_agent` | — |
| `agent:prewarm_session` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:query_local_llm_status` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:redownload_local_llm` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:session_leave` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:set_local_llm_enabled` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `agent:step_update` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.npx-tools` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.daily-chronicle`, `com.berrytrace.plugin.desktop-pet`, `com.berrytrace.plugin.voice-agents`, `com.berrytrace.plugin.cline_agent` |
| `berrytrace:agent-chat-panel:opened` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `cline-agent:local-llm-status` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `daily-chronicle:delete-custom-style-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:delete-custom-style-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:get-dates-activity-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:get-dates-activity-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:get-styles-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:get-styles-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:get-summary-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:get-summary-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:get-timeline-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:get-timeline-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:save-custom-style-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:save-custom-style-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:save-summary-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:save-summary-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:set-style-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:set-style-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:stop-summary-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:stop-summary-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:summary-ready` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:trigger-summary-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:trigger-summary-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `daily-chronicle:update-summary-time-req` | — | `com.berrytrace.plugin.daily-chronicle` |
| `daily-chronicle:update-summary-time-res` | `com.berrytrace.plugin.daily-chronicle` | — |
| `dream-skin:applied` | `org.dreamskin.plugin.dream-skin` | — |
| `editor:agent-edit-request` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` |
| `editor:agent-edit-response` | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `editor:ping-open-file` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` |
| `editor:pong-open-file` | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.cline_agent` |
| `file:modified` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` |
| `force-save` | — | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` |
| `markdown:editor-context` | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` | — |
| `mobile:agent-cancel-ack` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:agent-notify` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:agent-status-resp` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:agent-stream` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:agent-stream-end` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:connection` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:kick-phone` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:mcp-call` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:pairing-expired` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:refresh-pairing` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:relay-event` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:start-direct` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:start-relay` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:state` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:stop` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:to-agent` | `com.berrytrace.plugin.mobile-remote` | — |
| `note-tools:delete-confirm-request` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.note-tools`, `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.note-tools` | — |
| `note-tools:delete-confirm-response` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.note-tools`, `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.note-tools` |
| `note-tools:jump-to-line` | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` | — |
| `note-tools:open-file` | `com.berrytrace.plugin.note-tools`, `com.berrytrace.plugin.note-tools` | — |
| `note-tools:replace-req` | — | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` |
| `note-tools:replace-resp` | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` | — |
| `note-tools:scroll-to-heading` | — | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` |
| `note-tools:selection-changed` | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` | — |
| `npx-tools:capture-action` | — | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` |
| `npx-tools:capture-confirm-request` | `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `npx-tools:capture-confirm-response` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.npx-tools` |
| `npx-tools:capture-control-end` | `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `npx-tools:capture-control-start` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `npx-tools:capture-window-closed` | — | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` |
| `npx-tools:user-input-end` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `npx-tools:user-input-request` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `npx-tools:user-input-response` | — | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` |
| `pet:active-windows-list` | `com.berrytrace.plugin.desktop-pet` | `com.berrytrace.plugin.desktop-pet` |
| `pet:agent-state-changed` | `com.berrytrace.plugin.desktop-pet` | — |
| `pet:chat-bubble-show` | `com.berrytrace.plugin.desktop-pet` | — |
| `pet:despawn` | — | `com.berrytrace.plugin.desktop-pet` |
| `pet:despawn-all` | — | `com.berrytrace.plugin.desktop-pet` |
| `pet:despawned` | `com.berrytrace.plugin.desktop-pet` | `com.berrytrace.plugin.desktop-pet` |
| `pet:get-active-windows` | — | `com.berrytrace.plugin.desktop-pet` |
| `pet:spawn` | — | `com.berrytrace.plugin.desktop-pet` |
| `pet:spawned` | `com.berrytrace.plugin.desktop-pet` | `com.berrytrace.plugin.desktop-pet` |
| `plugins:intercepted-key` | — | `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` |
| `presentation:cast` | — | `com.berrytrace.plugin.presentation` |
| `presentation:control` | — | `com.berrytrace.plugin.presentation` |
| `presentation:devices` | `com.berrytrace.plugin.presentation` | — |
| `presentation:discover` | — | `com.berrytrace.plugin.presentation` |
| `presentation:prepare` | — | `com.berrytrace.plugin.presentation` |
| `presentation:progress` | `com.berrytrace.plugin.presentation` | — |
| `presentation:screens` | `com.berrytrace.plugin.presentation` | — |
| `presentation:slideState` | `com.berrytrace.plugin.presentation` | — |
| `presentation:start-local` | — | `com.berrytrace.plugin.presentation` |
| `presentation:state` | `com.berrytrace.plugin.presentation` | — |
| `presentation:stop` | — | `com.berrytrace.plugin.presentation` |
| `presentation:switch-document` | — | `com.berrytrace.plugin.presentation` |
| `presentation:update-notes` | — | `com.berrytrace.plugin.presentation` |
| `scheduler:trigger` | — | `com.berrytrace.plugin.daily-chronicle` |
| `snowflake:restart` | — | `com.berrytrace.plugin.snowflake-3947281560` |
| `snowflake:start` | — | `com.berrytrace.plugin.snowflake-3947281560` |
| `snowflake:stop` | — | `com.berrytrace.plugin.snowflake-3947281560` |
| `snowflake:toggle` | `com.berrytrace.plugin.snowflake-3947281560` | `com.berrytrace.plugin.snowflake-3947281560` |
| `system:user-active` | — | `com.berrytrace.plugin.daily-chronicle` |
| `system:user-idle` | — | `com.berrytrace.plugin.daily-chronicle` |
| `tool:progress` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `voice:activate-ui` | `com.berrytrace.plugin.voice-agents` | `com.berrytrace.plugin.voice-ui-desktop-pet`, `com.berrytrace.plugin.voice-ui-jarvis`, `com.berrytrace.plugin.voice-ui-minimal-hud` |
| `voice:get-model-status` | — | `com.berrytrace.plugin.voice-agents` |
| `voice:model-status` | `com.berrytrace.plugin.voice-agents` | — |
| `voice:orb-state` | — | `com.berrytrace.plugin.voice-agents` |
| `voice:prewarm` | — | `com.berrytrace.plugin.voice-agents` |
| `voice:state-broadcast` | `com.berrytrace.plugin.voice-agents` | `com.berrytrace.plugin.voice-ui-desktop-pet`, `com.berrytrace.plugin.voice-ui-jarvis`, `com.berrytrace.plugin.voice-ui-minimal-hud` |
| `workspace:active-tab-changed` | — | `com.berrytrace.plugin.daily-chronicle`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.markdown-editor` |
| `workspace:changed` | — | `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor`, `com.berrytrace.plugin.code-editor`, `com.berrytrace.plugin.markdown-editor` |
| `workspace:content-changed` | — | `com.berrytrace.plugin.daily-chronicle` |
| `workspace:context-changed` | — | `com.berrytrace.plugin.daily-chronicle`, `org.dreamskin.plugin.dream-skin` |
| `workspace:file-changed` | `com.berrytrace.plugin.npx-tools`, `com.berrytrace.plugin.npx-tools` | — |
| `workspace:file-closed` | — | `com.berrytrace.plugin.daily-chronicle` |
| `workspace:file-deleted` | — | `com.berrytrace.plugin.daily-chronicle` |
| `workspace:file-opened` | — | `com.berrytrace.plugin.daily-chronicle` |
| `workspace:file-renamed` | — | `com.berrytrace.plugin.daily-chronicle` |

## 按插件

### Cline AI 推理内核

**发射**：
- `agent:kernel_ready` — Agent 内核初始化完成，通知宿主
- `agent:step_update` — Agent 执行步骤状态更新
- `note-tools:delete-confirm-request` — 请求文件删除确认
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件
- `agent-scanner:bridge-port` — Bridge 服务端口通知
- `agent-scanner:request-port` — 请求 Bridge 服务端口
- `cline-agent:local-llm-status` — 本地 LLM 下载/加载进度状态广播
**监听**：
- `agent:execute_task` — 监听宿主下发的任务执行请求（命令）
- `agent:prewarm_session` — 打字预热请求
- `agent:session_leave` — 会话离开通知
- `agent:cancel_session` — 监听会话取消请求
- `agent:chat_request` — 监听 AI 聊天请求
- `agent:step_update` — 监听 Agent 步骤状态更新（子代理使用）
- `note-tools:delete-confirm-response` — 删除文件确认结果
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
- `npx-tools:capture-confirm-response` — 屏幕截图确认结果
- `agent-scanner:bridge-port` — Bridge 服务端口通知
- `agent-scanner:request-port` — 请求 Bridge 服务端口
- `berrytrace:agent-chat-panel:opened` — Agent 聊天面板打开时触发扫描及唤醒
- `cline-agent:local-llm-status` — 本地 LLM 下载/加载进度状态广播（background → renderer）
- `agent:set_local_llm_enabled` — 设置页开关操作（renderer → background）
- `agent:change_local_llm` — 设置页选择切换本地 LLM 模型（renderer → background）
- `agent:download_local_llm` — 设置页请求下载特定本地模型（renderer → background）
- `agent:redownload_local_llm` — 设置页请求重新下载选定本地 LLM 模型（renderer → background）
- `agent:query_local_llm_status` — 设置页主动请求获取当前所有本地模型及状态（renderer → background）

### Code Editor

**发射**：
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
**监听**：
- `workspace:changed` — 工作区内容变化通知
- `file:modified` — 文件被外部修改通知
- `force-save` — 强制保存当前文件
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件

### 莓莓洞察

**发射**：
- `daily-chronicle:get-timeline-res` — 时间线数据响应
- `daily-chronicle:save-summary-res` — 保存总结响应
- `daily-chronicle:trigger-summary-res` — 触发生成总结响应
- `daily-chronicle:stop-summary-res` — 停止生成总结响应
- `daily-chronicle:update-summary-time-res` — 更新总结时间响应
- `daily-chronicle:get-summary-res` — 获取总结内容响应
- `daily-chronicle:get-dates-activity-res` — 获取日期活动数据响应
- `daily-chronicle:get-styles-res` — 获取样式列表响应
- `daily-chronicle:set-style-res` — 设置当前样式响应
- `daily-chronicle:save-custom-style-res` — 保存自定义样式响应
- `daily-chronicle:delete-custom-style-res` — 删除自定义样式响应
- `daily-chronicle:summary-ready` — 总结生成完成通知
**监听**：
- `agent:step_update` — 监听 Agent 步骤变化以记录编辑行为和状态
- `daily-chronicle:get-timeline-req` — 获取时间线数据请求
- `daily-chronicle:save-summary-req` — 保存总结请求
- `daily-chronicle:trigger-summary-req` — 触发生成总结请求
- `daily-chronicle:stop-summary-req` — 停止生成总结请求
- `daily-chronicle:update-summary-time-req` — 更新总结时间请求
- `daily-chronicle:get-summary-req` — 获取总结内容请求
- `daily-chronicle:get-dates-activity-req` — 获取日期活动数据请求
- `daily-chronicle:get-styles-req` — 获取样式列表请求
- `daily-chronicle:set-style-req` — 设置当前样式请求
- `daily-chronicle:save-custom-style-req` — 保存自定义样式请求
- `daily-chronicle:delete-custom-style-req` — 删除自定义样式请求
- `scheduler:trigger` — 定时任务触发通知
- `workspace:context-changed` — 工作区上下文变更
- `workspace:file-opened` — 文件打开事件
- `workspace:file-closed` — 文件关闭事件
- `workspace:file-renamed` — 文件重命名事件
- `workspace:file-deleted` — 文件删除事件
- `workspace:active-tab-changed` — 活跃标签页切换事件
- `workspace:content-changed` — 工作区内容变化事件
- `system:user-active` — 用户重新活跃
- `system:user-idle` — 用户空闲

### 桌面宠物

**发射**：
- `pet:spawned` — 宠物已召唤通知
- `pet:despawned` — 宠物已移除通知
- `pet:active-windows-list` — 活跃宠物窗口列表
- `pet:agent-state-changed` — Agent 状态变化通知宠物
- `pet:chat-bubble-show` — 推送聊天对话框文本给桌宠
**监听**：
- `agent:step_update` — 根据 Agent 步骤状态改变宠物动作/表情
- `agent:chat_message` — 监听 AgentChat 聊天对话消息并推送至宠物气泡
- `pet:spawn` — 召唤桌面宠物
- `pet:despawn` — 移除桌面宠物
- `pet:despawn-all` — 移除所有桌面宠物
- `pet:get-active-windows` — 获取活跃宠物窗口列表
- `pet:active-windows-list` — 活跃宠物窗口列表
- `pet:spawned` — 宠物已召唤通知
- `pet:despawned` — 宠物已移除通知

### Markdown Editor

**发射**：
- `note-tools:replace-resp` — 笔记替换内容响应
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
- `markdown:editor-context` — Markdown 编辑器上下文信息
- `note-tools:jump-to-line` — 跳转到指定行
- `note-tools:selection-changed` — 选中文本变化通知
**监听**：
- `workspace:active-tab-changed` — 活跃标签页切换事件
- `plugins:intercepted-key` — 其他插件拦截的按键事件
- `note-tools:replace-req` — 笔记替换内容请求
- `force-save` — 强制保存当前文件
- `workspace:changed` — 工作区内容变化通知
- `file:modified` — 文件被外部修改通知
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件
- `note-tools:scroll-to-heading` — 滚动到指定标题

### Mastra AI 推理内核[暂停使用]

**发射**：
- `agent:kernel_ready` — Agent 内核初始化完成，通知宿主
- `agent:step_update` — Agent 执行步骤状态更新
- `npx-tools:capture-confirm-request` — 请求屏幕截图确认
- `npx-tools:capture-control-end` — 结束屏幕截图控制
**监听**：
- `agent:execute_task` — 监听宿主下发的任务执行请求（命令）
- `agent:cancel_session` — 监听会话取消请求
- `agent:chat_request` — 监听 AI 聊天请求
- `npx-tools:capture-confirm-response` — 屏幕截图确认结果

### 手机远程控制

**发射**：
- `mobile:connection` — 手机连接状态更新
- `mobile:state` — 设备状态变化通知
- `mobile:pairing-expired` — 配对已过期
- `mobile:to-agent` — 手机消息转发给 Agent
- `mobile:relay-event` — 中转事件通知
**监听**：
- `mobile:start-direct` — 直连模式启动指令
- `mobile:start-relay` — 中转模式启动指令
- `mobile:stop` — 停止连接指令
- `mobile:refresh-pairing` — 刷新配对信息
- `mobile:kick-phone` — 踢出手机连接
- `mobile:agent-stream` — Agent 流式输出
- `mobile:agent-stream-end` — Agent 流式输出结束
- `mobile:agent-cancel-ack` — Agent 取消确认
- `mobile:agent-status-resp` — Agent 状态查询响应
- `mobile:agent-notify` — Agent 通知消息
- `mobile:mcp-call` — MCP 工具调用请求

### 笔记核心工具

**发射**：
- `note-tools:open-file` — 打开指定文件
- `note-tools:delete-confirm-request` — 请求文件删除确认
**监听**：
- `note-tools:delete-confirm-response` — 文件删除确认结果

### 莓莓印记 · 本地自动化工具箱

**发射**：
- `agent:step_update` — Agent 执行步骤状态更新（命令流式输出日志）
- `workspace:file-changed` — 文件变化通知
- `npx-tools:capture-confirm-request` — 请求屏幕截图确认
- `npx-tools:capture-control-start` — 开始屏幕截图控制
- `npx-tools:capture-control-end` — 结束屏幕截图控制
- `npx-tools:user-input-request` — 请求用户命令行输入
- `npx-tools:user-input-end` — 用户输入结束
- `tool:progress` — 工具执行进度通知
- `file:modified` — 文件被修改通知
**监听**：
- `npx-tools:user-input-response` — 监听用户命令行输入的返回结果
- `npx-tools:capture-action` — 屏幕截图操作指令
- `npx-tools:capture-window-closed` — 截图窗口已关闭
- `npx-tools:capture-confirm-response` — 屏幕截图确认结果

### 投屏演示

**发射**：
- `presentation:progress` — 投屏进度更新
- `presentation:state` — 投屏状态变化
- `presentation:slideState` — 幻灯片状态更新
- `presentation:devices` — 可用投屏设备列表
- `presentation:screens` — 可用屏幕列表
**监听**：
- `presentation:prepare` — 准备投屏演示
- `presentation:discover` — 发现投屏设备
- `presentation:start-local` — 启动本地投屏
- `presentation:cast` — 开始投屏到设备
- `presentation:stop` — 停止投屏
- `presentation:switch-document` — 切换投屏文档
- `presentation:update-notes` — 更新演讲备注
- `presentation:control` — 投屏控制指令

### 桌面飘雪

**发射**：
- `snowflake:toggle` — 切换飘雪显示/隐藏
**监听**：
- `snowflake:toggle` — 切换飘雪显示/隐藏
- `snowflake:start` — 启动飘雪效果
- `snowflake:stop` — 停止飘雪效果
- `snowflake:restart` — 重启飘雪效果

### Voice Agent 服务

**发射**：
- `voice:model-status` — 语音模型下载状态通知（status: missing/downloading/ready/error, progress: 0-100）
- `voice:state-broadcast` — 向全量 UI 插件广播 Voice Agent 状态、音量能量 (volume) 与 8 维频谱数据 (spectrum)
- `voice:activate-ui` — 激活/切换指定 Voice UI 插件（targetPluginId, visible）
**监听**：
- `agent:step_update` — 监听 Agent 步骤状态更新，驱动语音反馈和 Orb 动画
- `voice:prewarm` — 预热 STT/TTS 服务（Orb 打开时触发）
- `voice:orb-state` — Orb 可见性状态变化
- `voice:get-model-status` — 查询当前模型下载状态

### Live2D 萌系桌宠 (Desktop Pet UI)

**监听**：
- `voice:state-broadcast` — 监听 Voice Agent 广播的状态、音量能量与口型/表情驱动数据
- `voice:activate-ui` — 监听 UI 插件激活/切换指令

### 贾维斯 3D 浮球 (Jarvis UI)

**监听**：
- `voice:state-broadcast` — 监听 Voice Agent 广播的状态、音量能量与频谱数据
- `voice:activate-ui` — 监听 UI 插件激活/切换指令

### 极简 HUD 悬浮窗 (Minimal HUD UI)

**监听**：
- `voice:state-broadcast` — 监听 Voice Agent 广播的状态与文本数据
- `voice:activate-ui` — 监听 UI 插件激活/切换指令

### Cline AI 推理内核

**发射**：
- `agent:kernel_ready` — Agent 内核初始化完成，通知宿主
- `agent:step_update` — Agent 执行步骤状态更新
- `note-tools:delete-confirm-request` — 请求文件删除确认
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件
- `agent-scanner:bridge-port` — Bridge 服务端口通知
- `agent-scanner:request-port` — 请求 Bridge 服务端口
- `cline-agent:local-llm-status` — 本地 LLM 下载/加载进度状态广播
**监听**：
- `agent:execute_task` — 监听宿主下发的任务执行请求（命令）
- `agent:prewarm_session` — 打字预热请求
- `agent:session_leave` — 会话离开通知
- `agent:cancel_session` — 监听会话取消请求
- `agent:chat_request` — 监听 AI 聊天请求
- `agent:step_update` — 监听 Agent 步骤状态更新（子代理使用）
- `note-tools:delete-confirm-response` — 删除文件确认结果
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
- `npx-tools:capture-confirm-response` — 屏幕截图确认结果
- `agent-scanner:bridge-port` — Bridge 服务端口通知
- `agent-scanner:request-port` — 请求 Bridge 服务端口
- `berrytrace:agent-chat-panel:opened` — Agent 聊天面板打开时触发扫描及唤醒
- `cline-agent:local-llm-status` — 本地 LLM 下载/加载进度状态广播（background → renderer）
- `agent:set_local_llm_enabled` — 设置页开关操作（renderer → background）
- `agent:change_local_llm` — 设置页选择切换本地 LLM 模型（renderer → background）
- `agent:download_local_llm` — 设置页请求下载特定本地模型（renderer → background）
- `agent:redownload_local_llm` — 设置页请求重新下载选定本地 LLM 模型（renderer → background）
- `agent:query_local_llm_status` — 设置页主动请求获取当前所有本地模型及状态（renderer → background）

### Code Editor

**发射**：
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
**监听**：
- `workspace:changed` — 工作区内容变化通知
- `file:modified` — 文件被外部修改通知
- `force-save` — 强制保存当前文件
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件

### Markdown Editor

**发射**：
- `note-tools:replace-resp` — 笔记替换内容响应
- `editor:pong-open-file` — 文件打开状态反馈
- `editor:agent-edit-response` — AI 文件修改用户确认反馈
- `markdown:editor-context` — Markdown 编辑器上下文信息
- `note-tools:jump-to-line` — 跳转到指定行
- `note-tools:selection-changed` — 选中文本变化通知
**监听**：
- `workspace:active-tab-changed` — 活跃标签页切换事件
- `plugins:intercepted-key` — 其他插件拦截的按键事件
- `note-tools:replace-req` — 笔记替换内容请求
- `force-save` — 强制保存当前文件
- `workspace:changed` — 工作区内容变化通知
- `file:modified` — 文件被外部修改通知
- `editor:ping-open-file` — 查询文件是否在编辑器中打开
- `editor:agent-edit-request` — AI 请求修改已打开的文件
- `note-tools:scroll-to-heading` — 滚动到指定标题

### 笔记核心工具

**发射**：
- `note-tools:open-file` — 打开指定文件
- `note-tools:delete-confirm-request` — 请求文件删除确认
**监听**：
- `note-tools:delete-confirm-response` — 文件删除确认结果

### 莓莓印记 · 本地自动化工具箱

**发射**：
- `agent:step_update` — Agent 执行步骤状态更新（命令流式输出日志）
- `workspace:file-changed` — 文件变化通知
- `npx-tools:capture-confirm-request` — 请求屏幕截图确认
- `npx-tools:capture-control-start` — 开始屏幕截图控制
- `npx-tools:capture-control-end` — 结束屏幕截图控制
- `npx-tools:user-input-request` — 请求用户命令行输入
- `npx-tools:user-input-end` — 用户输入结束
- `tool:progress` — 工具执行进度通知
- `file:modified` — 文件被修改通知
**监听**：
- `npx-tools:user-input-response` — 监听用户命令行输入的返回结果
- `npx-tools:capture-action` — 屏幕截图操作指令
- `npx-tools:capture-window-closed` — 截图窗口已关闭
- `npx-tools:capture-confirm-response` — 屏幕截图确认结果

### BerryTrace DreamSkin 主题与皮肤中心

**发射**：
- `dream-skin:applied` — 当应用新主题皮肤时广播通知
**监听**：
- `workspace:context-changed` — 监听工作区切换刷新主题状态

> 声明 events 后在 `plugin.json` 中维护，运行 `node scripts/scan-plugin-events.js` 更新。
> 宿主导出插件列表：`open 'berrytrace://export-plugins?to=/tmp/plugins.json'`
