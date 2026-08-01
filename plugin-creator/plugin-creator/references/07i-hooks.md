# hooks — 跨插件 Hooks

## hooks

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `register` | `name: string, handler: (...args) => Promise<unknown>, priority?: number` | `void` | 注册 Hook 处理器。priority 越大越先执行。 |
| `unregister` | `name: string` | `void` | 注销当前插件在指定 Hook 上的处理器。 |
| `call` | `name: string, args?: unknown[], opts?: { merge?, timeoutMs? }` | `T \| null` | 调用 Hook，返回所有注册处理器的合并结果。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

// 注册 Hook
await sdk.hooks.register('user:getMembershipStatus', async () => {
  return { isVip: true, points: 100 };
}, 10);

// 调用 Hook
const result = await sdk.hooks.call('user:getMembershipStatus');
```

> **注意**：controller 中还有 `unregisterPlugin` 方法（清理指定插件的所有 hooks），但**未注册到 SDK**。
