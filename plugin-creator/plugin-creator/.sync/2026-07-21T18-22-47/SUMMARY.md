# SKILL 同步报告 (plugin-creator)

**对比范围**: `000633f5` → `07274ab9`
**总变更**: 174 个文件，其中与本 SKILL 相关: **36** 个

---

## 📁 相关变更文件

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

## 📚 当前 SKILL 文档（副本在 skill-docs/）

- [SKILL.md](./skill-docs/SKILL.md)
- [01-architecture.md](./skill-docs/01-architecture.md)
- [04-plugin-types.md](./skill-docs/04-plugin-types.md)
- [08-build.md](./skill-docs/08-build.md)
- [11-troubleshooting.md](./skill-docs/11-troubleshooting.md)
- [17-npm.md](./skill-docs/17-npm.md)

---

## ⏭️ 跳过的文件

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
- `builtin-plugins/berrytrace-online/src/services/invite_service.ts`
- `builtin-plugins/berrytrace-online/src/services/note_service.ts`
- `builtin-plugins/berrytrace-online/src/services/socket.ts`
- `builtin-plugins/berrytrace-online/src/services/sync_listener.ts`
- `builtin-plugins/berrytrace-online/src/services/sync_service.ts`
- ... 还有 118 个