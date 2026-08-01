# system — 系统

> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。

## system

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getTheme` | `—` | `'light' \| 'dark'` | 获取当前系统主题。 |
| `getAppInfo` | `—` | `{ appName, oemId, apiGateway, logoPath? }` | 获取当前宿主应用的 OEM 信息（应用名称、OEM ID、API 网关等）。 |
| `showNotification` | `options: { title: string; body: string; silent?: boolean }` | `void` | 发送系统原生通知。点击通知会恢复并聚焦主窗口。 |
| `openUrl` | `url: string, options?: { internal?: boolean; width?: number; height?: number; alwaysOnTop?: boolean }` | `void` | 打开 URL。internal=true 时在应用内嵌浏览器打开，否则在系统浏览器打开。 |
| `openExternal` | `url: string` | `void` | 在系统默认浏览器中打开 URL。 |
| `execCommand` | `options: ExecCommandOptions` | `ExecCommandResult` | 执行系统命令。支持 shell 命令、超时控制、流式输出、sudo 提权。 |
| `waitCommand` | `options: { sessionId: string }` | `ExecCommandResult` | 等待指定会话的 execCommand 完成，阻塞直到进程退出。 |
| `createDesktopShortcut` | `options: { name: string; icon?: string; description?: string }` | `boolean` | 在桌面创建插件快捷方式（Windows .lnk / macOS .webloc / Linux .desktop）。 |
| `setTrayMenu` | `menuTemplate: Array<{ label, type?, checked?, clickCommand }>` | `void` | 设置插件的系统托盘菜单。首次调用自动创建托盘图标。 |
| `registerGlobalShortcut` | `accelerator: string, commandId: string` | `boolean` | 注册全局快捷键，按下时自动执行指定的 commandId。 |
| `unregisterGlobalShortcut` | `accelerator: string` | `void` | 注销全局快捷键。 |
| `registerShortcutAction` | `options: { id: string; label: string; icon?: string }` | `void` | 注册快捷动作（显示在快捷键列表 UI 中）。必须在后台进程注册。 |
| `unregisterShortcutAction` | `id: string` | `void` | 注销快捷动作。 |
| `listShortcutActions` | `—` | `Array<{ id, label, icon, pluginId }>` | 列出所有已注册的快捷动作。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const theme = await sdk.system.getTheme();
const info = await sdk.system.getAppInfo();
await sdk.system.showNotification({ title: '提示', body: '操作完成' });
await sdk.system.openUrl('https://example.com', { internal: true });
```

> **注意**：controller 中还有 clipboardWriteText、getDesktopCapturerSources、getFocusedInputInfo、insertText、isFocusedInInputArea、openCaptureWindow、triggerCapture、closeCaptureWindow、toggleQuickPanel、resolveNpmCli、resolveCommandEarly、writeStdin、setIgnoreMouseEvents 等方法，但这些**未注册到 SDK**，插件无法直接调用。
