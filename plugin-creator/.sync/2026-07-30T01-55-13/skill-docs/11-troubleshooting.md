# 11 — 排错指南

---

## 1. `Cannot find package 'xxx'`（最常见）

**现象**：
```
Error: Cannot find module 'bplist-creator'
Error: Cannot find module 'ws'
Error: Cannot find package 'playwright-core'
```

**原因与修复路径**：

```
报错的包名
│
├── 纯 JS 包（ws、zod、axios 等）
│   原因：该包被加入了 external 但安装目录没有 node_modules
│   修复：从 external 移除，让 esbuild bundle 进去
│
├── berrytrace-plugin-sdk（仅 background 构建）
│   原因：background 构建需要 external SDK
│   修复：确保 external: ['berrytrace-plugin-sdk']
│   注意：view 构建（browser）不再需要 external SDK，已通过全局 shim 注入
│
└── bplist-creator / bufferutil / 某个陌生间接依赖
    原因：你依赖了 playwright-core 等"有动态 require 的大型包"
    修复步骤：
      1. bundle.mjs → 把所有 dependencies 加入 external
      2. plugin.json → 加 "files": ["dist","node_modules","plugin.json","package.json"]
      3. npm run build → berrytrace pack → 重新安装 .btp
```

**判断是否是"动态 require 大型包"**：
```bash
# 如果 playwright-core 没有 dependencies 字段但 node_modules 里有几十个包
cat node_modules/playwright-core/package.json | python3 -c \
  "import json,sys; p=json.load(sys.stdin); print(len(p.get('dependencies',{})), 'deps')"
# 输出 0 deps → 说明它靠 npm hoist + 动态 require，必须用 files 字段全量打包
```

---

## 2. 插件加载失败（无声静默）

**现象**：插件列表显示"加载失败"或根本不出现

**排查步骤**：
1. 检查 `plugin.json` 是否为合法 JSON（用 `cat plugin.json | python3 -m json.tool`）
2. 确认 `id` 格式：`com.berrytrace.plugin.{name}-{uuid}` 不含空格
3. 确认 `main` 和 `view` 文件路径正确且文件存在
4. 检查 `type` 字段是否为合法值：`panel` / `background` / `hybrid` / `main`
5. 查看日志：`plugin_manager_get_logs { pluginId: "xxx", limit: 50 }`

---

## 3. `activate()` 从未被调用（无声失败）

**现象**：
- `plugin_manager_get_logs` 无任何输出
- MCP 工具全部不可用
- `plugin_manager_list_tools` 返回空

**原因**：background 类型插件通过 `utilityProcess.fork()` 启动为独立子进程。`activate()` 被正确导出但**从未执行**。

**修复**：在 `src/index.ts` 文件末尾添加：

```typescript
activate().catch(err => {
  console.error('[Plugin] 激活失败:', err);
});
```

---

## 4. 浏览器报错：`Failed to resolve module specifier "berrytrace-plugin-sdk"`

**现象**：
```
TypeError: Failed to resolve module specifier "berrytrace-plugin-sdk".
Relative references must start with either "/", "./", or "../".
```

**原因**：渲染进程（Panel 插件）在浏览器环境运行，不支持 Node.js 裸包名解析。

**修复**：使用 `berrytrace build` 命令构建（它内置了全局 shim 插件），或确保你的 bundle.mjs 包含 `globalSdkPlugin` 和 `globalReactPlugin`。SDK、React、zustand 现在通过 `window` 全局变量注入，不再需要手动 external。

---

## 5. `ReferenceError: require is not defined`

**现象**：Background 插件运行时报错

**原因**：ESM 格式（`format: 'esm'`）没有 `require`，但代码里（或依赖里）用了 `require()`

**修复**：在 bundle.mjs 的 `banner` 里添加 CJS shim：

```javascript
banner: {
  js: `import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);`,
},
```

---

## 6. MCP 工具注册后不可用

**现象**：插件激活成功，但调用 MCP 工具返回"tool not found"

**排查步骤**：
1. `plugin_manager_list_tools` 查询已注册工具列表
2. 确认工具名在列表中 → 如不在，检查注册代码
3. 确认 `sdk.mcp.registerToolHandler()` 的第一个参数**完全匹配** `plugin.json` 中 `mcp.tools[].name`
4. 确认 `activate()` 正常执行完（检查日志）
5. 检查 `activate()` 中是否有 JS 异常跳过了注册代码

---

## 7. Panel 界面白屏 / JS 报错

**常见原因**：

| 错误 | 原因 | 修复 |
|---|---|---|
| `fs is not defined` | Panel 代码里用了 Node.js API | 改用 `sdk.filesystem.*` |
| `path is not defined` | 同上 | 改用字符串处理 |
| `Uncaught SyntaxError` | 产物格式错误 | 检查 bundle platform 是 `browser`，且包含 globalSdkPlugin |

---

## 8. 热重载不生效

**排查步骤**：
1. 用 `plugin_manager_reload`，不是 `plugin_manager_load_unpacked`（后者仅首次加载）
2. `plugin_manager_get_logs` 检查是否有 JS 语法错误
3. 确认 `npm run build` 成功，`dist/` 目录产物已更新

---

## 9. node_modules 没有随 .btp 打包（间接依赖丢失）

**现象**：开发目录运行正常，安装 .btp 后报 MODULE_NOT_FOUND

**原因**：SDK pack 默认只包含 `package.json` 直接 dependencies，间接依赖被漏掉

**修复**：在 `plugin.json` 加 `files` 字段：

```json
{
  "files": ["dist", "node_modules", "plugin.json", "package.json"]
}
```

加了 `files` 字段后，SDK pack 会**严格按列表打包**，跳过依赖过滤，包含整个 `node_modules`。

---

## 10. contributes 声明了但 UI 不显示

**排查步骤**：
1. 检查 `plugin.json` 中 `contributes` 的 JSON 格式
2. 确认 `activationEvents` 包含了对应的触发事件
3. 确认 `view` 字段指向的文件存在且构建成功
4. 确认窗口范围（`windowScope`）设置正确

---

## 11. 报错 `You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before`

**现象**：
控制台打印红标报错：
`You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it.`

**原因**：
视图在卸载与重新挂载、热重载或宿主多次调用 `onOpen` 时，试图在已被 React 18 绑定过 `__reactContainer$` 的同一个 DOM 容器元素上再次执行 `createRoot(this.container)`。

**修复方案**：
1. **宿主隔离**：宿主挂载 View 前，先在 DOM `ref` 中创建一个全新的 `document.createElement('div')` 子节点传给 View 实例，卸载时整块 DOM 移除；
2. **插件 View 隔离**：在插件 View 内部使用 `subContainer` 模式（参见 [04-plugin-types.md](./04-plugin-types.md) 的 DOM Sub-Container Pattern）。

---

## 快速诊断命令

```
# 查看插件是否被识别
plugin_manager_list_tools { pluginId: "xxx" }

# 查看激活日志
plugin_manager_get_logs { pluginId: "xxx", limit: 50 }

# 重新加载
plugin_manager_reload { pluginId: "xxx" }

# 验证安装目录内容
ls ~/.berrytrace/plugins/com.berrytrace.plugin.xxx/

# 验证 node_modules 是否包含
ls ~/.berrytrace/plugins/com.berrytrace.plugin.xxx/node_modules/ | head -20
```
