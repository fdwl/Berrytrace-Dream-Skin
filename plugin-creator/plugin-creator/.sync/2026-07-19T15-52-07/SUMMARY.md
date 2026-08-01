# SKILL 同步报告

**对比范围**: `e324be42` → `000633f5`
**总变更**: 123 个文件，其中与插件系统相关: **41** 个

---

## 📁 与插件系统相关的变更文件

| 文件 | +增 | -减 |
|------|------|------|
| `electron/config/DbCache.ts` | +21 | -6 |
| `electron/config/paths.ts` | +33 | -4 |
| `electron/plugins/controllers/ai.ts` | +9 | -1 |
| `electron/plugins/controllers/browser.ts` | +164 | -31 |
| `electron/plugins/controllers/local-ai.ts` | +2 | -1 |
| `electron/plugins/controllers/system.ts` | +3 | -2 |
| `electron/plugins/controllers/workspace.ts` | +17 | -0 |
| `electron/plugins/event-subscription-registry.ts` | +7 | -3 |
| `electron/plugins/plugin-install.ts` | +84 | -114 |
| `electron/plugins/plugin-ipc.ts` | +282 | -1 |
| `electron/plugins/plugin-isolation-policy.ts` | +10 | -143 |
| `electron/plugins/plugin-launcher.ts` | +31 | -14 |
| `electron/plugins/plugin-manager.ts` | +54 | -53 |
| `electron/plugins/scheduler.ts` | +58 | -27 |
| `electron/services/db-ipc.ts` | +21 | -0 |
| `electron/services/fulltext-file-parsers.ts` | +312 | -51 |
| `electron/services/fulltext-index-manager.ts` | +42 | -6 |
| `electron/services/ocr-image-parser.ts` | +185 | -0 |
| `electron/services/session-resource-manager.ts` | +135 | -0 |
| `electron/services/workspace-manager.ts` | +7 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/SKILL.md` | +12 | -7 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/01-architecture.md` | +45 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/02-quickstart.md` | +42 | -134 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/03-plugin-json.md` | +1 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/05-sdk-setup.md` | +33 | -54 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07-runtime-api.md` | +25 | -26 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07a-system.md` | +21 | -26 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07b-filesystem.md` | +20 | -20 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07c-storage.md` | +23 | -9 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07d-ai-mcp.md` | +37 | -38 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07e-window.md` | +27 | -47 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07f-workspace.md` | +40 | -57 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07h-publish-user.md` | +18 | -19 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07i-hooks.md` | +14 | -7 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07y-events.md` | +49 | -2 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07z-callbacks.md` | +0 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/08-build.md` | +150 | -225 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/11-troubleshooting.md` | +87 | -52 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js` | +128 | -70 |
| `src/views/plugins/workspace/BrowserTabPanel.tsx` | +162 | -313 |
| `src/views/plugins/workspace/FlexWorkspace.tsx` | +15 | -51 |

---

## 📚 当前 SKILL 文档（副本在 skill-docs/）

- [SKILL.md](./skill-docs/SKILL.md)
- [08-build.md](./skill-docs/08-build.md) — 构建规范
- [11-troubleshooting.md](./skill-docs/11-troubleshooting.md) — 排错指南
- [01-architecture.md](./skill-docs/01-architecture.md) — 架构
- [04-plugin-types.md](./skill-docs/04-plugin-types.md) — 插件类型

---

## ⏭️ 跳过的文件（与插件文档无关）

- `.agents/AGENTS.md`
- `.gitignore`
- `AGENTS.md`
- `"docs/02-\346\212\200\346\234\257\346\236\266\346\236\204\344\270\216\345\274\200\345\217\221/\346\212\200\346\234\257\350\247\204\345\210\222/\344\274\232\350\257\235\350\265\204\346\272\220\347\256\241\347\220\206\344\270\216\345\252\222\344\275\223\350\207\252\345\212\250\344\270\213\350\275\275\346\226\271\346\241\210.md"`
- `"docs/02-\346\212\200\346\234\257\346\236\266\346\236\204\344\270\216\345\274\200\345\217\221/\346\212\200\346\234\257\350\247\204\345\210\222/\345\205\250\346\226\207\347\264\242\345\274\225\346\240\274\345\274\217\346\211\251\345\261\225-Office\344\270\216\345\233\276\347\211\207OCR\350\256\241\345\210\222.md"`
- `"docs/02-\346\212\200\346\234\257\346\236\266\346\236\204\344\270\216\345\274\200\345\217\221/\346\212\200\346\234\257\350\247\204\345\210\222/\345\205\250\346\226\207\347\264\242\345\274\225\346\240\274\345\274\217\346\211\251\345\261\225-\345\256\236\347\216\260\345\256\214\346\210\220\345\272\246\345\210\206\346\236\220\346\212\245\345\221\212.md"`
- `"docs/02-\346\212\200\346\234\257\346\236\266\346\236\204\344\270\216\345\274\200\345\217\221/\346\212\200\346\234\257\350\247\204\345\210\222/\346\265\217\350\247\210\345\231\250Tab\347\263\273\347\273\237-WebContentsView\350\277\201\347\247\273\350\256\276\350\256\241\346\226\207\346\241\243.md"`
- `"docs/03-AI\344\270\216Agent\347\263\273\347\273\237/app_log_analysis_and_fix_plan.md"`
- `"docs/03-AI\344\270\216Agent\347\263\273\347\273\237/\347\275\221\351\241\265\345\244\247\346\250\241\345\236\213Browser-API\346\217\222\344\273\266\351\234\200\346\261\202\346\226\207\346\241\243.md"`
- `docs/app_log_analysis_and_fix_plan.md`
- `docs/bugfix/workspace-browser-mount-await.md`
- `docs/plugin-system-optimization-backlog.md`
- `"docs/\344\274\232\350\257\235\350\265\204\346\272\220\347\256\241\347\220\206\344\270\216\345\252\222\344\275\223\350\207\252\345\212\250\344\270\213\350\275\275\346\226\271\346\241\210-\350\257\204\344\274\260\346\212\245\345\221\212.md"`
- `"docs/\345\205\250\346\226\207\347\264\242\345\274\225\344\270\216MCP\345\256\277\344\270\273\345\267\245\345\205\267\345\217\230\346\233\264-\344\273\243\347\240\201\345\256\241\346\237\245.md"`
- `"docs/\345\215\232\346\264\233\345\243\253JSB12\344\277\204\350\257\255\345\207\272\345\217\243\350\257\264\346\230\216\344\271\246.pdf"`
- `"docs/\346\210\252\345\261\2172026-07-19 08.59.57.png"`
- `"docs/\351\205\267\350\247\206\351\223\201\351\252\221.pdf"`
- `"docs/\351\205\267\350\247\206\351\223\201\351\252\221\357\274\210\344\277\256\350\256\242 3\357\274\211.pptx"`
- `electron/main.ts`
- `electron/preload.cjs`
- ... 还有 62 个