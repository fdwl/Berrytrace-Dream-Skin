# 22 — 插件事件总览

> 自动扫描于 2026-06-27 00:41:48
> 来源: `plugins-dev/`

## 交叉索引（按事件）

| 事件名 | 发射方 | 监听方 |
|--------|--------|--------|
| `agent:cancel_session` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent` |
| `agent:chat_request` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent` |
| `agent:execute_task` | — | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent` |
| `agent:kernel_ready` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent` | — |
| `agent:step_update` | `com.berrytrace.plugin.cline_agent`, `com.berrytrace.plugin.mastra_agent`, `com.berrytrace.plugin.npx-tools` | `com.berrytrace.plugin.daily-chronicle`, `com.berrytrace.plugin.desktop-pet`, `com.berrytrace.plugin.voice-assistant` |
| `mobile:connection` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:start-direct` | — | `com.berrytrace.plugin.mobile-remote` |
| `mobile:state` | `com.berrytrace.plugin.mobile-remote` | — |
| `mobile:stop` | — | `com.berrytrace.plugin.mobile-remote` |
| `npx-tools:user-input-response` | — | `com.berrytrace.plugin.npx-tools` |
| `workspace:file-changed` | `com.berrytrace.plugin.npx-tools` | — |

## 按插件

### Cline AI 推理内核

**发射**：
- `agent:kernel_ready` — Agent 内核初始化完成，通知宿主
- `agent:step_update` — Agent 执行步骤状态更新
**监听**：
- `agent:execute_task` — 监听宿主下发的任务执行请求（命令）
- `agent:cancel_session` — 监听会话取消请求
- `agent:chat_request` — 监听 AI 聊天请求

### 莓莓洞察

**监听**：
- `agent:step_update` — 监听 Agent 步骤变化以记录编辑行为和状态

### 桌面宠物

**监听**：
- `agent:step_update` — 根据 Agent 步骤状态改变宠物动作/表情

### Mastra AI 推理内核[暂停使用]

**发射**：
- `agent:kernel_ready` — Agent 内核初始化完成，通知宿主
- `agent:step_update` — Agent 执行步骤状态更新
**监听**：
- `agent:execute_task` — 监听宿主下发的任务执行请求（命令）
- `agent:cancel_session` — 监听会话取消请求
- `agent:chat_request` — 监听 AI 聊天请求

### 手机远程控制

**发射**：
- `mobile:connection` — 手机连接状态更新
- `mobile:state` — 设备状态变化通知
**监听**：
- `mobile:start-direct` — 直连模式启动指令
- `mobile:stop` — 停止连接指令

### 莓莓印记 · 本地自动化工具箱

**发射**：
- `agent:step_update` — Agent 执行步骤状态更新（命令流式输出日志）
- `workspace:file-changed` — 文件变化通知
**监听**：
- `npx-tools:user-input-response` — 监听用户命令行输入的返回结果

### 语音助手

**监听**：
- `agent:step_update` — 监听 Agent 步骤状态更新，驱动语音反馈和 Orb 动画

> 声明 events 后在 `plugin.json` 中维护，运行 `node scripts/scan-plugin-events.js` 更新。
> 宿主导出插件列表：`open 'berrytrace://export-plugins?to=/tmp/plugins.json'`
