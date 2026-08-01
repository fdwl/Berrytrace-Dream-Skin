# sdk.ui — UI 与主题 API

`sdk.ui` 是插件操控宿主界面外观的统一入口，所有 CSS 注入、主题持久化、品牌色替换、壁纸控制均通过此命名空间完成。

---

## API 总览

| 方法 | 说明 | 跨窗口 | 持久化 |
|------|------|:------:|:------:|
| `injectStyle(id, css)` | 注入样式到当前窗口 | ❌ | ❌ |
| `removeStyle(id)` | 移除当前窗口中的样式 | ❌ | ❌ |
| `broadcastStyle(id, css)` | 广播样式到所有窗口 | ✅ | ❌ |
| `persistStyle(id, css)` | 持久化样式（重启自动恢复） | ✅ | ✅ |
| `clearPersistedStyle(id)` | 移除一条持久化样式 | ✅ | ✅ |
| `clearAllPersistedStyles()` | 清空所有持久化样式 | ❌ | ✅ |
| `setToken(token, value, persist?)` | 设置 CSS Design Token（自动处理伴生 RGB） | ❌ | 可选 |
| `registerFont(familyName, url, target?)` | 注册自定义字体 | ❌ | ❌ |
| `setWallpaper(url, options?)` | 设置全屏壁纸（激活 has-wallpaper class） | ✅ | ✅ |
| `clearWallpaper()` | 清除壁纸并恢复默认背景 | ✅ | ✅ |
| `getTheme()` | 获取当前主题模式 (`light` \| `dark`) | — | — |
| `onThemeChange(listener)` | 监听 Light/Dark 切换 | — | — |
| `setTheme(theme)` | 设置宿主主题模式 (`light` \| `dark` \| `system`) | ✅ | ✅ |
| `setAppearance(mode)` | 临时覆盖外观模式 (`light` \| `dark` \| `auto`) | ✅ | ✅ |
| `clearAppearance()` | 清除外观覆盖 | ✅ | ✅ |

---

## 主题插件开发模式

### 模式 A：简单 Skin（一次写入，重启无需插件）

适用于：只需修改 CSS 变量的纯皮肤插件。

```ts
// onload 时调用一次
async onload(sdk) {
  const css = buildMyCss(sdk.ui.getTheme());
  
  // persistStyle = injectStyle + broadcastStyle + 持久化存储（三合一）
  // 下次 App 启动，宿主 SkinLayer 在插件加载之前自动恢复此 CSS，零闪烁
  sdk.ui.persistStyle('my-skin:main', css);
}

async onunload(sdk) {
  // 可选：卸载时清除（若想保留效果则不调用）
  sdk.ui.clearPersistedStyle('my-skin:main');
}
```

> **plugin.json 中无需写 `activationEvents`**，插件不需要每次启动都运行。

---

### 模式 B：复杂 Skin（始终运行，动态响应）

适用于：需要实时监听主题切换、动态更新 CSS 的插件。

```json
// plugin.json
{
  "activationEvents": ["onStartupFinished"]
}
```

```ts
async onload(sdk) {
  // 立即应用当前主题
  applyTheme(sdk, sdk.ui.getTheme());

  // 监听 Light/Dark 切换，实时更新
  const off = sdk.ui.onThemeChange((mode) => {
    applyTheme(sdk, mode);
  });

  this._cleanupTheme = off;
}

function applyTheme(sdk, mode) {
  const css = mode === 'dark' ? DARK_CSS : LIGHT_CSS;
  // broadcastStyle 不持久化，每次由插件生成
  sdk.ui.broadcastStyle('my-skin:main', css);
}

async onunload() {
  this._cleanupTheme?.();
}
```

---

### 模式 C：混合 Skin（静态 CSS + 动态常驻按需切换）

适用于：同时支持静态皮肤和动态皮肤的高级插件（如 DreamSkin）。

**原理**：`sdk.plugin.setStartupResident(bool)` 允许插件在运行时动态修改下次启动的常驻策略，避免所有用户都承担动态插件的启动开销。

