# window / dialog / log / commands — 窗口与交互

## window

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `close` | `id?: string` | `void` | 关闭窗口。不传 id 关闭当前窗口，传 id 关闭指定浮动窗口。 |
| `minimize` | `—` | `void` | 最小化当前窗口。 |
| `maximize` | `—` | `void` | 最大化/还原当前窗口。 |
| `startDrag` | `—` | `void` | 开始窗口拖拽（macOS 专用）。 |
| `move` | `dx: number, dy: number` | `void` | 相对移动当前窗口。 |
| `disableDefaultDrag` | `disabled: boolean` | `void` | 禁用/启用窗口默认拖拽行为。 |
| `setIgnoreMouseEvents` | `ignore: boolean, options?: { forward: boolean }` | `void` | 设置窗口鼠标事件穿透（用于桌面特效等场景）。 |
| `create` | `options: unknown` | `string` | 创建浮动窗口，返回窗口 ID。 |
| `show` | `id: string` | `void` | 显示指定浮动窗口。 |
| `hide` | `id: string` | `void` | 隐藏指定浮动窗口。 |
| `getState` | `id: string` | `WindowState` | 获取浮动窗口状态。 |
| `updateWindowOptions` | `id: string, options: Record<string, unknown>` | `void` | 动态更新浮动窗口属性（尺寸、位置、置顶、可缩放）。 |

**调用示例**：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

const winId = await sdk.window.create({ url: 'https://example.com', width: 800, height: 600 });
await sdk.window.show(winId);
await sdk.window.close(winId);
```

## dialog

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `showOpenDialog` | `options: OpenDialogOptions` | `DialogReturnValue` | 打开原生文件/目录选择对话框。 |
| `showSaveDialog` | `options: SaveDialogOptions` | `DialogReturnValue` | 打开原生文件保存对话框。 |

## log

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `info` | `message: string` | `void` | 记录 info 级别日志。 |
| `warn` | `message: string` | `void` | 记录 warn 级别日志。 |
| `error` | `message: string` | `void` | 记录 error 级别日志。 |
| `debug` | `message: string` | `void` | 记录 debug 级别日志。 |

## commands

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `register` | `options: { id, label, handler?, ... }` | `string` | 注册命令。handler 为回调函数，会自动注册到本地。 |
| `unregister` | `id: string` | `void` | 注销命令。 |
| `execute` | `id: string, args?: unknown` | `unknown` | 执行命令，广播到所有渲染进程和后台进程。 |

> **注意**：controller 中还有 getNativeHandle 方法，但**未注册到 SDK**，插件无法直接调用。
