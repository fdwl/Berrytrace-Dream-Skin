# 07 — 运行时 API

所有 API 通过 `callApi(namespace, methodName, args)` 调用。


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## API 速查

| 模块 | 文档 | 方法数 | 敏感 |
|------|------|--------|:----:|
| `system` | [07a-system.md](./07a-system.md) | 40 | 🔒 |
| `filesystem` | [07b-filesystem.md](./07b-filesystem.md) | 16 | 🔒 |
| `storage` | [07c-storage.md](./07c-storage.md) | 13 |  |
| `ai` | [07d-ai-mcp.md](./07d-ai-mcp.md) | 11 |  |
| `mcp` | [07d-ai-mcp.md](./07d-ai-mcp.md) | 11 |  |
| `window` | [07e-window.md](./07e-window.md) | 12 |  |
| `dialog` | [07e-window.md](./07e-window.md) | 2 |  |
| `log` | [07e-window.md](./07e-window.md) | 4 |  |
| `commands` | [07e-window.md](./07e-window.md) | 3 |  |
| `workspace` | [07f-workspace.md](./07f-workspace.md) | 14 |  |
| `scheduler` | [07f-workspace.md](./07f-workspace.md) | 3 |  |
| `articles` | [07f-workspace.md](./07f-workspace.md) | 2 |  |
| `context` | [07f-workspace.md](./07f-workspace.md) | 2 |  |
| `plugin` | [07f-workspace.md](./07f-workspace.md) | 4 |  |
| `selectionMenu` | [07f-workspace.md](./07f-workspace.md) | 2 |  |
| `local-ai` | [07g-local-ai-search.md](./07g-local-ai-search.md) | 11 |  |
| `search` | [07g-local-ai-search.md](./07g-local-ai-search.md) | 2 |  |
| `publish` | [07h-publish-user.md](./07h-publish-user.md) | 7 |  |
| `user` | [07h-publish-user.md](./07h-publish-user.md) | 5 |  |
| `hooks` | [07i-hooks.md](./07i-hooks.md) | 4 |  |
| 回调 API | [07z-callbacks.md](./07z-callbacks.md) | — | |

---

## 核心调用模式

### 模式 1：callApi — 字符串派发

所有 JSON 可序列化的数据 API 通过 `callApi` 调用。

```typescript
const result = await callApi('system', 'execCommand', [{ command: 'ls' }]);
const files  = await callApi('filesystem', 'readDir', ['/path/to/dir']);
const theme  = await callApi('system', 'getTheme', []);
```

调度：`callApi → ApiDispatcher.dispatch → Controller.execute`

### 模式 2：注册回调

handler 为 JS 函数，**必须在后台进程注册**。详见 [07z-callbacks.md](./07z-callbacks.md)。

```typescript
mcp.registerToolHandler('my_tool', async (args) => { return { content: [...] }; });
scheduler.register({ id: 'sync', cron: '0 9 * * *', handler: async () => {} });
```

### 模式 3：事件订阅/发布

```typescript
const unsub = events.on('clipboard-change', (data) => { ... });
events.emit('myPlugin:dataUpdated', { id: 123 });
```