```ts
// 用户选择静态皮肤时 → 插件只需写一次 CSS，自身可以不常驻
async activateStaticSkin(sdk, css) {
  sdk.ui.persistStyle('my-skin:main', css);
  // 告知宿主：下次启动我不需要常驻，SkinLayer 会自动恢复 CSS
  await sdk.plugin.setStartupResident(false);
}

// 用户选择动态皮肤（定时轮播壁纸、音效等）时 → 插件需要常驻
async activateDynamicSkin(sdk) {
  // 告知宿主：下次启动我需要常驻（等价于 activationEvents: ["onStartupFinished"]）
  await sdk.plugin.setStartupResident(true);
  // 启动动态逻辑...
  this.startWallpaperCarousel(sdk);
}
```

> 效果在下次 App 重启后生效。当前会话不受影响。

---

## 壁纸控制 API

宿主在 `index.css` 中为壁纸功能预留了 CSS 变量钩子和激活规则。插件通过 `sdk.ui.setWallpaper()` 即可一键挂载全屏壁纸，**无需自行编写 body 背景 CSS**。

### `sdk.ui.setWallpaper(url, options?)`

```ts
sdk.ui.setWallpaper('https://example.com/my-wallpaper.jpg', {
  focusX: 60,        // 水平焦点 % (默认 50)
  focusY: 30,        // 垂直焦点 % (默认 50)
  opacity: 0.85,     // 面板透明度 (0.5~1.0，供皮肤 CSS 消费)
  blur: '12px',      // 毛玻璃半径 (供皮肤 CSS 消费)
});
```

**行为说明：**
1. 在 `<html>` 上挂载 `has-wallpaper` class → 触发宿主 `index.css` 的背景激活规则
2. 设置 `--berrytrace-bg-image`、`--berrytrace-bg-position` CSS 变量
3. 设置 `--berrytrace-bg-opacity`、`--berrytrace-bg-blur`（供皮肤 CSS 消费，宿主不强制使用）
4. 广播给所有窗口，广播时各窗口可用 `html.quick-panel-root-page` 等选择器排除
5. 持久化存储 → 重启后 SkinLayer 自动恢复，**插件无需常驻**

### `sdk.ui.clearWallpaper()`

```ts
sdk.ui.clearWallpaper(); // 移除壁纸，恢复默认背景
```

### 添加毛玻璃效果（插件自行实现）

宿主**不强制施加**毛玻璃，由皮肤插件按需注入：

```ts
// 配合 setWallpaper 使用，给主要面板添加毛玻璃叠加
const glassCss = `
  /* 仅主窗口生效，小窗口不受影响 */
  html.main-window-root-page.has-wallpaper .bg-background,
  html.main-window-root-page.has-wallpaper .bg-card {
    background-color: rgba(255, 255, 255, var(--berrytrace-bg-opacity, 0.85)) !important;
    backdrop-filter: blur(var(--berrytrace-bg-blur, 12px)) !important;
    -webkit-backdrop-filter: blur(var(--berrytrace-bg-blur, 12px)) !important;
  }

  .dark.has-wallpaper .bg-background,
  .dark.has-wallpaper .bg-card {
    background-color: rgba(15, 23, 42, var(--berrytrace-bg-opacity, 0.85)) !important;
    backdrop-filter: blur(var(--berrytrace-bg-blur, 12px)) !important;
    -webkit-backdrop-filter: blur(var(--berrytrace-bg-blur, 12px)) !important;
  }
`;
sdk.ui.persistStyle('my-skin:glass', glassCss);
```

> ⚠️ 注意：直接覆盖 `bg-background` / `bg-card` 的颜色会影响其他主题。建议配合窗口 class（`html.main-window-root-page.has-wallpaper`）精确限定作用域。

---

## 正确替换品牌色：`setToken`

### ❌ 错误写法（Tailwind `bg-brand/10` 不跟随）

```ts
// 只改了 --color-brand（hex），--brand-rgb 没有同步
// 导致 Tailwind bg-brand/10、ring-brand/40 等仍显示旧颜色
document.documentElement.style.setProperty('--color-brand', '#e85d75');
```

### ✅ 正确写法（使用 `sdk.ui.setToken`）

