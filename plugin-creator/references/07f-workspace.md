# workspace / scheduler / plugin / context — 工作区


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## workspace

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addRecentDocument` | `filePath: string, title: string` | `null` | 添加文档到最近打开记录。 |
| `getActiveSessionContext` | `—` | `Promise<{
    openTabs: Array<{ tabId?: …` | 获取宿主 FlexWorkspace 维护的当前全量激活会话与打开标签页上下文。 |
| `getActiveTabOutline` | `—` | `unknown` | 获取当前活动标签页的文档大纲。 |
| `getMetadata` | `—` | `unknown` | 获取当前工作区元数据。 |
| `getPath` | `—` | `string | null` | 获取当前工作区路径。 |
| `getPluginsByExtension` | `ext: string` | `unknown[]` | 查询能处理指定扩展名的插件列表。 |
| `getProjectConfig` | `workspacePath: string` | `Record<string, any>` | 读取项目根目录下 .berrytrace/config.json 配置 |
| `getRecentDocuments` | `—` | `unknown[]` | 获取最近打开的文档列表。 |
| `notifyPluginNavigate` | `options: {
    pluginId: string;
    filePath: string;
    lineNumber?: number;
    headingText?: string;
  }` | `null` | 通知指定插件导航到文件位置。 |
| `openBrowserTab` | `url: string, title?: string` | `null` | 在工作区中打开浏览器标签页（主窗口）。自动显示并聚焦主窗口。 |
| `openWorkspaceTab` | `filePath: string | undefined, targetPluginId: string, extension?: string, articleId?: string, sessionId?: string, replaceActiveTab?: boolean, title?: string, line?: number, customParams?: Record<string, unknown>` | `null` | 在主窗口打开工作区标签页。自动显示并聚焦主窗口。 |
| `saveProjectConfig` | `options: { workspacePath: string; config: Record<string, any> } | string, configArg?: Record<string, any>` | `boolean` | 保存配置到项目根目录下 .berrytrace/config.json |
| `scanPorts` | `workspacePath: string` | `Array<{ port: number; processName: strin…` |  |
| `searchDocuments` | `options: { query: string; workspacePath: string }` | `unknown[]` | 在工作区中全文搜索文档。 |

**调用示例**：
```typescript
await callApi('workspace', 'addRecentDocument', [{ filePath, title }]);
```

## scheduler

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `list` | `—` | `unknown[]` | 列出当前插件所有定时任务。 |
| `register` | `options: { id: string; cron?: string; intervalMs?: number; command?: string; args?: string[]; cwd?: string }` | `null` | 注册定时任务（cron 或 interval）。必须在后台进程注册。 await callApi("scheduler"… |
| `unregister` | `id: string` | `null` | 注销定时任务。 |

**调用示例**：
```typescript
await callApi('scheduler', 'list', []);
```

## articles

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `get` | `articleId: string` | `unknown` | 读取文章内容。 |
| `update` | `articleId: string, title: string, content: string` | `null` | 更新文章标题和内容。 |

**调用示例**：
```typescript
await callApi('articles', 'get', [articleId]);
```

## context

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getActiveApp` | `—` | `unknown` | 获取当前活动应用信息。 |
| `getSelection` | `—` | `unknown` | 获取当前选中文本及来源应用。 |

**调用示例**：
```typescript
await callApi('context', 'getActiveApp', []);
```

## plugin

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `ensurePluginLoaded` | `targetPluginId: string` | `unknown` | 按需确保加载目标插件 Manifest/服务。 |
| `getInfo` | `—` | `unknown` | 获取当前插件元信息。 |
| `getLifecycleContext` | `—` | `unknown` | 获取当前插件生命周期上下文。 |
| `isPluginEnabled` | `targetPluginId: string` | `boolean` | 检查指定插件是否被启用。 |

**调用示例**：
```typescript
await callApi('plugin', 'ensurePluginLoaded', [targetPluginId]);
```

## selectionMenu

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `registerItem` | `item: SelectionMenuItem` | `null` | 注册划词菜单项。 |
| `unregisterItem` | `id: string` | `null` | 注销划词菜单项。 |

**调用示例**：
```typescript
await callApi('selectionMenu', 'registerItem', [item]);
```

