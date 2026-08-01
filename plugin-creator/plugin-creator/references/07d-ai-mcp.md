# ai / mcp — AI 与 MCP 工具

## ai

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `chat` | `options: { messages?, sessionId?, ... }` | `ChatResponse` | 调用 AI 聊天（非流式）。自动路由到 Agent 内核插件。 |
| `chatStream` | `options, onChunk: (chunk: string) => void` | `void` | 调用 AI 聊天（流式）。通过 onChunk 回调接收增量文本。 |
| `runAgentTask` | `options: { task, sessionId?, history?, ... }` | `{ sessionId, kernelPluginId, accepted }` | 启动 AI Agent 任务。自动获取 LLM 配置，找到可用的 Agent 内核插件。 |
| `cancelAgentTask` | `sessionId: string` | `void` | 取消指定会话的 Agent 任务。 |
| `getAgentKernelStatus` | `—` | `AgentKernelStatus` | 查询 Agent 内核状态。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const response = await sdk.ai.chat({
  messages: [{ role: 'user', content: '你好' }]
});

await sdk.ai.chatStream({
  messages: [{ role: 'user', content: '写一段代码' }]
}, (chunk) => process.stdout.write(chunk));
```

## mcp

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `registerToolHandler` | `toolName: string, handler: (args) => Promise<McpToolResult>` | `void` | 注册 MCP 工具处理器（静态，需在 plugin.json 的 mcp.tools 中声明）。 |
| `registerResourceHandler` | `uriPattern: string, handler: (params) => Promise<McpResourceResult>` | `void` | 注册 MCP 资源处理器。 |
| `registerDynamicTool` | `toolSpec: { name, description, inputSchema, displayName?, userQueries? }, handler: (args) => Promise<McpToolResult>` | `void` | 动态注册 MCP 工具（运行时注册，无需 plugin.json 声明）。 |
| `unregisterDynamicTool` | `toolName: string` | `void` | 注销动态 MCP 工具。 |
| `registerSystemPrompt` | `promptId: string, promptText: string` | `void` | 注册系统提示词（注入到 AI Agent 的 system prompt 中）。 |
| `unregisterSystemPrompt` | `promptId: string` | `void` | 注销系统提示词。 |
| `listTools` | `—` | `unknown[]` | 列出所有已注册的 MCP 工具。 |
| `callTool` | `name: string, args: Record<string, unknown>` | `unknown` | 调用指定的 MCP 工具。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

// 静态注册（对应 plugin.json 的 mcp.tools）
sdk.mcp.registerToolHandler('my_tool', async (args) => {
  return { content: [{ type: 'text', text: `处理: ${args.input}` }] };
});

// 动态注册
await sdk.mcp.registerDynamicTool(
  { name: 'dynamic_tool', description: '动态工具', inputSchema: { type: 'object' } },
  async (args) => ({ content: [{ type: 'text', text: 'OK' }] })
);
```

> **注意**：controller 中还有 listSystemPrompts 方法，但**未注册到 SDK**。
