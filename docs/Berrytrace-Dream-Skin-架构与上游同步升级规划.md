# Berrytrace-Dream-Skin 架构设计与上游同步升级规划方案

> **项目仓库**：`https://github.com/fdwl/Berrytrace-Dream-Skin` (`/Users/li/work/work/Berrytrace-Dream-Skin`)  
> **上游仓库**：`https://github.com/Fei-Away/Codex-Dream-Skin`  
> **目标宿主**：BerryTrace (莓莓印记) 插件体系  
> **规划日期**：2026-07-30

---

## 1. 核心目标与架构挑战

本项目旨在将 `Codex-Dream-Skin` 重构成一个 **原生支持 BerryTrace 宿主体系的主题/皮肤插件**，同时**无缝兼容 DreamSkin 资源包（.zip / manifest.json + theme.json + background.png）的导入**。

### 核心架构挑战：
如何在二次开发 BerryTrace 插件功能的同时，**确保未来能够无痛平滑合并 upstream (Fei-Away/Codex-Dream-Skin) 的代码更新与 Schema 校验升级**，避免代码交织导致合并冲突。

---

## 2. 三层解耦架构设计 (Three-Tier Decoupled Architecture)

为了实现与上游同步零冲突，我们将仓库代码划分为 **三层隔离架构**：

```text
/Users/li/work/work/Berrytrace-Dream-Skin/
├── upstream-core/                      <-- 【第一层：上游核心保留层】
│   ├── runtime/
│   │   ├── theme-package-validator.mjs   (100% 保持上游原样)
│   │   ├── safe-css-validator.mjs        (100% 保持上游原样)
│   │   └── image-metadata.mjs            (100% 保持上游原样)
│   └── tools/
│       └── selectors.json                (上游选择器配置)
│
├── adapter/                            <-- 【第二层：协议适配中枢层】 (隔离逻辑)
│   ├── theme-adapter.ts                  (将 DreamSkin theme.json 映射为 BerryTrace CSS 变量)
│   ├── safe-css-bridge.ts                (桥接 safe-css-validator 到 BerryTrace 渲染引擎)
│   └── package-importer.ts               (Zip 解压、sha256 校验与图片 Base64 / Blob 转换)
│
└── plugin/                             <-- 【第三层：BerryTrace 原生插件层】 (隔离 UI)
    ├── plugin.json                       (BerryTrace 插件声明：workspaceViews, ribbonIcons, events)
    ├── package.json                      (独立的 TypeScript / React 构建配置)
    ├── src/
    │   ├── main/                         (Node.js 后台：插件存储 sdk.storage 与主题包持久化)
    │   └── view/                         (React 前端 UI：主题画廊、预览、一键换肤、上传)
    └── dist/                             (编译产物，供 BerryTrace 载入)
```

---

## 3. 详细分层职责与无缝映射

### 3.1 协议适配层 (`adapter/`) 转化字典

适配器层负责拦截上游 `theme.json` 数据，转换为 BerryTrace 全局语义 Tokens：

```typescript
// adapter/theme-adapter.ts
export function transformDreamSkinToBerryTrace(themeJson: DreamSkinTheme, imageUri: string) {
  return {
    cssVariables: {
      '--berrytrace-custom-bg': `url("${imageUri}")`,
      '--berrytrace-bg-position': `${(themeJson.art?.focusX ?? 0.5) * 100}% ${(themeJson.art?.focusY ?? 0.5) * 100}%`,
      '--bg-background': themeJson.colors.background,
      '--bg-card': themeJson.colors.panel,
      '--bg-muted': themeJson.colors.panelAlt,
      '--brand-primary': themeJson.colors.accent,
      '--text-foreground': themeJson.colors.text,
      '--text-muted-foreground': themeJson.colors.muted,
      '--border-border': themeJson.colors.line,
    },
    appearance: themeJson.appearance // 'light' | 'dark' | 'auto'
  };
}
```

### 3.2 插件配置 (`plugin/plugin.json`)

按照 BerryTrace 规范注册插件能力：

```json
{
  "id": "com.berrytrace.plugin.dream-skin",
  "name": "BerryTrace DreamSkin 主题与个性化皮肤",
  "version": "1.0.0",
  "type": "hybrid",
  "main": "dist/main.js",
  "view": "dist/view.js",
  "description": "无缝兼容 DreamSkin (.zip / theme.json) 资源包的 BerryTrace 原生主题插件",
  "contributes": {
    "ribbonIcons": [
      {
        "id": "open-dream-skin-gallery",
        "title": "主题皮肤库",
        "icon": "Palette",
        "targetView": "dream-skin-view"
      }
    ],
    "workspaceViews": [
      {
        "id": "dream-skin-view",
        "title": "DreamSkin 主题管理",
        "icon": "Brush"
      }
    ]
  }
}
```

---

## 4. Git 上游同步与升级工作流 (Upstream Sync Workflow)

为了在未来 `Fei-Away/Codex-Dream-Skin` 发布新功能、新校验规则或新协议字段时轻松同步升级，规范以下 Git 工作流：

### 4.1 远程仓库配置
```bash
# 在 /Users/li/work/work/Berrytrace-Dream-Skin 执行
git remote add upstream https://github.com/Fei-Away/Codex-Dream-Skin.git
```

### 4.2 无痛合并四步法
1. **拉取上游最新分支**：
   `git fetch upstream`
2. **合并上游更改**：
   `git merge upstream/main`
   *(由于我们把 BerryTrace 的插件代码全部放置在 `adapter/` 与 `plugin/` 目录中，`upstream/main` 针对 `runtime/` 和 `tools/` 的更新将自动无缝合并，零代码冲突)*
3. **适配器校验同步**：
   若上游 `theme-package-validator.mjs` 新增了校验规则，只需更新 `adapter/package-importer.ts` 中的调用方法即可。
4. **提交并推送至个人仓库**：
   `git push origin main`

---

## 5. 实施路线图 (Implementation Roadmap)

| 阶段 | 任务目标 | 交付物 |
| :--- | :--- | :--- |
| **阶段 1：目录重构与 git upstream 配置** | 绑定 `upstream` 远程，整理 `upstream-core/`, `adapter/`, `plugin/` 架构目录 | 干净无冲突的仓库基线 |
| **阶段 2：适配层核心开发 (`adapter/`)** | 实现 `theme-adapter.ts` 与 `package-importer.ts`（支持 `.zip` 解压与验证） | 协议转换与校验模块 |
| **阶段 3：BerryTrace 插件 UI 与存储 (`plugin/`)** | 编写 React 主题库画廊，集成 `sdk.storage` 与一键换肤控制面板 | 编译输出 `dist/` 可加载插件 |
| **阶段 4：全流程测试与同步验证** | 导入 `mikuu-full-background-0.1.0` 测试，模拟 upstream 合并流程 | 验证通过的完整插件 |

---

## 6. 结论

通过上述**三层解耦架构**与 **Git Upstream 隔离合并策略**，既能保持与原开源项目 `Codex-Dream-Skin` 100% 的上游升级能力，又能以极高代码质量交付 BerryTrace 原生插件。
