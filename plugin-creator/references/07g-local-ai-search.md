# local-ai / search — 本地 AI 与搜索


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## local-ai

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `embedding` | `text: string` | `unknown` | 获取文本嵌入向量（与 getEmbedding 相同）。 |
| `getAppPath` | `—` | `string` | 返回宿主 app 目录（用于插件定位 node_modules/@huggingface/transformers）。 … |
| `getEmbedding` | `text: string` | `unknown` | 获取文本嵌入向量。 |
| `getModelDir` | `—` | `string` | 返回宿主模型存储目录，提供给插件获取下载/扫描本地模型的根路径。 |
| `indexAllSkills` | `—` | `boolean` | 对所有 Skill 建立 FTS5 全文索引。 |
| `indexToolsLibrary` | `tools: any[]` | `boolean` | 索引工具库到全文搜索引擎。 注意：此方法立即返回 true，实际的索引工作（含向量 embedding 生成）在后台异步… |
| `ocr` | `imagePath: string` | `unknown` | 对图片执行 OCR 文字识别（与 runOCR 相同）。 |
| `rebuildAllIndices` | `—` | `boolean` | 全量重建所有索引（Tools + Skills + Files 的 FTS5 全文索引 + 向量索引）。 此操作可能耗时… |
| `runOCR` | `imagePath: string` | `unknown` | 对图片执行 OCR 文字识别。 |
| `searchAgentCapabilities` | `query: string` | `unknown` | 搜索 Agent 能力（混合检索：FTS5 全文 + 向量 RRF 融合）。 |
| `status` | `—` | `unknown` | 查询本地 AI 服务状态。 |

**调用示例**：
```typescript
await callApi('local-ai', 'embedding', [text]);
```

## search

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `searchFiles` | `query: string, workspacePath: string` | `unknown` | 全文搜索工作区文件。 |
| `searchNotes` | `query: string, calendarUuid: number` | `unknown` | 全文搜索笔记。 |

**调用示例**：
```typescript
await callApi('search', 'searchFiles', [{ query, workspacePath }]);
```

