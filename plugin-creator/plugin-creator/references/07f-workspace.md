# workspace / scheduler / plugin / context — 工作区

## workspace

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `registerView` | `viewType: string, viewClass: unknown` | `any` | 注册自定义视图类型。 |
| `unregisterView` | `viewType: string` | `any` | 注销自定义视图类型。 |
| `getPath` | `—` | `string` | 获取当前工作区路径。 |
| `getMetadata` | `—` | `unknown` | 获取当前工作区元数据。 |
| `setOutline` | `sessionId: string, outline: unknown[]` | `any` | 设置文档大纲。 |
| `setProperties` | `sessionId: string, properties: Record<string, unknown>` | `any` | 设置会话属性。 |
| `getProperties` | `sessionId: string` | `any` | 获取会话属性。 |
| `getProperty` | `sessionId: string, key: string` | `unknown` | 获取单个会话属性。 |
| `setProperty` | `sessionId: string, key: string, value: unknown` | `void` | 设置单个会话属性。 |
| `registerPanels` | `sessionId: string, panels: unknown[]` | `any` | 注册面板。 |
| `getActiveTabId` | `—` | `any` | 获取当前活动标签页 ID。 |
| `getActiveTabConfig` | `—` | `any` | 获取当前活动标签页配置。 |
| `registerRibbonIcon` | `id, icon, title, onClick, pluginId?, onContextMenu?` | `any` | 注册侧边栏图标。 |
| `unregisterRibbonIcon` | `id: string` | `any` | 注销侧边栏图标。 |
| `registerFolderContextMenuItem` | `item: FolderContextMenuItem` | `any` | 注册文件夹右键菜单项。 |
| `unregisterFolderContextMenuItem` | `id: string` | `any` | 注销文件夹右键菜单项。 |
| `registerLink` | `id: string, title: string, url: string` | `any` | 注册链接。 |
| `unregisterLink` | `id: string` | `any` | 注销链接。 |
| `openWorkspaceTab` | `options: OpenTabOptions` | `any` | 在主窗口打开工作区标签页。 |
| `splitActiveTab` | `direction: 'right' \| 'bottom'` | `any` | 分割当前活动标签页。 |
| `updateActiveTabInfo` | `name: string, newConfig: Record<string, unknown>` | `any` | 更新活动标签页信息。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const path = await sdk.workspace.getPath();
sdk.workspace.registerRibbonIcon('my-icon', 'icon.png', '我的插件', () => {
  sdk.workspace.openWorkspaceTab({ filePath: '/path/to/file' });
});
```

> **注意**：controller 中还有 addRecentDocument、getRecentDocuments、searchDocuments、getActiveTabOutline、notifyPluginNavigate、getPluginsByExtension 等方法，但**未注册到 SDK**。

## scheduler

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `register` | `options: { id, cron?, intervalMs?, command?, args?, cwd? }` | `void` | 注册定时任务（cron 或 interval）。必须在后台进程注册。 |
| `unregister` | `id: string` | `void` | 注销定时任务。 |
| `list` | `—` | `unknown[]` | 列出当前插件所有定时任务。 |

## plugin

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getInfo` | `—` | `PluginInfo` | 获取当前插件元信息（id, name, version, path）。 |
| `getLifecycleContext` | `—` | `PluginLifecycleContext` | 获取当前插件生命周期上下文。 |

## context

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getActiveApp` | `—` | `ActiveAppInfo` | 获取当前活动应用信息。 |
| `getSelection` | `—` | `SelectionInfo \| null` | 获取当前选中文本及来源应用。 |
| `onActiveAppChanged` | `cb: (appInfo: ActiveAppInfo) => void` | `void` | 监听活动应用变化。 |

## selectionMenu

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `registerItem` | `item: SelectionMenuItem` | `void` | 注册划词菜单项。 |
| `unregisterItem` | `id: string` | `void` | 注销划词菜单项。 |

> **注意**：controller 中还有 articles（get、update）方法，但**未注册到 SDK**。
