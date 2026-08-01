# 16 — 发布

## 发布前检查清单

| # | 检查项 |
|---|--------|
| 1 | `npm test` 全部通过，覆盖率 ≥ 90% |
| 2 | `npm run build` 无报错 |
| 3 | `dist/` 目录有产物（renderer.js / background.js） |
| 4 | `plugin.json` 字段完整（id / name / version / type / main / view） |
| 5 | `plugin.json` 中 `id` 格式正确：`com.berrytrace.plugin.{name}-{uuid}` |
| 6 | 权限声明完整（permissions / fileAssociations） |
| 7 | 热重载后无报错（load-plugin → reload → get_logs） |

## 版本管理

`plugin.json` 中 `version` 使用语义化版本：

```json
{
  "version": "1.0.0"
}
```

| 变更类型 | 版本号 |
|---------|--------|
| Bug 修复 | `1.0.0` → `1.0.1` |
| 新功能（向后兼容） | `1.0.0` → `1.1.0` |
| 破坏性变更 | `1.0.0` → `2.0.0` |

## 打包

```bash
# 确保测试通过
npm test

# 确保构建成功
npm run build

# 打包为 .zip
cd plugins-dev/my-plugin
zip -r ../my-plugin-v1.0.0.zip dist/ plugin.json README.md
```

打包内容：
- `dist/` — 构建产物（必须）
- `plugin.json` — 插件配置（必须）
- `README.md` — 说明文档（推荐）
- `skills/` — Skill 定义（可选，如有）

## 目录结构（发布前）

```
my-plugin/
├── plugin.json          ← 必须
├── README.md            ← 推荐
├── dist/
│   ├── renderer.js      ← panel/hybrid 必须
│   └── background.js    ← background/hybrid 必须
├── skills/              ← 可选
│   └── my-skill/
│       └── SKILL.md
└── package.json
```

## 安装

用户通过以下方式安装：

```
berrytrace://install-plugin?url=https://example.com/my-plugin-v1.0.0.zip
```

## 更新

插件通过 `plugin.json` 中的 `version` 字段判断是否更新。

```json
{
  "updateUrl": "https://example.com/plugin-updates.json"
}
```

`updateUrl` 指向的 JSON 格式：

```json
{
  "version": "1.0.1",
  "url": "https://example.com/my-plugin-v1.0.1.zip",
  "notes": "修复了 xxx 问题"
}
```

## 发布流程总结

```
npm test（覆盖率 ≥90%）
  → npm run build（无报错）
  → 验证（load-plugin → reload → get_logs）
  → 打包（zip dist/ plugin.json README.md）
  → 上传到服务器
  → 通过 berrytrace://install-plugin 安装验证
```
