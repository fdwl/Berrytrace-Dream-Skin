# 07y — 系统事件清单

> 此文件由 `scripts/generate-skill-docs.js` 自动生成，来源: `plugins-sdk/event-catalog.ts`

## 广播通知事件

插件可订阅并广播到其他插件的通知事件。

| 事件名 | payload | 后台广播 | 渲染广播 | 说明 |
|--------|---------|:---:|:---:|------|
| `agent:kernel_ready` | `AgentKernelReadyPayload` | — | ✅ | Agent 内核已就绪，宿主和其他插件可以开始发送任务 |
| `agent:step_update` | `AgentStepUpdatePayload` | ✅ | ✅ | Agent 步骤状态更新（流式广播，所有关心进度的插件都可订阅） |
| `context:active-app-changed` | `ActiveAppInfo` | — | ✅ | 用户切换了前台应用 |
| `workspace:file-changed` | `WorkspaceFileChangedPayload` | — | ✅ | 工作区文件发生变更 |
| `workspace:context-changed` | `WorkspaceContextChangedPayload` | ✅ | ✅ | 工作区上下文变更（用户切换了工作区）。background 插件应更新内部缓存的路径。 |
| `system:user-idle` | `null` | ✅ | ✅ | 系统检测到用户已空闲超过阈值 |
| `system:user-active` | `null` | ✅ | ✅ | 系统检测到用户重新活跃 |
| `plugins:changed` | `null` | — | ✅ | 插件列表发生变更（安装/卸载/启用/禁用）。跨进程事件，通过 eventBus + broadcastSystemEvent 分发。 |
| `plugins:lifecycle` | `PluginsLifecyclePayload` | — | ✅ | 插件生命周期状态变更 |
| `plugins:on-demand-loaded` | `PluginsOnDemandLoadedPayload` | — | ✅ | 插件按需加载完成 |
| `plugin:changed` | `PluginChangedPayload` | — | — | 宿主内部插件变更事件（install / unload / uninstall）。由 PluginManager → eventBus 发出，FullTextIndexManager 等主进程 service 监听。 |

## 命令事件（宿主 → 插件）

宿主下发给特定插件的单向指令。用 `sdk.host.onCommand` 订阅。

| 事件名 | payload 类型 | 说明 |
|--------|-------------|------|
| `agent:execute_task` | `AgentExecuteTaskPayload` | 宿主请 Agent 内核开始执行任务 |
| `agent:cancel_session` | `AgentCancelSessionPayload` | 宿主请 Agent 内核取消指定会话 |
| `agent:chat_request` | `AgentChatRequestPayload` | 宿主请 Agent 内核处理聊天请求 |

> 事件详情和路由策略见 `plugins-sdk/event-catalog.ts`。
