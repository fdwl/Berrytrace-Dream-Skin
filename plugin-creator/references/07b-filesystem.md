# filesystem — 文件系统


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## filesystem

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `copyDir` | `srcPath: string, dstPath: string` | `null` | 递归复制目录。 |
| 🔒 `deleteFile` | `path: string` | `null` | 删除文件。 |
| 🔒 `downloadFile` | `url: string, destPath: string` | `null` | 下载文件到本地。自动创建目标目录。 |
| `extractZip` | `zipPath: string, destDir: string, overwrite?: boolean` | `null` | 解压 zip 文件到目标目录。内置 Zip Slip 安全检查。 |
| `getFileIcon` | `filePath: string` | `string` | 获取指定文件/程序的原生 OS 图标（Base64 PNG data URL）。 |
| `getSafePath` | `name: string` | `string` | 获取系统安全路径。仅允许 userData / documents / desktop / temp。 |
| `hashFile` | `filePath: string, algorithm?: string` | `string` | 计算文件的哈希值。 |
| 🔒 `mkdir` | `path: string` | `null` | 递归创建目录。 |
| `readChunk` | `filePath: string, offset: any, length: any, encoding: any` | `string` | 按需切片读取文件。只读取指定 offset 和 length 范围的 Buffer，绝不全量装载超大文件。 |
| `readDir` | `path: string` | `Array<{ name: string; isDirectory: boole…` | 列出目录下的文件和子目录。 |
| `readFile` | `path: string, encoding?: string` | `string` | 读取文件内容。 |
| 🔒 `removeDir` | `dirPath: string` | `null` | 递归删除目录。 |
| 🔒 `renameFile` | `oldPath: string, newPath: string` | `null` | 重命名/移动文件。 |
| `showItemInFolder` | `path: string` | `null` | 在系统文件管理器中显示文件。 |
| `stat` | `path: string` | `{ isFile: boolean; isDirectory: boolean;…` | 获取文件或目录的元信息。 |
| 🔒 `writeFile` | `path: string, content: string | Buffer` | `null` | 写入文件内容（覆盖已有文件）。 |

**调用示例**：
```typescript
await callApi('filesystem', 'copyDir', [{ srcPath, dstPath }]);
```