```ts
// setToken 自动将 hex 解析为 R G B 分量，同步更新 --brand-rgb
// Tailwind bg-brand/10、text-brand、ring-brand/40 全部跟随
sdk.ui.setToken('--color-brand', '#e85d75');

// 同时持久化（重启后自动恢复）
sdk.ui.setToken('--color-brand', '#e85d75', true);
```

**原理**：Tailwind 的 `bg-brand/10` 展开为 `rgb(var(--brand-rgb) / 0.1)`，
需要 `--brand-rgb: 232 93 117`（空格分隔的 R G B 分量），而不是 hex。
`setToken` 内部自动完成 hex → `R G B` 转换并写入 `--brand-rgb`。

---

## 主题与外观模式切换 (setTheme / setAppearance)

当插件需要修改系统/宿主整体主题模式时，请使用 `sdk.ui.setTheme(mode)`。

```ts
// 将系统主题切换为暗色模式
sdk.ui.setTheme('dark');

// 将系统主题切换为亮色模式
sdk.ui.setTheme('light');

// 恢复跟随系统 (system)
sdk.ui.setTheme('system');
```

- **`sdk.ui.setTheme(mode: 'light' | 'dark' | 'system')`**: 修改宿主的主题模式（同步更新 `app-theme` 本地存储、DOM 根 class、主进程 Native Theme 缓存并广播给所有窗口）。
- **`sdk.ui.setAppearance(mode: 'light' | 'dark' | 'auto')`**: 适用于皮肤/Skin 插件临时覆盖渲染外观（不改变用户的系统主题偏好设置）。

---

## 窗口作用域控制（按窗口差异化样式）

宿主每个窗口的 `<html>` 根节点有唯一的 CSS class，插件可据此精确控制哪个窗口应用哪些样式。

| 窗口 | `<html>` class | 来源 |
|------|---------------|------|
| 主窗口 | `main-window-root-page` | 宿主动态注入（`did-finish-load` 事件） |
| 快捷面板 | `quick-panel-root-page` | `index.css` 静态声明 |
| 浮球 | `float-ball-root-page` | `index.css` 静态声明 |
| 浮动网页窗口 | `float-web-root-page` | `index.css` 静态声明 |
| 发布小窗 | `publish-window-root` | `index.css` 静态声明 |

插件可利用这些 class 为不同窗口提供差异化样式：

```ts
const css = `
  /* 主窗口：显示全屏背景图 + 毛玻璃 */
  html.main-window-root-page.has-wallpaper .bg-background {
    backdrop-filter: blur(12px);
    background-color: rgba(255, 255, 255, 0.82) !important;
  }

  /* 小窗口（快捷面板）：不显示壁纸，保持干净 */
  html.quick-panel-root-page #root {
    background: none !important;
  }
`;

sdk.ui.persistStyle('my-skin:wallpaper', css);
```

> **主题开发者无需宿主团队任何配合**，完全通过 CSS 选择器自行控制不同窗口的背景行为。

---

## 注入 CSS 变量的规范用法

### 批量替换色彩 Token

```ts
const css = `
  :root {
    --background: #0d0d10;
    --foreground: #f0f0f5;
    --card: #17171c;
    --muted: #222228;
    --border: rgba(255,255,255,0.08);
  }
`;
sdk.ui.persistStyle('my-skin:colors', css);
```

### 替换品牌色（必须用 setToken）

```ts
// ✅ 自动同步 --brand-rgb，确保 bg-brand/10 等跟随
sdk.ui.setToken('--color-brand', '#e85d75', true);
```

### 注册自定义字体

```ts
sdk.ui.registerFont(
  'MyFont',
  'https://cdn.example.com/my-font.woff2',
  '--font-sans'  // 可选：绑定到宿主字体 Token
);
```

---

## 宿主 SkinLayer 持久化机制

`persistStyle` 写入的 CSS 由宿主 **SkinLayer** 统一管理：

