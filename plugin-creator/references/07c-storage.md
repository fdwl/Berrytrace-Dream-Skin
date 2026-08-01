# storage — 存储


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## storage

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `clear` | `—` | `null` |  |
| `db_execute` | `sql: string, params: unknown[]` | `unknown` | 执行 SQL 语句。SELECT / PRAGMA 返回查询结果数组，其他语句返回 lastInsertRowid 和 … |
| `db_run` | `sql: string, params: unknown[]` | `unknown` | 执行 SQL 语句（别名，与 execute 行为一致）。 |
| `delete` | `key: string` | `null` |  |
| `get` | `key: string, defaultValue: unknown` | `unknown` |  |
| `getItem` | `key: string, defaultValue: unknown` | `unknown` |  |
| `kv_clear` | `—` | `null` |  |
| `kv_delete` | `key: string` | `null` |  |
| `kv_get` | `key: string, defaultValue: unknown` | `unknown` | 读取键值对数据。 |
| `kv_set` | `key: string, value: unknown` | `null` |  |
| `removeItem` | `key: string` | `null` |  |
| `set` | `key: string, value: unknown` | `null` |  |
| `setItem` | `key: string, value: unknown` | `null` |  |

**调用示例**：
```typescript
await callApi('storage', 'clear', []);
```

