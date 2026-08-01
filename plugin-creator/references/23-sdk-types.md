# 23 — SDK 核心类型与基类

> 此文件由 `scripts/generate-skill-docs.js` 自动生成，来源: `plugins-sdk/types.ts`
> 这些类型不在 controller 中，但对插件开发至关重要。

## CommandOptions

> 命令选项 用于注册可执行的命令

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 命令唯一标识符 */
  id` | `string` | 命令唯一标识符 |
| `/** 命令显示名称 */
  name` | `string` | 命令显示名称 |
| `/** 命令描述（可选） */
  description?` | `string` | 命令描述（可选） |
| `/** 命令图标（可选，支持 emoji 或图标类名） */
  icon?` | `string` | 命令图标（可选，支持 emoji 或图标类名） |
| `/** 快捷键（可选），如 'CmdOrCtrl+Shift+P' */
  shortcut?` | `string` | 快捷键（可选），如 'CmdOrCtrl+Shift+P' |
| `/** 命令处理函数 */
  handler` | `(args?: Record<string, unknown>) => Promise<unknow…` | 命令处理函数 |

## HostCommandAPI

> 宿主命令 API（仅 background / main 插件有意义） 用于订阅宿主下发的命令。命令（Command）与事件（Event）的语义区别： - sdk.events.on → 广播通知：某事已发生，任意插件可发射，任意插件可订阅 - sdk.host.onCommand → 宿主指令：宿主请你做某事，只有宿主可发射，只有目标插件订阅 // Agent 内核插件监听执行任务命令 const off = sdk.host.onCommand('agent:execute_task', (payload) => { // payload 是 AgentExecuteTaskPayload，有完整类型 kernel.executeTask(payload); });

| 字段 | 类型 | 说明 |
|------|------|------|

## FloatWindowOptions

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` | `string` |  |
| `width?` | `number` |  |
| `height?` | `number` |  |
| `x?` | `number` |  |
| `y?` | `number` |  |
| `alwaysOnTop?` | `boolean` |  |
| `resizable?` | `boolean` |  |
| `title?` | `string` |  |
| `frame?` | `boolean` |  |
| `transparent?` | `boolean` |  |
| `skipTaskbar?` | `boolean` |  |
| `focusable?` | `boolean` |  |
| `ignoreMouseEvents?` | `boolean` |  |
| `hasShadow?` | `boolean` |  |
| `show?` | `boolean` |  |
| `fullscreen?` | `boolean` |  |
| `type?` | `string` |  |

## OpenTabOptions

> 打开工作区标签页的参数（统一为命名接口，易扩展）

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 文件路径（与 pluginId 至少提供其一） */
  filePath?` | `string` | 文件路径（与 pluginId 至少提供其一） |
| `/** 插件 ID（与 filePath 至少提供其一） */
  pluginId?` | `string` | 插件 ID（与 filePath 至少提供其一） |
| `/** 文件扩展名 */
  extension?` | `string` | 文件扩展名 |
| `/** 文章 ID */
  articleId?` | `string` | 文章 ID |
| `/** 会话 ID */
  sessionId?` | `string` | 会话 ID |
| `/** 是否替换当前活动标签页 */
  replaceActiveTab?` | `boolean` | 是否替换当前活动标签页 |
| `/** 标签页标题 */
  title?` | `string` | 标签页标题 |
| `/** 行号（自动跳转到指定行） */
  line?` | `number` | 行号（自动跳转到指定行） |
| `/** 自定义业务参数字典（打开 Tab 时可附带任意数据，后续可通过 getActiveTabConfig() 获取） */
  customParams?` | `Record<string, unknown>` | 自定义业务参数字典（打开 Tab 时可附带任意数据，后续可通过 getActiveTabConfig() 获取） |

## RegisterViewConfig

> 统一注册视图配置（推荐写法） 将 ViewClass 注册与渲染位置声明合并为一次调用，消除 viewType 字符串的外部耦合。 // 注册到设置面板 sdk.workspace.registerView({ viewType: 'com.xxx:settings', viewClass: MySettingsView, placement: { type: 'settings', label: '插件设置', order: 90 }, }); // 注册到工作区 Tab（无需 placement 元信息） sdk.workspace.registerView({ viewType: 'com.xxx:workspace', viewClass: MyEditorView, placement: { type: 'workspace' }, });

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 视图唯一标识，如 'com.berrytrace.plugin.xxx:workspace' */
  viewType` | `string` | 视图唯一标识，如 'com.berrytrace.plugin.xxx:workspace' |
