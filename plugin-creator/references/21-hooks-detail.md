# 21 — Hooks 详解

## 概念

Hooks 是跨插件的能力扩展机制。插件 A 注册 handler，插件 B 调用时所有注册的 handler 按优先级执行并合并结果。

## 注册 Hook

```typescript
callApi('hooks', 'register', [{
  hookName: string,          // Hook 名称，如 'workspace:tab_context'
  pluginId: string,          // 注册插件 ID
  priority: number,          // 优先级（越大越先执行，默认 0）
  handlerCode: string        // handler 函数源代码字符串
}]);
```

## 调用 Hook

```typescript
callApi('hooks', 'call', [{
  hookName: string,          // Hook 名称
  callArgs: unknown[],       // 传递给 handler 的参数
  merge: boolean,            // true: 合并所有 handler 结果 / false: 返回第一个非空
  timeoutMs: number          // 超时毫秒（默认 5000）
}]);
```

## 注销

```typescript
callApi('hooks', 'unregister', [{ hookName, pluginId }]);
callApi('hooks', 'unregisterPlugin', [{ pluginId }]);
```

## 内置 Hook 名

| Hook 名 | 用途 | 参数 | 返回值 |
|---------|------|------|--------|
| `workspace:tab_context` | 获取当前标签页上下文 | `{ tabId, title, path }` | `{ title: string }` |
| `workspace:file_menu` | 添加文件右键菜单项 | `{ filePath, fileName }` | `{ items: MenuItem[] }` |
| `commands:beforeExecute` | 命令执行前截流 | `{ commandId: string, commandArgs: unknown }` | `{ block: boolean, reason?: string }` |

## 典型用法

```typescript
// background.ts — 注册 hook
callApi('hooks', 'register', [{
  hookName: 'workspace:tab_context',
  pluginId: 'com.berrytrace.plugin.my-plugin-xxx',
  priority: 10,
  handlerCode: `(async (args) => {
    return { title: '当前: ' + args.title };
  })`
}]);

// 其他插件调用
const context = callApi('hooks', 'call', [{
  hookName: 'workspace:tab_context',
  callArgs: [{ tabId: 'abc', title: 'readme.md' }],
  merge: true,
  timeoutMs: 3000
}]);
// → [{ title: '当前: readme.md' }]
```

## 注意事项

- handlerCode 必须是完整可执行函数字符串，服务端用 `new Function(handlerCode)` 执行
- 同一 hook 可注册多个 handler，按 priority 降序执行
- merge=true 合并为数组，merge=false 返回第一个非空结果
- timeoutMs 超时后未返回的 handler 结果被丢弃

## 命令截流示例

插件可在命令执行前拦截，决定是否放行：

```typescript
// background.ts — 注册命令截流 hook
callApi('hooks', 'register', [{
  hookName: 'commands:beforeExecute',
  pluginId: 'com.berrytrace.plugin.firewall-xxx',
  priority: 100,  // 高优先级先执行
  handlerCode: `(async (args) => {
    const { commandId, commandArgs } = args;
    // 拦截特定命令
    if (commandId === 'dangerous:command') {
      return { block: true, reason: '被防火墙插件拦截' };
    }
    // 放行其他命令
    return { block: false };
  })`
}]);
```

返回值说明：
- `{ block: true, reason?: string }` — 命令被截流，不执行
- `{ block: false }` — 放行，继续执行
- `null` / 无返回 — 放行（默认行为）
