# 09 — 开发工作流

## 完整流程

```
创建项目 → 修正 plugin.json → 编写代码 → 构建 → 加载 → 验证 → 迭代
```

---

## Step 1：创建项目

```bash
# 生成 UUID
node plugins-dev/npx-tools/skills/plugin-creator/scripts/generate-uuid.js

# 创建插件
node plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js create <name> --id com.berrytrace.plugin.<name>-<uuid>
```

---

## Step 2：修正 plugin.json

CLI 模板生成后需手动修正（参考 [03-plugin-json.md](./03-plugin-json.md)）：
- 添加 `view` 字段（panel/hybrid）
- 添加 `activationEvents`
- 添加 `contributes`（`selectionMenuItems` / `shortcutActions`）
- 调整 `permissions` 格式
- 删除不需要的 `namespace` 字段

---

## Step 3：编写代码

根据 `type` 选择对应入口：[04-plugin-types.md](./04-plugin-types.md)

| type | 写什么 |
|------|--------|
| `panel` | 新建 `src/renderer.tsx` |
| `background` | 修改 `src/index.js` + 末尾自激活 `activate().catch(...)` |
| `hybrid` | 新建 `src/renderer.tsx` + 修改 `src/index.js` |

---

## Step 4：构建与热重载

使用 `berrytrace-sdk` 一键完成编译与本地宿主通知（自动检测宿主 LocalServer 并重载/加载解包插件）：

```bash
# 在插件根目录运行 (推荐 Watch 热监视模式，保存即自动打包更新)
berrytrace-cli dev

# 或手动触发一键打包安装与刷新：
berrytrace-cli install
```

---

## Step 5：极简迭代循环

```bash
# 方式 A：热监视模式（保存代码自动重新打包、安装至 ~/.berrytrace/plugins/ 并通知宿主刷新）
berrytrace-cli dev

# 方式 B：一键打包、本地更新与热重载
berrytrace-cli install

# 方式 C：源码原地编译并通知热重载
berrytrace-cli build --reload
```

> CLI 会自动读取 `~/.berrytrace/local_server.json` 通信凭证，并向宿主 LocalServer (`http://127.0.0.1:31828`) 发送热重载指令；若插件首次载入，会自动退回解包加载（load-unpacked）。

---

## Step 6：日志与验证 (可选 Host MCP 工具)

若 Agent 集成在宿主内部，可调用 MCP 工具查看插件日志：

```
plugin_manager_get_logs
参数: { "pluginId": "com.berrytrace.plugin.<name>-<uuid>", "limit": 30 }
```

> ⚠️ 首次用 `load_unpacked`，后续用 `reload`。

---

## 快速参考

```bash
# 1. 首次创建插件
node scripts/berrytrace-cli.js create <name> --id ...

# 2. 本地开发与实时刷新（推荐）
berrytrace-cli dev

# 3. 一键打包更新安装到本地宿主环境
berrytrace-cli install (或 pack --install)

# 4. 获取运行日志
berrytrace-cli logs (或 plugin_manager_get_logs)
```

---

## 编码规范

- 语言：TypeScript / JavaScript
- 命名：文件 `kebab-case`，类 `PascalCase`，函数/变量 `camelCase`
- 入口分离：`main` 不含浏览器代码，`view` 不含 Node.js 代码
- 声明式优先：能用 `contributes` 声明就不用 API 调用
- async 操作必须有 try/catch 或 `.catch()`
- 用 `sdk.log` 而不是 `console.log`
