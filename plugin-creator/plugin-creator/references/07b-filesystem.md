# filesystem — 文件系统

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `readFile` | `path: string, encoding?: string` | `string \| Buffer` | 读取文件内容。 |
| `writeFile` | `path: string, content: string \| Buffer` | `void` | 写入文件内容（覆盖已有文件）。 |
| `readDir` | `path: string` | `Array<{ name, isDirectory, isFile }>` | 列出目录下的文件和子目录。 |
| `stat` | `path: string` | `{ isFile, isDirectory, size, mtimeMs }` | 获取文件或目录的元信息。 |
| `mkdir` | `path: string` | `void` | 递归创建目录。 |
| `renameFile` | `oldPath: string, newPath: string` | `void` | 重命名/移动文件。 |
| `deleteFile` | `path: string` | `void` | 删除文件。 |
| `getSafePath` | `name: string` | `string` | 获取系统安全路径。支持：`userData` / `documents` / `desktop` / `temp` / `skills` / **`pluginData`**（插件专属数据目录，用于生成式声明贡献文件）。 |
| `showItemInFolder` | `path: string` | `void` | 在系统文件管理器中显示文件。 |
| `extractZip` | `zipPath: string, destDir: string, overwrite?: boolean` | `void` | 解压 zip 文件到目标目录。 |
| `copyDir` | `src: string, dst: string` | `void` | 递归复制目录。 |
| `removeDir` | `path: string` | `void` | 递归删除目录。 |
| `hashFile` | `path: string, algorithm?: string` | `string` | 计算文件的哈希值。 |
| `downloadFile` | `url: string, destPath: string` | `void` | 下载文件到本地。自动创建目标目录。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const content = await sdk.filesystem.readFile('/path/to/file.txt', 'utf-8');
await sdk.filesystem.writeFile('/path/to/output.txt', 'hello');
const entries = await sdk.filesystem.readDir('/path/to/dir');
```
