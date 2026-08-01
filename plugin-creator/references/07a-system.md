# system — 系统


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## system

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `captureWindow` | `options: {
    windowId: number;
    quality?: 'low' | 'medium' | 'high';
    crop?: { x: number; y: number; width: number; height: number };
  }` | `string` | 截取指定 ID 窗口的屏幕缓冲。支持局部裁剪与图像压缩质量设置。 |
| `clipboardWriteText` | `text: string` | `null` | 向系统剪贴板写入文本。 |
| `closeCaptureWindow` | `token: string` | `boolean` | 强制关闭指定令牌的捕获窗口。 |
| `createDesktopShortcut` | `options: { name: string; icon?: string; description?: string }` | `boolean` | 在桌面创建插件快捷方式（Windows .lnk / macOS .webloc / Linux .desktop）。 … |
| 🔒 `execCommand` | `options: ExecCommandOptions` | `ExecCommandResult` | 执行系统命令。支持 shell 命令、超时控制、流式输出、sudo 提权。 await callApi('system'… |
| `getAppInfo` | `—` | `{ appName: string; oemId: string; apiGat…` | 获取宿主应用的 OEM 基础信息（如软件名称） |
| `getDesktopCapturerSources` | `options: { types: Array<'screen' | 'window'> }` | `Array<{ id: string; name: string }>` | 获取可用于屏幕捕获的源列表（屏幕/窗口）。 |
| `getDisplays` | `—` | `Array<{ id: number; bounds: { x: number;…` | 获取当前系统的屏幕布局信息。 |
| `getFocusedInputInfo` | `—` | `{ selection: string; value: string; role…` | 获取当前系统焦点元素的输入信息（选中文本、输入值、角色）。 await callApi('system', 'getFo… |
| `getSSHConfigProfiles` | `_options: unknown` | `Promise<{
    profiles: SSHHostProfile[]…` | 自动读取解析用户主目录 ~/.ssh/config 配置文件与密钥列表 |
| `getSubagentsList` | `—` | `unknown[]` | 获取所有当前已启用插件声明的子代理（SubAgent）规格列表。 |
| `getTheme` | `—` | `string` | 获取当前系统主题。 |
| `insertText` | `options: { text: string }` | `boolean` | 向当前焦点输入框插入文本。自动检测输入区域类型，按优先级尝试： 1. IPC 直发（同应用窗口）2. 模拟键盘输入 3.… |
| `isFocusedInInputArea` | `—` | `{ isInput: boolean; isEditable: boolean;…` | 检测当前系统焦点元素是否处于可编辑的输入区域。 业务层可在触发 AI 填充前调用此接口，如果返回 isInput=fal… |
| `killSessionProcesses` | `sessionId: string` | `boolean` | 终止指定 Session 会话下的所有运行中子进程（终端、脚本） |
| `launchApp` | `options: { appName: string; waitMs?: number }` | `{ launched: boolean; windowCount: number…` | 启动一个应用程序（如果已运行则将其激活置前）。 appName: 应用名称（如 "微信"、"WeChat"、"Googl… |
| `listShortcutActions` | `—` | `Array<{ id: string; label: string; icon:…` | 列出所有已注册的快捷动作。 |
| `listWindows` | `—` | `Array<{ id: number; title: string; appNa…` | 列出当前系统的所有打开窗口。 |
| `openCaptureWindow` | `url: string, token: string, headless?: boolean` | `boolean` | 打开捕获窗口用于网页截屏/数据抓取。headless=true 时不可见，等待页面加载后返回。 |
| `openExternal` | `targetUrl: string` | `null` | 在系统默认浏览器中打开 URL。 await callApi('system', 'openExternal', ['h… |
| `openUrl` | `targetUrl: string, options?: { internal?: boolean; width?: number; height?: number; alwaysOnTop?: boolean }` | `null` | 打开 URL。internal=true 时在应用内嵌浏览器打开，否则在系统浏览器打开。 await callApi('… |
| `queryElementBounds` | `selector: string` | `null` | Stub implementation of queryElementBounds to prevent plugin … |
| `querySelectorAtCoordinate` | `options: { x: number; y: number }` | `null` | Stub implementation of querySelectorAtCoordinate to prevent … |
| 🔒 `registerGlobalShortcut` | `accelerator: string, commandId: string` | `boolean` | 注册全局快捷键，按下时自动执行指定的 commandId。 |
| `registerShortcutAction` | `options: { id: string; label: string; icon?: string }` | `void` | 注册快捷动作（显示在快捷键列表 UI 中）。必须在后台进程注册。 |
| `resolveCommandEarly` | `options: { sessionId: string }` | `boolean` | 提前终止指定会话的 execCommand，不等进程退出即返回已有输出。 await callApi('system',… |
| `resolveNpmCli` | `—` | `unknown` | 解析内置 npm CLI 路径，用于插件中的 npm 操作。 |
| `setIgnoreMouseEvents` | `ignore: boolean, options: { forward: boolean } | undefined` | `null` | 设置窗口鼠标事件穿透（用于桌面特效等场景）。 |
| `setTrayMenu` | `menuTemplate: Array<{ label: string; type?: 'normal' | 'separator' | 'checkbox'; checked?: boolean; clickCommand: string }>` | `boolean` | 设置插件的系统托盘菜单。首次调用自动创建托盘图标。 await callApi("system", "setTrayMe… |
| `showNotification` | `options: { title: string; body: string; silent?: boolean }` | `null` | 发送系统原生通知。点击通知会恢复并聚焦主窗口。 await callApi('system', 'showNotific… |
| `simulateClick` | `options: { x: number; y: number; button: 'left' | 'right' | 'middle'; doubleClick?: boolean }` | `boolean` | 模拟鼠标移动并点击指定物理屏幕坐标。 |
| `simulateDrag` | `options: { startX: number; startY: number; endX: number; endY: number }` | `boolean` | 模拟鼠标拖拽（从起点拖拽到终点，常用于滑块验证码）。 |
| `simulateKeyPress` | `options: { keys: string[] }` | `boolean` | 模拟键盘按键及组合快捷键。 |
| `simulateType` | `options: { text: string }` | `boolean` | 模拟键盘打字输入文本。 |
| `toggleQuickPanel` | `—` | `null` | 切换快速面板（语音助手面板）的显示/隐藏。 |
| `triggerCapture` | `token: string` | `string` | 触发捕获窗口截取页面 HTML 并关闭窗口。 |
| `unregisterGlobalShortcut` | `accelerator: string` | `null` | 注销全局快捷键。 |
| `unregisterShortcutAction` | `id: string` | `void` | 注销快捷动作。 |
| `waitCommand` | `options: { sessionId: string }` | `ExecCommandResult` | 等待指定会话的 execCommand 完成，阻塞直到进程退出。 await callApi('system', 'wa… |
| `writeStdin` | `options: { sessionId: string; text: string }` | `boolean` | 向正在运行的 execCommand 进程的 stdin 写入文本。 await callApi('system', '… |

**调用示例**：
```typescript
await callApi('system', 'captureWindow', [options]);
```

