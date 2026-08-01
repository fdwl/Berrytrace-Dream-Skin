# 回调注册 API

以下 API 的 handler 参数为 **JavaScript 函数**，无法 JSON 序列化，**必须在后台进程 (background/hybrid 的 main) 中注册**。

## MCP 工具

```typescript
// 注册 MCP 工具处理器
sdk.mcp.registerToolHandler(
  name: string,              // 工具名（与 plugin.json 的 mcp.tools[].name 一致）
  handler: (args: Record<string, unknown>) => Promise<{
    content: Array<{ type: 'text' | 'image' | 'resource'; text?: string; data?: string; mimeType?: string }>;
    isError?: boolean;
  }>
): void;
```

## 动态 MCP 工具

```typescript
callApi('mcp', 'registerDynamicTool', [{
  callerPluginId: string,
  toolSpec: {
    name: string,            // 工具名
    description: string,     // 工具描述
    inputSchema: Record<string, unknown>  // JSON Schema
  }
}]);
```

## 系统提示词

```typescript
callApi('mcp', 'registerSystemPrompt', [{
  callerPluginId: string,
  options: {
    promptId: string,        // 提示词 ID
    promptText: string       // 提示词文本
  }
}]);
```

## 命令

```typescript
// 在 plugin.json 声明：
// "contributes": { "commands": [{ "id": "myPlugin.search", "name": "搜索" }] }

// 在 background.ts 注册 handler：
sdk.commands.register({
  id: string,                // 命令 ID
  name: string,              // 显示名称
  handler: (args: Record<string, unknown>) => Promise<void>
}): void;

// 执行命令（任何进程）
callApi('commands', 'execute', [{ id: 'myPlugin.search', args: { query: 'hello' } }]);
```

## 快捷键

```typescript
callApi('system', 'registerGlobalShortcut', [{
  accelerator: string,       // Electron 快捷键格式，如 'CmdOrCtrl+Shift+K'
  commandId: string          // 按下时执行的命令 ID
}]);

callApi('system', 'unregisterGlobalShortcut', [accelerator]);
```

## 快捷动作

```typescript
callApi('system', 'registerShortcutAction', [{
  id: string,                // 唯一 ID
  label: string,             // 显示名称
  icon?: string              // 图标（可选，emoji 或 SVG）
}]);
```

## 定时任务

```typescript
callApi('scheduler', 'register', [{
  id: string,                // 任务 ID
  cron?: string,             // cron 表达式，如 '0 9 * * *'
  intervalMs?: number,       // 间隔毫秒（cron 和 intervalMs 二选一）
  command?: string,          // 执行命令
  args?: string[],           // 命令参数
  cwd?: string               // 工作目录
}]);

callApi('scheduler', 'unregister', [id]);
```

## 全局快捷键

```typescript
callApi('system', 'registerGlobalShortcut', [{
  accelerator: string,       // 'CmdOrCtrl+Shift+K'
  commandId: string
}]);
```

## 划词菜单

```typescript
callApi('selectionMenu', 'registerItem', [{
  pluginId: string,
  id: string,                // 菜单项 ID
  label: string,             // 显示名称
  icon?: string,             // 图标
  onClick: () => void        // 点击回调（renderer 进程）
}]);

callApi('selectionMenu', 'unregisterItem', [id]);
```

## Hooks

```typescript
callApi('hooks', 'register', [{
  hookName: string,          // Hook 名，如 'workspace:tab_context'
  pluginId: string,          // 注册插件 ID
  priority: number,          // 优先级（数字越大越先执行）
  handlerCode: string        // handler 源代码字符串
}]);

callApi('hooks', 'unregister', [{ hookName, pluginId }]);

// 调用 Hook，返回所有注册 handler 的合并结果
callApi('hooks', 'call', [{
  hookName: string,
  callArgs: unknown[],
  merge: boolean,            // 是否合并多个 handler 的返回值
  timeoutMs: number          // 超时毫秒（默认 5000）
}]);
```

## 窗口 Ribbon 图标

```typescript
// 在后台进程注册
sdk.workspace.registerRibbonIcon(
  id: string,                // 唯一 ID，如 'my-plugin:icon-main'
  icon: string,              // 图标（emoji 或 SVG）
  tooltip: string,           // 提示文字
  onClick: () => void,       // 左键点击回调
  pluginId: string,
  onContextMenu?: (event: Event) => void  // 右键菜单回调（可选）
): void;

sdk.workspace.unregisterRibbonIcon(id: string): void;
```

> 此文件手动维护。修改回调 API 签名时同步更新。