| `/** View 类（需继承 View 基类），接受 (container, sdk) 构造参数 */
  viewClass` | `new (container: HTMLElement, app: any) => unknown` | View 类（需继承 View 基类），接受 (container, sdk) 构造参数 |
| `/** 声明此 View 渲染在哪里以及对应的元信息 */
  placement` | `ViewPlacement` | 声明此 View 渲染在哪里以及对应的元信息 |

## WorkspaceActionConfig

> 工作区操作配置（注册到标签页"更多操作"下拉菜单）

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 操作唯一标识符 */
  id` | `string` | 操作唯一标识符 |
| `/** 所属插件 ID */
  pluginId` | `string` | 所属插件 ID |
| `/** 显示标签 */
  label` | `string` | 显示标签 |
| `/** 图标（可选） */
  icon?` | `string` | 图标（可选） |
| `/** 是否显示在工具栏（可选） */
  showInToolbar?` | `boolean` | 是否显示在工具栏（可选） |
| `/** 适用的视图类型列表（可选，为空则对所有视图适用） */
  viewTypes?` | `string[]` | 适用的视图类型列表（可选，为空则对所有视图适用） |
| `/** 适用的文件扩展名列表（可选） */
  extensions?` | `string[]` | 适用的文件扩展名列表（可选） |
| `/** 在操作之前或之后渲染分割线，用于分组 */
  divider?` | `'before' | 'after'` | 在操作之前或之后渲染分割线，用于分组 |
| `/** 点击回调 */
  onClick` | `(params: {
    tabId: string;
    filePath?: strin…` | 点击回调 |
| `/** 判断操作是否为激活状态（可选） */
  isActive?` | `(params: {
    tabId: string;
    filePath?: strin…` | 判断操作是否为激活状态（可选） |
| `/** 判断操作是否可用（可选） */
  isEnabled?` | `(params: {
    tabId: string;
    filePath?: strin…` | 判断操作是否可用（可选） |

## PluginLifecycleContext

| 字段 | 类型 | 说明 |
|------|------|------|
| `action` | `PluginLifecycleAction` |  |
| `loadMode` | `PluginLoadMode` |  |
| `updatedAt` | `string` |  |
| `trigger?` | `{
    eventName: string;
    payload: any;
  }` |  |

## WorkspaceContextChangedPayload

> 工作区上下文变更载荷。 当用户切换工作区时，所有已加载的 workspace-scoped 插件会收到此通知。 插件应在此钩子中更新内部缓存的 workspacePath，而不是依赖 onload 时的快照。

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 旧工作区路径 */
  oldWorkspacePath` | `string | null` | 旧工作区路径 |
| `/** 新工作区路径 */
  newWorkspacePath` | `string | null` | 新工作区路径 |

## Plugin（抽象基类）

### 构造函数

```typescript
constructor(app: BerryTraceSDK, manifest: unknown)
```

### 方法

| 方法 | 说明 |
|------|------|
| `abstract onload()` |  |
| `abstract onunload()` |  |
| `onWorkspaceContextChanged()` | 工作区上下文变更钩子（可选实现）。 当用户切换工作区时调用。插件应在此方法中： 1. 更新内部缓存的 workspacePath（不要依赖 onload 时的快照） 2. 重新绑定文件监听、定时器等与工作区路径相关的资源 3. 刷新视图数据 注意：此钩子不会在 onload 后立即调用，仅在实际工作区切换时触发。 如果插件在 onload 中缓存了 workspacePath，必须实现此钩子以避免交叉引用错误。 |

## View（抽象基类）

### 构造函数

```typescript
constructor(container: HTMLElement, app: BerryTraceSDK)
```

### 方法

| 方法 | 说明 |
|------|------|
| `abstract getViewType()` |  |
| `abstract getDisplayText()` |  |
| `abstract onOpen()` |  |
| `abstract onClose()` |  |
| `beforeClose()` | Tab 关闭前调用。 |

## SchedulerRegisterOptions

> 调度器注册选项 用于注册定时或周期性执行的任务

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 任务唯一标识符 */
  id` | `string` | 任务唯一标识符 |
| `/** Cron 表达式（如 '0 * * * *' 表示每小时整点执行） */
  cron?` | `string` | Cron 表达式（如 '0 * * * *' 表示每小时整点执行） |
| `/** 执行间隔（毫秒），与 cron 二选一 */
  intervalMs?` | `number` | 执行间隔（毫秒），与 cron 二选一 |
| `/** 是否仅执行一次 */
  once?` | `boolean` | 是否仅执行一次 |
| `/** 指定的单次执行时间戳（毫秒） */
  executeAt?` | `number` | 指定的单次执行时间戳（毫秒） |
| `/** 要执行的命令 */
  command?` | `string` | 要执行的命令 |
| `/** 命令参数 */
  args?` | `string[]` | 命令参数 |
| `/** 命令执行的工作目录 */
  cwd?` | `string` | 命令执行的工作目录 |

## SelectionMenuItem

> 划词菜单注册项 插件可通过 selectionMenu API 注册按钮到划词菜单

| 字段 | 类型 | 说明 |
|------|------|------|
| `/** 唯一标识，如 'save-to-diary' */
  id` | `string` | 唯一标识，如 'save-to-diary' |
| `/** 显示文本，如 '保存到日记' */
  label` | `string` | 显示文本，如 '保存到日记' |
| `/** SVG 字符串图标，如 '<svg viewBox="0 0 24 24">...</svg>' */
  icon?` | `string` | SVG 字符串图标，如 '<svg viewBox="0 0 24 24">...</svg>' |
| `/** ViewClass 类型（用于嵌入模式），如 'com.berrytrace.plugin.diary:selection-view' */
  viewType?` | `string` | ViewClass 类型（用于嵌入模式），如 'com.berrytrace.plugin.diary:selection-view' |
| `/** 所属插件 ID */
  pluginId?` | `string` | 所属插件 ID |
| `/** 钮说明/title */
  description?` | `string` | 钮说明/title |

## CommandOptions

> 命令选项 用于注册可执行的命令

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 命令唯一标识符 |
| `name` | `string` | 命令显示名称 |
| `description?` | `string` | 命令描述（可选） |
| `icon?` | `string` | 命令图标（可选，支持 emoji 或图标类名） |
| `shortcut?` | `string` | 快捷键（可选），如 'CmdOrCtrl+Shift+P' |
| `handler` | `(args?: Record<string, unknown>) => Promise<unknow…` | 命令处理函数 |

## HostCommandAPI

> 宿主命令 API（仅 background / main 插件有意义） 用于订阅宿主下发的命令。命令（Command）与事件（Event）的语义区别： - sdk.events.on → 广播通知：某事已发生，任意插件可发射，任意插件可订阅 - sdk.host.onCommand → 宿主指令：宿主请你做某事，只有宿主可发射，只有目标插件订阅 // Agent 内核插件监听执行任务命令 const off = sdk.host.onCommand('agent:execute_task', (payload) => { // payload 是 AgentExecuteTaskPayload，有完整类型 kernel.executeTask(payload); });

| 字段 | 类型 | 说明 |
|------|------|------|

## FloatWindowOptions

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` | `string` |  |
| `width?` | `number` |  |
| `height?` | `number` |  |
| `x?` | `number` |  |
| `y?` | `number` |  |
| `alwaysOnTop?` | `boolean` |  |
| `resizable?` | `boolean` |  |
| `title?` | `string` |  |
| `frame?` | `boolean` |  |
| `transparent?` | `boolean` |  |
| `skipTaskbar?` | `boolean` |  |
| `focusable?` | `boolean` |  |
| `ignoreMouseEvents?` | `boolean` |  |
| `hasShadow?` | `boolean` |  |
| `show?` | `boolean` |  |
| `fullscreen?` | `boolean` |  |
| `type?` | `string` |  |

## OpenTabOptions

> 打开工作区标签页的参数（统一为命名接口，易扩展）

| 字段 | 类型 | 说明 |
|------|------|------|
| `filePath?` | `string` | 文件路径（与 pluginId 至少提供其一） |
| `pluginId?` | `string` | 插件 ID（与 filePath 至少提供其一） |
| `extension?` | `string` | 文件扩展名 |
| `articleId?` | `string` | 文章 ID |
| `sessionId?` | `string` | 会话 ID |
| `replaceActiveTab?` | `boolean` | 是否替换当前活动标签页 |
| `title?` | `string` | 标签页标题 |
| `line?` | `number` | 行号（自动跳转到指定行） |
| `customParams?` | `Record<string, unknown>` | 自定义业务参数字典（打开 Tab 时可附带任意数据，后续可通过 getActiveTabConfig() 获取） |

## RegisterViewConfig

> 统一注册视图配置（推荐写法） 将 ViewClass 注册与渲染位置声明合并为一次调用，消除 viewType 字符串的外部耦合。 // 注册到设置面板 sdk.workspace.registerView({ viewType: 'com.xxx:settings', viewClass: MySettingsView, placement: { type: 'settings', label: '插件设置', order: 90 }, }); // 注册到工作区 Tab（无需 placement 元信息） sdk.workspace.registerView({ viewType: 'com.xxx:workspace', viewClass: MyEditorView, placement: { type: 'workspace' }, });

| 字段 | 类型 | 说明 |
|------|------|------|
| `viewType` | `string` | 视图唯一标识，如 'com.berrytrace.plugin.xxx:workspace' |
| `viewClass` | `new (container: HTMLElement, app: any) => unknown` | View 类（需继承 View 基类），接受 (container, sdk) 构造参数 |
| `placement` | `ViewPlacement` | 声明此 View 渲染在哪里以及对应的元信息 |

## WorkspaceActionConfig

> 工作区操作配置（注册到标签页"更多操作"下拉菜单）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 操作唯一标识符 |
| `pluginId` | `string` | 所属插件 ID |
| `label` | `string` | 显示标签 |
| `icon?` | `string` | 图标（可选） |
| `showInToolbar?` | `boolean` | 是否显示在工具栏（可选） |
| `viewTypes?` | `string[]` | 适用的视图类型列表（可选，为空则对所有视图适用） |
| `extensions?` | `string[]` | 适用的文件扩展名列表（可选） |
| `divider?` | `'before' | 'after'` | 在操作之前或之后渲染分割线，用于分组 |
| `onClick` | `(params: {
    tabId: string;
    filePath?: strin…` | 点击回调 |
| `isActive?` | `(params: {
    tabId: string;
    filePath?: strin…` | 判断操作是否为激活状态（可选） |
| `isEnabled?` | `(params: {
    tabId: string;
    filePath?: strin…` | 判断操作是否可用（可选） |

## PluginLifecycleContext

| 字段 | 类型 | 说明 |
|------|------|------|
| `action` | `PluginLifecycleAction` |  |
| `loadMode` | `PluginLoadMode` |  |
| `updatedAt` | `string` |  |
| `trigger?` | `{
    eventName: string;
    payload: any;
  }` |  |

## WorkspaceContextChangedPayload

> 工作区上下文变更载荷。 当用户切换工作区时，所有已加载的 workspace-scoped 插件会收到此通知。 插件应在此钩子中更新内部缓存的 workspacePath，而不是依赖 onload 时的快照。

| 字段 | 类型 | 说明 |
|------|------|------|
| `oldWorkspacePath` | `string | null` | 旧工作区路径 |
| `newWorkspacePath` | `string | null` | 新工作区路径 |

## Plugin（抽象基类）

### 构造函数

```typescript
constructor(app: BerryTraceSDK, manifest: unknown)
```

### 方法

| 方法 | 说明 |
|------|------|
| `abstract onload()` |  |
| `abstract onunload()` |  |
| `onWorkspaceContextChanged()` | 工作区上下文变更钩子（可选实现）。 当用户切换工作区时调用。插件应在此方法中： 1. 更新内部缓存的 workspacePath（不要依赖 onload 时的快照） 2. 重新绑定文件监听、定时器等与工作区路径相关的资源 3. 刷新视图数据 注意：此钩子不会在 onload 后立即调用，仅在实际工作区切换时触发。 如果插件在 onload 中缓存了 workspacePath，必须实现此钩子以避免交叉引用错误。 |

## View（抽象基类）

### 构造函数

```typescript
constructor(container: HTMLElement, app: BerryTraceSDK)
```

### 方法

| 方法 | 说明 |
|------|------|
| `abstract getViewType()` |  |
| `abstract getDisplayText()` |  |
| `abstract onOpen()` |  |
| `abstract onClose()` |  |
| `beforeClose()` | Tab 关闭前调用。 |

## SchedulerRegisterOptions

> 调度器注册选项 用于注册定时或周期性执行的任务

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 任务唯一标识符 |
| `cron?` | `string` | Cron 表达式（如 '0 * * * *' 表示每小时整点执行） |
| `intervalMs?` | `number` | 执行间隔（毫秒），与 cron 二选一 |
| `once?` | `boolean` | 是否仅执行一次 |
| `executeAt?` | `number` | 指定的单次执行时间戳（毫秒） |
| `command?` | `string` | 要执行的命令 |
| `args?` | `string[]` | 命令参数 |
| `cwd?` | `string` | 命令执行的工作目录 |

## SelectionMenuItem

> 划词菜单注册项 插件可通过 selectionMenu API 注册按钮到划词菜单

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一标识，如 'save-to-diary' |
| `label` | `string` | 显示文本，如 '保存到日记' |
| `icon?` | `string` | SVG 字符串图标，如 '<svg viewBox="0 0 24 24">...</svg>' |
| `viewType?` | `string` | ViewClass 类型（用于嵌入模式），如 'com.berrytrace.plugin.diary:selection-view' |
| `pluginId?` | `string` | 所属插件 ID |
| `description?` | `string` | 钮说明/title |

