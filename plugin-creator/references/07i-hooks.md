# hooks — 跨插件 Hooks


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## hooks

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `call` | `args: unknown[]` | `unknown` | 调用 Hook，返回所有注册处理器的合并结果。 |
| `register` | `args: unknown[]` | `void` | 注册 Hook 处理器。 |
| `unregister` | `args: unknown[]` | `void` | 注销 Hook。 |
| `unregisterPlugin` | `args: unknown[]` | `void` | 清理指定插件的所有 hooks |

**调用示例**：
```typescript
await callApi('hooks', 'call', [args]);
```

