# 12 — 代码缺口

本文档记录 skill 架构设计 vs 实际代码的差距，用于后续逐步弥补。

---

## P0 — 声明式 contributes 未完整实现

skill 设计的声明式 UI 贡献（对标 VS Code `contributes`），当前代码已实现以下项：

### 已实现 ✅

| 贡献项 | 代码位置 | 说明 |
|--------|---------|------|
| `contributes.selectionMenuItems` | `plugin-manager.ts` `registerStaticContributions` | 注册到 ElectronSelection |
| `contributes.shortcutActions` | `plugin-manager.ts` `registerStaticContributions` | 注册到 ShortcutActionRegistry |
| `contributes.events` | `event-subscription-registry.ts` | 事件订阅索引，支持自动唤醒 |
| `contributes.ribbonIcons` | `PluginRegistry.ts` | 注册到侧边栏 Ribbon 组件 |
| `contributes.views` | `PluginRegistry.ts` | 注册 settings tabs |
| `contributes.settingsSections` | `PluginRegistry.ts` | 注册设置面板内部 sections |
| `contributes.voiceHandlers` | `PluginRegistry.ts` | 注册语音处理器 |

### 未实现 📋

无（所有声明式贡献项已实现）

### 实现要点

`registerStaticContributions` 位于 `electron/plugins/plugin-manager.ts`，需要为每个 contributes 类型添加处理逻辑：

```typescript
// 伪代码示例
if (plugin.manifest.contributes?.workspaceViews) {
  for (const view of plugin.manifest.contributes.workspaceViews) {
    workspaceAPI.registerStaticView(view.id, view.title, view.view, plugin.id);
  }
}
```

---

## P0 — CLI 模板与 skill 不匹配

`plugins-sdk/create.js` 的 `createPlugin()` 生成的模板：

| 字段 | 模板值 | skill 期望 | 影响 |
|------|--------|-----------|------|
| `main` | `"src/index.js"` | `"dist/background.js"` 或 `"view"` | 路径错误 |
| `type` | `"panel"` | 按需 | 模板总是 panel |
| `activationEvents` | 缺失 | 至少一个 | 导致总是立即加载 |
| `namespace` | 生成 | 不需要 | 多余字段 |
| `permissions` | `"ai:inference"` | `"ai"` | 格式不一致 |
| `view` | 缺失 | panel 必填 | panel 类型缺入口 |
| `contributes` | 缺失 | 应生成示例 | 无声明式配置 |
| `scripts.build` | 缺失（只有 vitest） | 需 esbuild 构建 | 无构建能力 |

### 修复方向（二选一）

**A. 修改 CLI 模板**：让 `create.js` 生成符合 skill 规范的文件结构（含 TypeScript、esbuild、contributes 示例）。

**B. Skill 基于现有模板指导**：skill 文档说明"CLI 生成后需修正以下项..."（当前方案，临时可行但体验差）。

---

## P1 — PluginManifest 类型不完整

`electron/plugins/plugin-manager.ts` 中的 `PluginManifest` 接口缺少以下字段的类型定义：

| 字段 | 是否被代码使用 | 当前类型 |
|------|:---:|---------|
| `width` | 是 | 缺失 |
| `height` | 是 | 缺失 |
| `position` | 是 | 缺失 |
| `hideTitleBar` | 是 | 缺失 |
| `interceptKeys` | 是 | 缺失 |
| `supportTabs` | 是 | 缺失 |
| `startupPriority` | 是 | 缺失 |
| `triggerPrefix` | 是 | 缺失 |
| `nativeElectron` | 是 | 缺失 |
| `windowConfig` | 是 | 缺失 |
| `contributes.shortcutActions` | 是 | `[key: string]: unknown`（非类型安全） |

需在 `PluginManifest` 中添加明确的类型定义。

---

## P2 — SDK 类型双版本

`plugins-sdk/` 下存在两套 `BerryTraceSDK` 接口定义：

1. **`types.d.ts`** (65KB) — 外部插件使用的 `.d.ts`
2. **`types.ts`** (88KB) — 源码

差异：
- `types.ts` 包含 `articles`, `dialog`, `localAi`, `publish`, `scheduler`, `selectionMenu` 等额外命名空间
- `types.d.ts` 是精简版

需确认哪些模块对插件开发者开放，统一两份定义。

---

## P3 — esbuild shim 缺少模块

`scripts/bundle.mjs` 中的 `sdkShimPlugin` 只代理了 11 个模块，但实际 SDK 有更多（`search`, `plugin`, `articles`, `dialog`, `localAi`, `publish`, `selectionMenu`）。面板类型插件如果调用了 shim 未代理的模块会 `undefined`。

---

## 优先级总结

```
1. [P0] CLI 模板修复 → 让 AI 能一键创建正确结构的插件
2. [P1] PluginManifest 类型补全
3. [P2] SDK 类型统一
4. [P3] shim 模块补全
```
