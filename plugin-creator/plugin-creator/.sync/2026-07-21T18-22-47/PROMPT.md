# SKILL 文档同步提示词 (plugin-creator)

> 本文件由 `scripts/skill-sync.mjs --skill plugin-creator` 自动生成，请将以下内容直接给 AI 执行。

---

## 你的任务

根据 git 变更，更新 `plugins-dev/npx-tools/skills/plugin-creator/` 下的 SKILL 规范与参考文档。

**对比范围**: `000633f5` → `07274ab9`（共 36 个相关模块变更）

---

## 执行步骤

### 第 1 步：读取变更摘要

```bash
cat "plugins-dev/npx-tools/skills/plugin-creator/.sync/2026-07-21T18-22-47/SUMMARY.md"
```

### 第 2 步：逐个读取 diff 文件，理解具体修改

```bash
ls "plugins-dev/npx-tools/skills/plugin-creator/.sync/2026-07-21T18-22-47/files/"
```

对每个 `.diff` 文件，读取其内容理解变更。

### 第 3 步：读取当前 SKILL 文档

读取以下文件作为参考基准：
- `plugins-dev/npx-tools/skills/plugin-creator/SKILL.md`
- `plugins-dev/npx-tools/skills/plugin-creator/references/01-architecture.md`
- `plugins-dev/npx-tools/skills/plugin-creator/references/04-plugin-types.md`
- `plugins-dev/npx-tools/skills/plugin-creator/references/08-build.md`
- `plugins-dev/npx-tools/skills/plugin-creator/references/11-troubleshooting.md`
- `plugins-dev/npx-tools/skills/plugin-creator/references/17-npm.md`

### 第 4 步：判断并更新文档

根据 diff 内容，判断变更是否影响 SKILL 中的规范、配置、API 或机制。

更新规则：
- 保持现有文档结构和风格
- 只修改受变更影响的部分
- 不要添加无关注释
- 确保文档中的代码示例与最新代码一致

### 第 5 步：标记同步完成

更新完成后，执行以下命令将最新 git 版本号写回 SKILL.md：

```bash
node scripts/skill-sync.mjs --skill plugin-creator --update 07274ab9dbaf27fd6972bfbd28e06165d494ca0a
```

---

## 变更文件清单

| 文件 | +增 | -减 |
|------|------|------|
| `electron/config/DbCache.ts` | +2 | -1 |
| `electron/plugins/api-dispatcher.ts` | +6 | -0 |
| `electron/plugins/controllers/browser.ts` | +2 | -1 |
| `electron/plugins/controllers/workflow-controller.ts` | +180 | -0 |
| `electron/plugins/main-sdk-creator.ts` | +26 | -0 |
| `electron/plugins/mcp-host.ts` | +55 | -1 |
| `electron/plugins/plugin-install.ts` | +41 | -5 |
| `electron/plugins/plugin-ipc.ts` | +99 | -1 |
| `electron/plugins/plugin-launcher.ts` | +1 | -8 |
| `electron/plugins/plugin-manager.ts` | +15 | -1 |
| `electron/plugins/plugin-scanner.ts` | +7 | -3 |
| `electron/plugins/scheduler.ts` | +1 | -1 |
| `electron/plugins/shared-context-store.ts` | +156 | -0 |
| `electron/plugins/workflow-engine.ts` | +779 | -0 |
| `electron/plugins/workflow-history-manager.ts` | +171 | -0 |
| `electron/plugins/workflow-intent-router.ts` | +93 | -0 |
| `electron/plugins/workflow-runner.ts` | +305 | -0 |
| `electron/plugins/workflow-scheduler.ts` | +212 | -0 |
| `electron/plugins/workflow-types.ts` | +98 | -0 |
| `electron/services/file-manager.ts` | +136 | -2 |
| `electron/services/fulltext-file-parsers.ts` | +2 | -1 |
| `electron/services/fulltext-index-manager.ts` | +76 | -5 |
| `electron/services/preferences-manager.ts` | +1 | -1 |
| `electron/services/protocol-handler.ts` | +1 | -1 |
| `electron/services/ripgrep-service.ts` | +40 | -0 |
| `electron/services/updater.ts` | +8 | -5 |
| `plugins-dev/npx-tools/skills/plugin-creator/SKILL.md` | +1 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js` | +207 | -134 |
| `plugins-sdk/cli.js` | +143 | -5 |
| `plugins-sdk/tsconfig.json` | +1 | -0 |
| `plugins-sdk/types.d.ts` | +54 | -0 |
| `plugins-sdk/types.ts` | +46 | -1 |
| `src/stores/dashboard.ts` | +3 | -4 |
| `src/views/plugins/PluginsMarketplaceView.tsx` | +34 | -3 |
| `src/views/plugins/workspace/FlexWorkspace.tsx` | +3 | -12 |
| `src/views/plugins/workspace/WorkspaceTabPanel.tsx` | +20 | -5 |

---

## 跳过的文件（与本 SKILL 无关）

- `.history/bilibili-search-laofeiyu/1784629903063.workflow`
- `api-map.json`
- `builtin-plugins/berrytrace-heigelasi/src/index.tsx`
- `builtin-plugins/berrytrace-online/plugin.json`
- `builtin-plugins/berrytrace-online/src/config.ts`
- `builtin-plugins/berrytrace-online/src/guide/components/PlanPanel.tsx`
- `builtin-plugins/berrytrace-online/src/guide/components/UsagePanel.tsx`
- `builtin-plugins/berrytrace-online/src/hooks/useAiOptimize.ts`
- `builtin-plugins/berrytrace-online/src/index.tsx`
- `builtin-plugins/berrytrace-online/src/mock/note_mock_data.ts`
- `builtin-plugins/berrytrace-online/src/models/Comment.ts`
- `builtin-plugins/berrytrace-online/src/models/calendar.ts`
- `builtin-plugins/berrytrace-online/src/models/post_models.ts`
- `builtin-plugins/berrytrace-online/src/models/power_models.ts`
- `builtin-plugins/berrytrace-online/src/services/diary_completions.ts`
- ... 还有 123 个