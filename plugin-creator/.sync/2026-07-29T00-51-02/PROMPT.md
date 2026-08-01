# SKILL 文档同步提示词 (plugin-creator)

> 本文件由 `scripts/skill-sync.mjs --skill plugin-creator` 自动生成，请将以下内容直接给 AI 执行。

---

## 你的任务

根据 git 变更，更新 `plugins-dev/npx-tools/skills/plugin-creator/` 下的 SKILL 规范与参考文档。

**对比范围**: `73e0e545` → `7303b521`（共 106 个相关模块变更）

---

## 执行步骤

### 第 1 步：读取变更摘要

```bash
cat "plugins-dev/npx-tools/skills/plugin-creator/.sync/2026-07-29T00-51-02/SUMMARY.md"
```

### 第 2 步：逐个读取 diff 文件，理解具体修改

```bash
ls "plugins-dev/npx-tools/skills/plugin-creator/.sync/2026-07-29T00-51-02/files/"
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
node scripts/skill-sync.mjs --skill plugin-creator --update 7303b521b7405acc197b0adc1fb181bb142722c7
```

---

## 变更文件清单

| 文件 | +增 | -减 |
|------|------|------|
| `electron/config/DbCache.ts` | +1 | -1 |
| `electron/plugins/api-dispatcher.ts` | +12 | -3 |
| `electron/plugins/controllers/ai.ts` | +192 | -8 |
| `electron/plugins/controllers/api-context.ts` | +3 | -3 |
| `electron/plugins/controllers/browser.ts` | +79 | -5 |
| `electron/plugins/controllers/computer-use-controller.ts` | +8 | -8 |
| `electron/plugins/controllers/hooks.ts` | +2 | -1 |
| `electron/plugins/controllers/local-ai.ts` | +2 | -1 |
| `electron/plugins/controllers/publish.ts` | +2 | -1 |
| `electron/plugins/controllers/security.ts` | +58 | -0 |
| `electron/plugins/controllers/storage.ts` | +42 | -9 |
| `electron/plugins/controllers/system.ts` | +134 | -83 |
| `electron/plugins/controllers/terminal.ts` | +247 | -15 |
| `electron/plugins/controllers/workflow-controller.ts` | +3 | -2 |
| `electron/plugins/controllers/workspace.ts` | +153 | -2 |
| `electron/plugins/hook-registry.ts` | +1 | -1 |
| `electron/plugins/main-sdk-creator.ts` | +3 | -2 |
| `electron/plugins/mcp-gateway.ts` | +521 | -0 |
| `electron/plugins/mcp-host.ts` | +222 | -31 |
| `electron/plugins/plugin-activity-tracker.ts` | +148 | -0 |
| `electron/plugins/plugin-agent-kernel.ts` | +3 | -2 |
| `electron/plugins/plugin-contributions.ts` | +154 | -0 |
| `electron/plugins/plugin-dev-helper.ts` | +177 | -0 |
| `electron/plugins/plugin-hot-reload.ts` | +36 | -11 |
| `electron/plugins/plugin-init-helper.ts` | +205 | -0 |
| `electron/plugins/plugin-install.ts` | +5 | -2 |
| `electron/plugins/plugin-ipc.ts` | +112 | -8 |
| `electron/plugins/plugin-launcher.ts` | +42 | -24 |
| `electron/plugins/plugin-manager.ts` | +251 | -672 |
| `electron/plugins/plugin-pool-host.js` | +12 | -17 |
| `electron/plugins/plugin-pool.ts` | +1 | -1 |
| `electron/plugins/plugin-scanner.ts` | +63 | -15 |
| `electron/plugins/plugin-url-helper.ts` | +2 | -2 |
| `electron/plugins/plugin-verifier.ts` | +10 | -4 |
| `electron/plugins/plugin-watchdog.ts` | +86 | -21 |
| `electron/plugins/shared-context-store.ts` | +1 | -1 |
| `electron/plugins/signature-verifier.ts` | +14 | -11 |
| `electron/plugins/workflow-credential-store.ts` | +5 | -3 |
| `electron/plugins/workflow-dag-builder.ts` | +1 | -1 |
| `electron/plugins/workflow-engine.ts` | +58 | -29 |
| `electron/plugins/workflow-history-manager.ts` | +4 | -2 |
| `electron/plugins/workflow-intent-router.ts` | +3 | -1 |
| `electron/plugins/workflow-runner.ts` | +2 | -1 |
| `electron/plugins/workflow-state-store.ts` | +3 | -2 |
| `electron/services/browser-cookie-import.ts` | +775 | -0 |
| `electron/services/db-ipc.ts` | +3 | -0 |
| `electron/services/db-manager.ts` | +3 | -2 |
| `electron/services/db-migrations.ts` | +47 | -49 |
| `electron/services/document-center.ts` | +421 | -0 |
| `electron/services/file-manager.ts` | +326 | -9 |
| `electron/services/fts-hybrid-searcher.ts` | +67 | -36 |
| `electron/services/fulltext-file-parsers.ts` | +6 | -2 |
| `electron/services/fulltext-index-manager.ts` | +53 | -44 |
| `electron/services/global-shortcuts.ts` | +10 | -2 |
| `electron/services/local-ai-service.ts` | +30 | -8 |
| `electron/services/local-server.ts` | +52 | -3 |
| `electron/services/logger.ts` | +66 | -13 |
| `electron/services/memory-monitor.ts` | +3 | -1 |
| `electron/services/ocr-image-parser.ts` | +48 | -11 |
| `electron/services/oem-manager.ts` | +47 | -0 |
| `electron/services/onboarding-download.ts` | +21 | -5 |
| `electron/services/onboarding-service.ts` | +7 | -3 |
| `electron/services/preferences-manager.ts` | +2 | -1 |
| `electron/services/protocol-handler.ts` | +7 | -4 |
| `electron/services/pty/agent-title-detector.ts` | +124 | -0 |
| `electron/services/pty/osc133-wrapper.ts` | +2 | -0 |
| `electron/services/ripgrep-service.ts` | +13 | -10 |
| `electron/services/screenshot.ts` | +2 | -1 |
| `electron/services/selection.ts` | +29 | -29 |
| `electron/services/sleep-assertion.ts` | +3 | -1 |
| `electron/services/updater.ts` | +2 | -1 |
| `electron/services/vector-search-engine.ts` | +1 | -1 |
| `electron/services/workspace-context.ts` | +71 | -12 |
| `electron/services/workspace-manager.ts` | +66 | -38 |
| `electron/services/worktree-sandbox.ts` | +3 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/SKILL.md` | +2 | -2 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/06-contributions.md` | +231 | -5 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07b-filesystem.md` | +1 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/08-build.md` | +366 | -59 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/14-mcp-tools.md` | +35 | -27 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js` | +185 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-sdk.js` | +35 | -9 |
| `plugins-sdk/cli.js` | +287 | -45 |
| `plugins-sdk/types.d.ts` | +97 | -11 |
| `plugins-sdk/types.js` | +35 | -9 |
| `plugins-sdk/types.ts` | +166 | -28 |
| `src/main.tsx` | +13 | -0 |
| `src/stores/dashboard.ts` | +11 | -1 |
| `src/stores/workspace.ts` | +53 | -4 |
| `src/views/plugins/PluginsManagementPanel.tsx` | +100 | -56 |
| `src/views/plugins/workspace/BrowserTabPanel.tsx` | +737 | -97 |
| `src/views/plugins/workspace/FlexWorkspace.tsx` | +171 | -144 |
| `src/views/plugins/workspace/TerminalTabPanel.tsx` | +163 | -24 |
| `src/views/plugins/workspace/WorkspaceHome.tsx` | +20 | -7 |
| `src/views/plugins/workspace/WorkspaceTabPanel.tsx` | +61 | -38 |
| `src/views/plugins/workspace/components/BrowserAddressBar.tsx` | +136 | -0 |
| `src/views/plugins/workspace/components/BrowserAnnotationSheet.tsx` | +133 | -0 |
| `src/views/plugins/workspace/components/BrowserImportHintButton.tsx` | +161 | -0 |
| `src/views/plugins/workspace/components/GrabConfirmationSheet.tsx` | +123 | -0 |
| `src/views/plugins/workspace/components/TabCreateMenuDropdown.tsx` | +289 | -0 |
| `src/views/plugins/workspace/components/markup/MarkupOverlay.tsx` | +329 | -0 |
| `src/views/plugins/workspace/components/markup/MarkupToolbar.tsx` | +151 | -0 |
| `src/views/plugins/workspace/globals.css` | +94 | -25 |
| `src/views/plugins/workspace/utils/browser-address-bar-suggestions.ts` | +128 | -0 |
| `src/views/plugins/workspace/utils/grab-guest-script.test.ts` | +67 | -0 |
| `src/views/plugins/workspace/utils/grab-guest-script.ts` | +308 | -0 |

---

## 跳过的文件（与本 SKILL 无关）

- `.agents/AGENTS.md`
- `.agents/rules/code-style-guide.md`
- `.agents/skills/datahub/SKILL.md`
- `.agents/skills/datahub/references/local_workspace.md`
- `.agents/skills/datahub_local_workspace/SKILL.md`
- `.agents/skills/plugin-creator/references/08-build.md`
- `AGENTS.md`
- `README.md`
- `api-map.json`
- `berrytrace-db-schema.sql`
- `berrytrace_workspace/diary/2026-06-26.md`
- `berrytrace_workspace/diary/2026-06-27.md`
- `berrytrace_workspace/diary/2026-07-01.md`
- `"berrytrace_workspace/paste_# \360\237\244\226 ai \345\217\214\346\234\272\345\215\217\344\275\234\344\272\244\346\216\245\344\270\216_20260725032128.md"`
- `"berrytrace_workspace/\351\227\256\351\242\230\345\210\227\350\241\250.md"`
- ... 还有 435 个