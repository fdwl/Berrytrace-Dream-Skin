# window / dialog / log / commands — 窗口与交互


> 此文件由 `scripts/generate-skill-docs.js` 自动生成。修改 controller 后运行 `node scripts/generate-skill-docs.js` 更新。
## window

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `close` | `floatId?: string` | `null` | 关闭窗口。不传 floatId 关闭当前窗口，传 floatId 关闭指定浮动窗口。 |
| `create` | `opts: FloatWindowOptions` | `string` | 创建浮动窗口。支持 url / blob: / file: 协议，自动注入 winId 参数。 const winId … |
| `disableDefaultDrag` | `disabled: boolean` | `null` | 禁用/启用窗口默认拖拽行为。 |
| `getNativeHandle` | `opts: { winId: string }` | `Promise<{
    handle: number;
    platfo…` | 获取浮动窗口的原生操作系统句柄（HWND on Windows, NSWindow* on macOS）。 通用窗口管理… |
| `getState` | `winId: string` | `unknown` | 获取浮动窗口状态。 |
| `hide` | `winId: string` | `null` | 隐藏指定浮动窗口。 |
| `maximize` | `—` | `null` | 最大化/还原当前窗口。 |
| `minimize` | `—` | `null` | 最小化当前窗口。 |
| `move` | `deltaX: number, deltaY: number` | `null` | 相对移动当前窗口。 await callApi("window", "move", [{ deltaX: 100, de… |
| `show` | `winId: string` | `null` | 显示指定浮动窗口。 |
| `startDrag` | `—` | `null` | 开始窗口拖拽（macOS 专用）。 |
| `updateWindowOptions` | `targetWindowId: string, options: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    alwaysOnTop?: boolean;
    resizable?: boolean;
  }` | `null` | 动态更新浮动窗口属性（尺寸、位置、置顶、可缩放）。 |

**调用示例**：
```typescript
await callApi('window', 'close', [floatId]);
```

## dialog

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `showOpenDialog` | `options: OpenDialogOptions` | `unknown` | 打开原生文件/目录选择对话框。 await callApi("dialog", "showOpenDialog", [{… |
| `showSaveDialog` | `options: SaveDialogOptions` | `unknown` | 打开原生文件保存对话框。 await callApi("dialog", "showSaveDialog", [{ de… |

**调用示例**：
```typescript
await callApi('dialog', 'showOpenDialog', [options]);
```

## log

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `debug` | `message: string` | `null` | 记录 debug 级别日志（仅开发模式可见）。 |
| `error` | `message: string` | `null` | 记录 error 级别日志。 |
| `info` | `message: string` | `null` | 记录 info 级别日志，输出到宿主应用统一日志系统。 await callApi("log", "info", ["插… |
| `warn` | `message: string` | `null` | 记录 warn 级别日志。 |

**调用示例**：
```typescript
await callApi('log', 'debug', [message]);
```

## commands

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `execute` | `id: string, args?: Record<string, unknown>` | `void` | 执行命令，广播到所有渲染进程和后台进程。 |
| `register` | `options: { id?: string } | undefined` | `string` | 注册命令。 |
| `unregister` | `id: string` | `void` | 注销命令。 |

**调用示例**：
```typescript
await callApi('commands', 'execute', [{ id, args }]);
```

