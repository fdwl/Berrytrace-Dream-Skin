# SKILL 同步报告 (plugin-creator)

**对比范围**: `73e0e545` → `68041f7b`
**总变更**: 704 个文件，其中与本 SKILL 相关: **124** 个

---

## 📁 相关变更文件

| 文件 | +增 | -减 |
|------|------|------|
| `electron/config/DbCache.ts` | +1 | -1 |
| `electron/plugins/api-dispatcher.ts` | +16 | -6 |
| `electron/plugins/controllers/ai.ts` | +290 | -25 |
| `electron/plugins/controllers/api-context.ts` | +3 | -3 |
| `electron/plugins/controllers/browser.ts` | +79 | -5 |
| `electron/plugins/controllers/computer-use-controller.ts` | +8 | -8 |
| `electron/plugins/controllers/hooks.ts` | +2 | -1 |
| `electron/plugins/controllers/local-ai.ts` | +2 | -1 |
| `electron/plugins/controllers/publish.ts` | +4 | -5 |
| `electron/plugins/controllers/security.ts` | +58 | -0 |
| `electron/plugins/controllers/storage.ts` | +79 | -28 |
| `electron/plugins/controllers/system.ts` | +178 | -86 |
| `electron/plugins/controllers/terminal.ts` | +247 | -15 |
| `electron/plugins/controllers/workflow-controller.ts` | +3 | -2 |
| `electron/plugins/controllers/workspace.ts` | +170 | -2 |
| `electron/plugins/hook-registry.ts` | +1 | -1 |
| `electron/plugins/main-sdk-creator.ts` | +3 | -2 |
| `electron/plugins/mcp-gateway.ts` | +521 | -0 |
| `electron/plugins/mcp-host.ts` | +222 | -31 |
| `electron/plugins/plugin-activity-tracker.ts` | +183 | -0 |
| `electron/plugins/plugin-agent-kernel.ts` | +3 | -2 |
| `electron/plugins/plugin-config-repository.ts` | +200 | -0 |
| `electron/plugins/plugin-contributions.ts` | +162 | -0 |
| `electron/plugins/plugin-dev-helper.ts` | +289 | -0 |
| `electron/plugins/plugin-event-bus.ts` | +88 | -0 |
| `electron/plugins/plugin-hot-reload.ts` | +36 | -11 |
| `electron/plugins/plugin-init-helper.ts` | +213 | -0 |
| `electron/plugins/plugin-install.ts` | +7 | -4 |
| `electron/plugins/plugin-ipc-agent.ts` | +218 | -0 |
| `electron/plugins/plugin-ipc-mcp-tools.ts` | +378 | -0 |
| `electron/plugins/plugin-ipc.ts` | +154 | -580 |
| `electron/plugins/plugin-launcher.ts` | +113 | -70 |
| `electron/plugins/plugin-manager.ts` | +429 | -718 |
| `electron/plugins/plugin-pool-host.js` | +12 | -17 |
| `electron/plugins/plugin-pool.ts` | +23 | -6 |
| `electron/plugins/plugin-scanner.ts` | +63 | -15 |
| `electron/plugins/plugin-state-registry.ts` | +275 | -0 |
| `electron/plugins/plugin-url-helper.ts` | +5 | -4 |
| `electron/plugins/plugin-verifier.ts` | +59 | -7 |
| `electron/plugins/plugin-watchdog.ts` | +99 | -34 |
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
| `electron/services/db-ipc.ts` | +5 | -0 |
| `electron/services/db-manager.ts` | +11 | -2 |
| `electron/services/db-migrations.ts` | +47 | -49 |
| `electron/services/document-center.ts` | +421 | -0 |
| `electron/services/double-tap-detector.ts` | +102 | -143 |
| `electron/services/file-manager.ts` | +326 | -9 |
| `electron/services/fn-voice-input.ts` | +0 | -284 |
| `electron/services/fts-hybrid-searcher.ts` | +67 | -36 |
| `electron/services/fulltext-file-parsers.ts` | +6 | -2 |
| `electron/services/fulltext-index-manager.ts` | +59 | -44 |
| `electron/services/global-shortcuts.ts` | +56 | -129 |
| `electron/services/keybindings-manager.ts` | +277 | -0 |
| `electron/services/lazy-main-window.ts` | +147 | -0 |
| `electron/services/local-ai-service.ts` | +30 | -8 |
| `electron/services/local-server.ts` | +92 | -12 |
| `electron/services/logger.ts` | +79 | -13 |
| `electron/services/memory-monitor.ts` | +3 | -1 |
| `electron/services/menu.ts` | +1 | -2 |
| `electron/services/mouse-hook.ts` | +83 | -78 |
| `electron/services/ocr-image-parser.ts` | +48 | -11 |
| `electron/services/oem-manager.ts` | +52 | -1 |
| `electron/services/onboarding-download.ts` | +32 | -12 |
| `electron/services/onboarding-service.ts` | +56 | -8 |
| `electron/services/preferences-manager.ts` | +78 | -51 |
| `electron/services/protocol-handler.ts` | +8 | -14 |
| `electron/services/pty/agent-title-detector.ts` | +124 | -0 |
| `electron/services/pty/osc133-wrapper.ts` | +2 | -0 |
| `electron/services/ripgrep-service.ts` | +13 | -10 |
| `electron/services/screenshot.ts` | +2 | -1 |
| `electron/services/selection.ts` | +36 | -37 |
| `electron/services/shortcut-activation-dispatcher.ts` | +99 | -0 |
| `electron/services/sleep-assertion.ts` | +3 | -1 |
| `electron/services/updater.ts` | +2 | -1 |
| `electron/services/vector-search-engine.ts` | +1 | -1 |
| `electron/services/workspace-context.ts` | +71 | -12 |
| `electron/services/workspace-manager.ts` | +100 | -46 |
| `electron/services/worktree-sandbox.ts` | +3 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/SKILL.md` | +58 | -13 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/03-plugin-json.md` | +22 | -0 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/04-plugin-types.md` | +161 | -0 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/06-contributions.md` | +263 | -5 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/07b-filesystem.md` | +1 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/08-build.md` | +369 | -59 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/09-workflow.md` | +11 | -24 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/11-troubleshooting.md` | +15 | -0 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/14-mcp-tools.md` | +51 | -39 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/18-code-style.md` | +5 | -1 |
| `plugins-dev/npx-tools/skills/plugin-creator/references/99-known-tricky-bugs.md` | +383 | -0 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js` | +208 | -13 |
| `plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-sdk.js` | +39 | -13 |
| `plugins-sdk/cli.js` | +526 | -50 |
| `plugins-sdk/types.d.ts` | +158 | -28 |
| `plugins-sdk/types.js` | +39 | -13 |
| `plugins-sdk/types.ts` | +215 | -45 |
| `src/main.tsx` | +13 | -0 |
| `src/stores/dashboard.ts` | +43 | -1 |
| `src/stores/workspace.ts` | +53 | -4 |
| `src/views/plugins/PluginsManagementPanel.tsx` | +100 | -56 |
| `src/views/plugins/workspace/BrowserTabPanel.tsx` | +737 | -97 |
| `src/views/plugins/workspace/FlexWorkspace.tsx` | +170 | -172 |
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

## 📚 当前 SKILL 文档（副本在 skill-docs/）

- [SKILL.md](./skill-docs/SKILL.md)
- [01-architecture.md](./skill-docs/01-architecture.md)
- [04-plugin-types.md](./skill-docs/04-plugin-types.md)
- [08-build.md](./skill-docs/08-build.md)
- [11-troubleshooting.md](./skill-docs/11-troubleshooting.md)
- [17-npm.md](./skill-docs/17-npm.md)

---

## ⏭️ 跳过的文件

- `.agents/AGENTS.md`
- `.agents/rules/code-style-guide.md`
- `.agents/skills/datahub/SKILL.md`
- `.agents/skills/datahub/references/local_workspace.md`
- `.agents/skills/datahub_local_workspace/SKILL.md`
- `.agents/skills/plugin-creator/SKILL.md`
- `.agents/skills/plugin-creator/references/04-plugin-types.md`
- `.agents/skills/plugin-creator/references/06-contributions.md`
- `.agents/skills/plugin-creator/references/07b-filesystem.md`
- `.agents/skills/plugin-creator/references/08-build.md`
- `.agents/skills/plugin-creator/references/09-workflow.md`
- `.agents/skills/plugin-creator/references/11-troubleshooting.md`
- `.agents/skills/plugin-creator/references/14-mcp-tools.md`
- `.agents/skills/plugin-creator/references/18-code-style.md`
- `AGENTS.md`
- `README.md`
- `api-map.json`
- `berrytrace-db-schema.sql`
- `berrytrace_workspace/diary/2026-06-26.md`
- `berrytrace_workspace/diary/2026-06-27.md`
- ... 还有 560 个