```
App 启动
  ├─ 1. initTheme()    ← 恢复 Light/Dark 模式
  ├─ 2. SkinLayer.restore() ← 恢复所有持久化 Skin CSS（插件启动前，零闪烁）
  │        └─ 若包含 __wallpaper__class-marker → 自动挂载 html.has-wallpaper class
  └─ 3. PluginRegistry.init() ← 插件系统启动
           └─ 复杂 Skin onload() → broadcastStyle() 覆盖更新
```

**简单 Skin** 的 CSS 在步骤 2 已生效，用户看不到任何闪烁。

---

## 宿主壁纸 CSS Token 参考

宿主 `index.css` 预定义以下 Token，皮肤插件可直接通过 `setWallpaper` options 设置，或手动写 CSS 消费：

| Token | 默认值 | 说明 |
|-------|--------|------|
| `--berrytrace-bg-image` | `none` | 壁纸 URL，如 `url('...')` |
| `--berrytrace-bg-position` | `center center` | 壁纸焦点位置（background-position） |
| `--berrytrace-bg-opacity` | `1` | 面板透明度（由插件 CSS 消费） |
| `--berrytrace-bg-blur` | `0px` | 毛玻璃模糊半径（由插件 CSS 消费） |

---

## 常见错误

| 问题 | 根因 | 解决 |
|------|------|------|
| `bg-brand/10` 不随主题色变 | 只改了 `--color-brand`，未同步 `--brand-rgb` | 改用 `sdk.ui.setToken()` |
| 重启后主题消失 | 使用了 `broadcastStyle` 而非 `persistStyle` | 改用 `persistStyle` |
| 重启后壁纸消失 | 未调用 `sdk.ui.setWallpaper`（它自动持久化） | 改用 `setWallpaper` 代替手动 setToken |
| 小窗口也出现壁纸 | CSS 没加窗口 class 作用域 | 用 `html.quick-panel-root-page` 选择器排除 |
| 毛玻璃效果没有 | 宿主不强制施加毛玻璃 | 插件自行 `injectStyle` 添加 `backdrop-filter` |
| 字体加载但未生效 | 没有绑定到 `--font-sans` / `--font-mono` | `registerFont(name, url, '--font-sans')` |
| 动态皮肤重启后不自动运行 | plugin.json 没有 `activationEvents` | 用 `sdk.plugin.setStartupResident(true)` 动态设置 |

---

## 插件 UI 微交互一致性规范

插件 UI（`plugins-dev/<plugin-id>/src/`）由宿主 Tailwind **统一编译**，可直接使用以下宿主原语，无需额外安装依赖。

### 可直接使用的宿主交互 Utility 类

| Utility 类 | 适用场景 | 效果 |
|-----------|---------|------|
| `interactive-item` | 列表行、菜单项、设置行 | hover 背景 + 150ms 过渡 |
| `interactive-card` | 卡片、选项块、大容器 | hover 阴影 + 按下轻微缩放 |
| `interactive-icon` | 纯图标小按钮（非 `<Button>`） | hover 背景 + 100ms 过渡 |

皮肤插件修改 `--accent` Token 后，三个类**自动跟随变色**，插件无需任何额外处理。

### 插件中正确写法

```tsx
// ✅ 插件列表行：直接使用宿主 utility 类，皮肤主题自动跟随
<div className="interactive-item px-3 py-2 rounded-lg" onClick={handleClick}>
  <span className="text-sm text-foreground">Item Label</span>
</div>

// ✅ 插件卡片：interactive-card + 自定义内边距
<div className="interactive-card p-4 rounded-xl bg-card border border-border" onClick={openDetail}>
  <CardContent />
</div>

// ✅ 插件图标按钮（非 Shadcn Button）
<div className="interactive-icon p-1.5 rounded-md" onClick={refresh} title="刷新">
  <RefreshCw className="size-4 text-muted-foreground" />
</div>
```

### 插件中禁止写法

```tsx
// ❌ 手写不一致的 hover/active（每个插件行为不同，皮肤无法统一覆盖）
<div
  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
  onClick={handleClick}
>
```

### Motion Token（插件同样可用）

```tsx
// ✅ 使用宿主 Motion Token（统一全站动画节奏）
<div className="transition-colors duration-base">...</div>
<div className="transition-all duration-fast ease-spring">...</div>
```
