# 07 — 运行时 API

所有 API 通过 SDK 实例调用：`const sdk = createPluginSDK('com.berrytrace.plugin.xxx')`

## API 速查

| 模块 | 文档 | 方法数 | 敏感 |
|------|------|--------|:----:|
| `system` | [07a-system.md](./07a-system.md) | 15 | 🔒 |
| `filesystem` | [07b-filesystem.md](./07b-filesystem.md) | 14 | 🔒 |
| `storage` | [07c-storage.md](./07c-storage.md) | 5 |  |
| `ai` | [07d-ai-mcp.md](./07d-ai-mcp.md) | 5 |  |
| `mcp` | [07d-ai-mcp.md](./07d-ai-mcp.md) | 8 |  |
| `window` | [07e-window.md](./07e-window.md) | 12 |  |
| `dialog` | [07e-window.md](./07e-window.md) | 2 |  |
| `log` | [07e-window.md](./07e-window.md) | 4 |  |
| `commands` | [07e-window.md](./07e-window.md) | 3 |  |
| `workspace` | [07f-workspace.md](./07f-workspace.md) | 21 |  |
| `scheduler` | [07f-workspace.md](./07f-workspace.md) | 3 |  |
| `plugin` | [07f-workspace.md](./07f-workspace.md) | 2 |  |
| `context` | [07f-workspace.md](./07f-workspace.md) | 3 |  |
| `selectionMenu` | [07f-workspace.md](./07f-workspace.md) | 2 |  |
| `local-ai` | [07g-local-ai-search.md](./07g-local-ai-search.md) | 动态代理 |  |
| `search` | [07g-local-ai-search.md](./07g-local-ai-search.md) | 2 |  |
| `user` | [07h-publish-user.md](./07h-publish-user.md) | 5 |  |
| `hooks` | [07i-hooks.md](./07i-hooks.md) | 3 |  |
| `events` | [07y-events.md](./07y-events.md) | 4 |  |
| `settings` | — | 3 |  |
| 回调 API | [07z-callbacks.md](./07z-callbacks.md) | — | |

---

## 核心调用模式

### 模式 1：SDK 实例调用

```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const theme = await sdk.system.getTheme();
const files = await sdk.filesystem.readDir('/path/to/dir');
await sdk.log.info('插件已加载');
```

### 模式 2：注册回调（后台进程）

handler 为 JS 函数，**必须在后台进程注册**。详见 [07z-callbacks.md](./07z-callbacks.md)。

```typescript
sdk.mcp.registerToolHandler('my_tool', async (args) => {
  return { content: [{ type: 'text', text: 'OK' }] };
});
await sdk.scheduler.register({ id: 'sync', cron: '0 9 * * *' });
```

### 模式 3：事件订阅/发布

```typescript
const unsub = sdk.events.on('clipboard-change', (data) => { ... });
sdk.events.emit('myPlugin:dataUpdated', { id: 123 });
```
