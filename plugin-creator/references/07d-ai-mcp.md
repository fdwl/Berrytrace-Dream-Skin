# ai / mcp — AI 与 MCP 工具


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## ai

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `cancelAgentTask` | `sessionId: string` | `null` | 取消指定会话的 Agent 任务。 |
| `chat` | `options: { messages?: { role: 'system' | 'user' | 'assistant'; content: string }[]; sessionId?: string; [key: string]: unknown }` | `unknown` | 调用 AI 聊天（非流式）。自动路由到 Agent 内核插件。 await callApi("ai", "chat", … |
| `chatStream` | `options: { messages?: { role: 'system' | 'user' | 'assistant'; content: string }[]; sessionId?: string; [key: string]: unknown }` | `unknown` | 调用 AI 聊天（流式）。通过 onChunk 回调接收增量文本。 await callApi("ai", "chatS… |
| `getAgentKernelStatus` | `—` | `unknown` | 查询 Agent 内核状态。 |
| `getAiServers` | `—` | `unknown` | 获取所有已注册的 AI 服务商及其模型列表。 |
| `getCapabilityModels` | `—` | `unknown` | 获取按能力分配的服务商与模型映射（供 cline-agent 等插件读取当前 capability→{serverId,… |
| `getServerLlmConfig` | `options: string | { serverId: string }` | `unknown` |  |
| `getVoiceSettings` | `—` | `unknown` | 获取渲染进程中的 Voice Settings |
| `leaveAgentSession` | `options: { sessionId: string } | string` | `null` | 离开 Agent 内核会话。 |
| `prewarmAgentSession` | `options: { agentId: string; model?: string; sessionId?: string }` | `null` | 预热 Agent 内核会话进程。 |
| `runAgentTask` | `options: {
    sessionId?: string;
    task: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    workDir?: string;
    activeDocument?: {
      tabId: string;
      title: string;
      path?: string;
      extension?: string;
      pluginId?: string;
      isUntitled?: boolean;
    };
    llmConfig?: {
      provider: 'aliyun' | 'ollama' | 'berrytrace' | 'custom';
      model: string;
      apiKey?: string;
      baseUrl?: string;
    };
    maxSteps?: number;
    systemPrompt?: string;
    skipDefaultSystemPrompt?: boolean;
  }` | `unknown` | 启动 AI Agent 任务。自动获取 LLM 配置，找到可用的 Agent 内核插件，发送任务到后台进程异步执行。 a… |

**调用示例**：
```typescript
await callApi('ai', 'cancelAgentTask', [sessionId]);
```

## mcp

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `callTool` | `toolName: string, toolArgs: Record<string, unknown>` | `unknown` | 调用指定的 MCP 工具。 await callApi("mcp", "callTool", [{ toolName: … |
| `deleteProfile` | `id: string` | `boolean` |  |
| `listProfiles` | `—` | `unknown[]` |  |
| `listSystemPrompts` | `—` | `unknown` | 列出所有已注册的系统提示词。 |
| `listTools` | `—` | `unknown[]` |  |
| `registerDynamicTool` | `callerPluginId: string, toolSpec: { name: string; description: string; inputSchema: Record<string, unknown> }` | `null` | 动态注册 MCP 工具（运行时注册，非 plugin.json 声明）。 |
| `registerSystemPrompt` | `callerPluginId: string, options: { promptId: string; promptText: string }` | `null` | 注册系统提示词（注入到 AI Agent 的 system prompt 中）。 |
| `saveProfile` | `profile: any` | `unknown` |  |
| `unregisterDynamicTool` | `callerPluginId: string, toolName: string` | `null` | 注销动态 MCP 工具。 |
| `unregisterSystemPrompt` | `callerPluginId: string, promptId: string` | `null` | 注销系统提示词。 |
| `updateScopeToken` | `params: { token: string; allowedTools?: string[]; allowedPlugins?: string[] }` | `boolean` |  |

**调用示例**：
```typescript
await callApi('mcp', 'callTool', [{ toolName, toolArgs }]);
```

