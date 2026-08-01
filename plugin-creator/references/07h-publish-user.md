# publish / user — 发布与用户


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## publish

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addOrUpdateShare` | `args: { filePath: string; workspacePath: string; record: Record<string, unknown> }` | `any` | 添加或更新本地分享记录。 |
| `createShare` | `args: CreateShareArgs` | `CreateShareData` | 创建分享链接。需先登录。 |
| `deleteShare` | `args: DeleteShareArgs` | `{ success: boolean }` | 删除分享链接。 |
| `getShareByPath` | `args: { filePath: string; workspacePath: string }` | `any` | 根据文件路径获取本地分享记录。 |
| `listShares` | `_args: unknown` | `ListShareData` | 列出当前用户所有分享。 |
| `removeShare` | `args: { filePath: string; workspacePath: string }` | `any` | 删除本地分享记录。 |
| `updateShare` | `args: UpdateShareArgs` | `CreateShareData` | 更新分享链接内容。 |

**调用示例**：
```typescript
await callApi('publish', 'addOrUpdateShare', [args]);
```

## user

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getMembershipStatus` | `—` | `unknown` | 查询当前用户会员状态。 |
| `getUser` | `—` | `{ id: string; name: string } | null` |  |
| `isLoggedIn` | `—` | `boolean` |  |
| `setLoggedIn` | `loggedIn: boolean` | `void` |  |
| `setUser` | `user: { id: string; name: string }` | `void` |  |

**调用示例**：
```typescript
await callApi('user', 'getMembershipStatus', []);
```

