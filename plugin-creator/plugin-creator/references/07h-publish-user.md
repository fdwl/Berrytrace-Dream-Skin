# publish / user — 发布与用户

## user

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setUser` | `user: { id: string; name: string }` | `void` | 设置当前用户信息（OEM 场景）。 |
| `getUser` | `—` | `{ id, name } \| null` | 获取当前用户信息。 |
| `setLoggedIn` | `loggedIn: boolean` | `void` | 设置登录状态。 |
| `isLoggedIn` | `—` | `boolean` | 查询是否已登录。 |
| `onChange` | `cb: (payload: { loggedIn, user }) => void` | `() => void` | 监听用户状态变化，返回取消订阅函数。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

// 设置用户（OEM 场景）
await sdk.user.setUser({ id: '12345', name: '张三' });

// 获取用户信息
const user = await sdk.user.getUser();
// { id: '12345', name: '张三' } 或 null

// 监听登录状态变化
const unsubscribe = sdk.user.onChange(({ loggedIn, user }) => {
  console.log('登录状态变化:', loggedIn, user);
});
```

> **注意**：controller 中还有 publish（createShare、deleteShare、listShares、updateShare）和 user.getMembershipStatus 方法，但**未注册到 SDK**。
