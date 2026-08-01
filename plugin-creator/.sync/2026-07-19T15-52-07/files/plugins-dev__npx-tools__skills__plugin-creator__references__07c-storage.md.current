# storage — 存储

## storage.kv — 键值对

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `kv.get` | `key: string, defaultValue?: unknown` | `unknown` | 读取键值对数据。 |
| `kv.set` | `key: string, value: unknown` | `void` | 写入键值对数据，会覆盖已有值。 |
| `kv.delete` | `key: string` | `void` | 删除指定键值对。 |
| `kv.clear` | `—` | `void` | 清空当前插件所有键值对数据。 |

## storage.db — SQLite

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `db.execute` | `sql: string, params?: unknown[]` | `Record<string, unknown>[]` | 执行 SQL 语句。SELECT 返回查询结果数组。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

// KV 存储
await sdk.storage.kv.set('lastSync', Date.now());
const lastSync = await sdk.storage.kv.get('lastSync', 0);

// SQLite
const rows = await sdk.storage.db.execute(
  'SELECT * FROM items WHERE category = ?',
  ['note']
);
```

> **注意**：controller 中还有 `db.run` 方法，但**未注册到 SDK**（功能与 `db.execute` 一致）。
