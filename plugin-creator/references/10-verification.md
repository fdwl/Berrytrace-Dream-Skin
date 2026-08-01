# 10 — 验证闭环

---

## 验证步骤

### 1. 加载验证

```
plugin_manager_load_unpacked
参数: { "path": "plugins-dev/my-plugin" }
预期: 返回成功
```

### 2. 激活验证

```
plugin_manager_get_logs
参数: { "pluginId": "com.berrytrace.plugin.my-plugin-{uuid}", "limit": 30 }
预期: 日志包含激活成功信息，无 SyntaxError、无 Module not found
```

### 3. UI 验证（panel/hybrid）

在宿主界面确认以下 UI 贡献正常显示：
- 侧边栏 Ribbon 图标
- 工作区标签页
- 命令面板中的命令
- 划词菜单项
- 文件夹右键菜单项

### 4. MCP 工具验证

```
plugin_manager_list_tools
参数: { "pluginId": "com.berrytrace.plugin.my-plugin-{uuid}" }
预期: 返回的工具列表与 plugin.json 的 mcp.tools 一致
```

逐一调用每个 MCP 工具，确认返回值正确。

### 5. 热重载验证

```
1. 修改 src/background.ts 或 src/renderer.tsx
2. npm run build
3. plugin_manager_reload { pluginId: "..." }
4. plugin_manager_get_logs { pluginId: "..." }
预期: 新代码生效，无报错
```

### 6. 构建验证

```bash
cd plugins-dev/my-plugin
npm run build
预期: dist/ 目录有产物，无报错
```

---

## 检查清单

| # | 检查项 | 工具 |
|---|--------|------|
| 1 | 加载成功 | `plugin_manager_load_unpacked` |
| 2 | 激活日志正常 | `plugin_manager_get_logs` |
| 3 | contributes UI 可见 | 宿主界面确认 |
| 4 | MCP 工具列表正确 | `plugin_manager_list_tools` |
| 5 | 每个 MCP 工具返回正确 | 逐一调用 |
| 6 | 热重载正常 | `plugin_manager_reload` + `plugin_manager_get_logs` |
| 7 | `npm run build` 无报错 | 终端 |

---

## 常见失败及修复

| 现象 | 原因 | 修复 |
|------|------|------|
| 加载失败 | `plugin.json` 格式错误 | 检查 JSON 语法 |
| 无激活日志 | `activate()` 未自调用 | background 末尾加 `activate().catch(...)` |
| UI 不显示 | `contributes` 配置错误 | 检查 `view` 路径、`activationEvents` |
| MCP 工具缺失 | handler 未注册或名称不匹配 | 检查 `registerToolHandler` 的名称 |
| 热重载不生效 | 未 build 或 JS 语法错误 | `npm run build` + 检查日志 |
| `Failed to resolve module specifier` | renderer 裸包名未处理 | esbuild shim 或 Import Maps |
