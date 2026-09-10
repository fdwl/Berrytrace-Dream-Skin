/**
 * DreamSkin Protocol Adapter for BerryTrace
 *
 * 将 Codex-Dream-Skin 的 theme.json (colors, art, appearance)
 * 无损映射转换为 BerryTrace SDK 标准 CSS 注入与壁纸控制。
 *
 * ── 架构原则（依照宿主团队最佳实践倡议）─────────────────────────────────────
 * 1. 本地 Zip 图片解压后落盘保存为 file:// 或 berrytrace-plugin:// 静态文件，
 *    彻底避免 5MB Base64 冲爆 localStorage 与 DOM 行内样式。
 * 2. 壁纸持久化调用 sdk.ui.setWallpaper(shortUrl)。
 * 3. 页面透光由 html.has-wallpaper .bg-background / .bg-card 驱动。
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface DreamSkinArt {
  focusX?: number; // 0.0 - 1.0 (default: 0.5)
  focusY?: number; // 0.0 - 1.0 (default: 0.5)
  blur?: string;
  safeArea?: string;
  taskMode?: string;
}

export interface DreamSkinColors {
  background?: string;
  panel?: string;
  panelAlt?: string;
  accent?: string;
  accentAlt?: string;
  secondary?: string;
  highlight?: string;
  text?: string;
  muted?: string;
  line?: string;
}

export interface DreamSkinThemeConfig {
  schemaVersion?: number;
  id: string;
  name: string;
  image?: string; // "background.png" or "background.webp"
  appearance?: "light" | "dark" | "auto";
  art?: DreamSkinArt;
  colors?: DreamSkinColors;
  dynamic?: boolean;
  fontFamily?: string;
}

export interface BerryTraceAppliedTheme {
  themeId: string;
  name: string;
  appearance: "light" | "dark" | "auto";
  cssVariables: Record<string, string>;
  brandColor?: string;
  wallpaperUrl?: string;
  wallpaperFocusX?: number;
  wallpaperFocusY?: number;
  wallpaperBlur?: string;
  customCss?: string;
  isDynamic?: boolean;
}

/** sdk.ui 接口 */
export interface SdkUi {
  persistStyle(id: string, css: string): void;
  clearPersistedStyle(id: string): void;
  clearAllPersistedStyles?(): void;
  broadcastStyle(id: string, css: string): void;
  removeStyle(id: string): void;
  setToken(token: string, value: string, persist?: boolean): void;
  getTheme(): "light" | "dark";
  onThemeChange(listener: (mode: "light" | "dark") => void): () => void;
  registerFont?(familyName: string, url: string, target?: string): void;
  setTheme?(theme: "light" | "dark" | "system"): void;
  setAppearance?(mode: "light" | "dark" | "auto"): void;
  clearAppearance?(): void;
  setWallpaper(url: string, options?: {
    focusX?: number;
    focusY?: number;
    opacity?: number;
    blur?: string;
  }): void;
  clearWallpaper(): void;
}

/** sdk.plugin 接口 */
export interface SdkPlugin {
  setStartupResident(resident: boolean): Promise<void>;
}

// ── Skin Style 命名空间 ─────────────────────────────────────────────────────
export const SKIN_STYLE_ID = {
  COLORS:     'dream-skin:colors',
  GLASS:      'dream-skin:glass',
  CUSTOM_CSS: 'dream-skin:custom-css',
  SCROLLBAR:  'dream-skin:scrollbar',
} as const;

/**
 * 格式化图片资源 URL：
 * 1. 网络图片 (http/https)、Data URI、Blob 及已包含协议的 URL 直接使用
 * 2. 磁盘本地绝对路径 (file:// 或 /Users/...) 转换为宿主特许的跨域安全协议 URL：
 *    `berrytrace-plugin://local-file/Users/...`
 *    优点：绕过 Chromium `Not allowed to load local resource` 阻断，跨所有渲染子窗口及 `<img>` 标签 100% 成功加载！
 */
export function formatPluginResourceUrl(imagePath?: string): string {
  if (!imagePath) return '';
  let trimmed = imagePath.trim().replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

  if (/^(https?|data|berrytrace-plugin|blob):/i.test(trimmed)) {
    return trimmed;
  }

  // 处理 file:// 协议或绝对路径 -> 转为 berrytrace-plugin://local-file/
  if (trimmed.startsWith('file://')) {
    trimmed = trimmed.replace(/^file:\/\//, '');
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  const result = `berrytrace-plugin://local-file/${cleanPath}`;
  console.log(`🎨 [DreamSkin:ResourceUrl] 格式化资源 URL: [${imagePath}] -> [${result}]`);
  return result;
}

/**
 * 异步解析预览图 URL：
 * 如果是 data: / http: / https: / blob: 直接返回；
 * 如果是 file:// 或 berrytrace-plugin://local-file/ 或磁盘路径，通过 sdk.filesystem.readFile 读取为 Data URI 供 HTML <img> 渲染。
 */
export async function resolvePreviewDataUrl(sdk: any, imageUri?: string): Promise<string> {
  if (!imageUri) return '';
  const trimmed = imageUri.trim().replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

  if (/^(https?|data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const fs = sdk?.filesystem || (typeof window !== 'undefined' && (window as any).berrytracePluginSdk?.filesystem);
    if (!fs?.readFile) return trimmed;

    let cleanPath = trimmed;
    if (cleanPath.startsWith('berrytrace-plugin://local-file/')) {
      cleanPath = '/' + cleanPath.replace(/^berrytrace-plugin:\/\/local-file\//, '');
    } else if (cleanPath.startsWith('file://')) {
      cleanPath = cleanPath.replace(/^file:\/\//, '');
    }

    // Windows 驱动器盘符修正: e.g. /C:/Users/... -> C:/Users/...
    if (/^\/[a-zA-Z]:/.test(cleanPath)) {
      cleanPath = cleanPath.substring(1);
    }

    try {
      cleanPath = decodeURIComponent(cleanPath);
    } catch {}

    console.log(`🎨 [DreamSkin:Preview] 尝试从磁盘读取预览图 Data URI: [${cleanPath}]`);
    const rawBase64 = await fs.readFile(cleanPath, 'base64');
    if (rawBase64) {
      const ext = cleanPath.split('.').pop()?.toLowerCase() || 'png';
      const mime = ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = `data:${mime};base64,${rawBase64}`;
      console.log(`🎨 [DreamSkin:Preview] ✅ 成功将磁盘图 [${cleanPath}] 转换 Data URI (长度 ${rawBase64.length})`);
      return dataUrl;
    }
  } catch (err) {
    console.warn(`⚠️ [DreamSkin:Preview] 预览图 Base64 读取失败 (输入路径: ${imageUri}):`, err);
  }

  return trimmed;
}

/**
 * 获取物理皮肤文件根目录 ~/.berrytrace/skin
 */
export async function getSkinRootDir(sdk: any): Promise<string> {
  const fs = sdk?.filesystem || (typeof window !== 'undefined' && (window as any).berrytracePluginSdk?.filesystem);
  if (!fs?.getSafePath) return '';
  try {
    return await fs.getSafePath('skin');
  } catch {
    try {
      return await fs.getSafePath('skins');
    } catch {
      try {
        const home = await fs.getSafePath('berrytraceHome');
        return `${home}/skin`;
      } catch {
        return '';
      }
    }
  }
}

/**
 * 将 Base64 或大体积图片写入系统安全目录 (userData/wallpapers)，
 * 并返回精简的 berrytrace-plugin://local-file 协议路径，彻底解决 5MB localStorage 配额爆满与沙箱阻断问题。
 */
export async function saveWallpaperToDisk(
  sdk: any,
  themeId: string,
  base64Data?: string
): Promise<string> {
  if (!base64Data) return '';

  // 物理文件路径或 berrytrace-plugin:// 协议 URL 直接格式化返回，切勿重复落盘
  if (!base64Data.startsWith('data:image')) {
    return formatPluginResourceUrl(base64Data);
  }

  try {
    const fs = sdk?.filesystem;
    if (!fs) {
      console.warn('⚠️ [DreamSkin:SaveWallpaper] 宿主未包含 filesystem 模块，降级保留原 Base64');
      return base64Data;
    }

    const skinRootDir = await getSkinRootDir(sdk);
    if (!skinRootDir) return base64Data;

    const wallpaperDir = `${skinRootDir}/wallpapers`;
    await fs.mkdir(wallpaperDir).catch(() => {});

    // 从 base64 提取拓展名与纯数据
    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return base64Data;

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const rawContent = match[2];
    const filePath = `${wallpaperDir}/${themeId}.${ext}`;

    // 覆盖写入物理磁盘目录 (~/.berrytrace/skin/wallpapers/)
    await fs.writeFile(filePath, rawContent);
    const protocolUrl = formatPluginResourceUrl(filePath);
    console.log(`🎨 [DreamSkin:SaveWallpaper] ✅ 成功将 Base64 壁纸保存至物理皮肤路径: ${filePath} -> 协议 URL: ${protocolUrl}`);

    return protocolUrl;
  } catch (err) {
    console.error('🚨 [DreamSkin:SaveWallpaper] 磁盘落盘保存失败:', err);
    return base64Data;
  }
}

function hexToRgbTriple(colorStr: string | undefined): string | null {
  if (!colorStr) return null;
  const str = colorStr.trim();
  const match = str.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (match) {
    let hex = match[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((x) => x + x).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
  }
  return null;
}

/**
 * 把 `#rgb` / `#rrggbb` / `#rrggbbaa` / `rgb()` / `rgba()` 解析成 `[r, g, b]`。
 * 认不出来返回 `null`（调用方必须自己兜底，别当成黑色）。
 */
export function parseColorToRgb(colorStr: string | undefined | null): [number, number, number] | null {
  const triple = hexToRgbTriple(colorStr || undefined);
  if (triple) {
    const [r, g, b] = triple.split(' ').map(Number);
    return [r, g, b];
  }
  const m = String(colorStr || '').match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

/** WCAG 相对亮度，0（黑）~ 1（白）。 */
export function relativeLuminance(rgb: [number, number, number]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

/**
 * 从皮肤**自己的配色**推它到底是明还是暗，认不出来返回 `null`。
 *
 * 判据是「文字比底色亮 ⇒ 这是一套暗色配色」—— 不设亮度阈值。
 * 阈值要拍脑袋、会随皮肤风格漂；而明暗这件事的定义本来就是文字和底色的
 * 相对关系，直接量它零猜测，也正好是我们要保住的那个性质（可读性）。
 *
 * 为什么需要它：`theme.json` 的 `appearance` 允许写 `"auto"`，意思是
 * 「明暗交给宿主定」。但一套 `text: #f0f0ef` / `background: #141313` 的配色
 * 只在深色下成立，宿主停在浅色档时整套色就是错配的。`auto` 说的是作者没声明，
 * 不是「这套色两边都能用」。
 */
export function inferAppearanceFromColors(
  colors: DreamSkinColors | undefined | null,
): 'light' | 'dark' | null {
  if (!colors) return null;
  const text = parseColorToRgb(colors.text);
  const base = parseColorToRgb(colors.background) || parseColorToRgb(colors.panel);
  if (!text || !base) return null;
  const lText = relativeLuminance(text);
  const lBase = relativeLuminance(base);
  // 两者几乎一样亮时说明这套色自己就是错的，别替作者猜。
  if (Math.abs(lText - lBase) < 0.01) return null;
  return lText > lBase ? 'dark' : 'light';
}

/**
 * 把任意颜色写法拆成「**纯 RGB 三通道** + **alpha**」两半。
 *
 * 🔴 这是本适配器的核心归一，不是工具函数。理由（0907 实测）：
 *
 * · **上游 DreamSkin 自己就是这么分的**：`macos/assets/dream-skin.css:7,17`
 *   同时维护 `--ds-panel: #191c22`（实色）与 `--ds-panel-rgb: 25 28 34`（三通道），
 *   半透明一律在**用的地方**合成 `rgb(var(--ds-panel-rgb) / .56)`。
 *   官方预设的 `colors.panel` 也是**不透明实色 hex**（`#171513`），只有 `line` 用 rgba。
 * · **宿主 BerryTrace 也是这么分的**：`src/styles/palettes/berry.css:53`
 *   `--card: rgb(var(--bg-surface-2-rgb) / var(--surface-alpha-2))`。
 *
 * 两边同构。以前这里把皮肤的颜色**整体**（含 alpha）塞进 `--card` / `--popover`，
 * 等于把上游刻意分开的两半又粘死；而宿主的 Tailwind alphaToken 是**乘法**语义
 * （`tailwind.config.js:27`：token 自身 alpha × 修饰符）⇒ 乘了两次。
 * 〔实测，李博 Mac，皮肤 liam-girl-zangfu-qiriyou 的 panel 写作 rgba(100,100,100,0.5)〕
 * 输入框（`bg-card` 加斜杠 40 的 dark 变体）最终 alpha **0.5 × 0.4 = 0.2008**，
 * 而宿主给这一层的设计值是 0.72 —— 字压在壁纸上读不出来。
 *
 * 失效条件：宿主不再用 `--bg-surface-N-rgb` + `--surface-alpha-N` 这对钩子时，删掉本函数。
 */
export function splitColorChannels(
  colorStr: string | undefined,
): { rgb: string; alpha: number } | null {
  if (!colorStr) return null;
  const str = colorStr.trim();

  const hexMatch = str.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((x) => x + x).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { rgb: `${r} ${g} ${b}`, alpha };
  }

  // rgb() / rgba() / 空格分隔与斜杠分隔的现代写法都接住
  const fnMatch = str.match(/^rgba?\(\s*([^)]+)\)$/i);
  if (fnMatch) {
    const parts = fnMatch[1].split(/[,/]/).map((x) => x.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const [r, g, b] = parts.slice(0, 3).map((x) => Math.round(parseFloat(x)));
      if ([r, g, b].some((n) => Number.isNaN(n))) return null;
      let alpha = 1;
      if (parts.length >= 4) {
        const raw = parts[3];
        const n = parseFloat(raw);
        if (!Number.isNaN(n)) alpha = raw.endsWith('%') ? n / 100 : n;
      }
      return { rgb: `${r} ${g} ${b}`, alpha };
    }
  }

  return null;
}

/**
 * 把皮肤给的**一个**面板色，拉成宿主要的**三档**色相通道。
 *
 * 🔴 为什么必须拉：宿主的四层表面（`--bg-surface-0..3-rgb`）是靠**色相本身**
 * 分层的，alpha 只是壁纸下的额外一层。三档写成同一个值时，只要 alpha 也一样
 * （见 `surfaceAlphas` 那条：不透明皮肤下三档 alpha 恒为 1），
 * `--muted` / `--card` / `--popover` 就**逐字节相同** ——
 * 李博 0910 报的「只剩余 2 种颜色，换什么皮肤都一样」就是这个。
 *
 * 比例取自宿主 `src/styles/palettes/mono.css` 自己的梯子（以 surface-2 为基准）：
 *   浅色 245 / 235 / 255 / 255 ⇒ s1 = 0.922×s2，s3 = 1.0×s2（浅色档卡片已到顶，浮层不再抬）
 *   暗色  26 /  32 /  38 /  44 ⇒ s1 = 0.842×s2，s3 = 1.158×s2
 * 即「s1 比卡片沉一档、s3 比卡片浮一档」，与宿主的设计同构。
 *
 * ⚠️ **不返回 surface-0**：宿主的可读性地板（`src/index.css` 的
 * `--surface-floor-rgb`）以它为基准，皮肤写了就等于把地板拆了。
 *
 * 失效条件：皮肤契约能一次给出三档面板色时，删掉这个推导，改成直接读。
 */
export function surfaceLadder(rgb: string): { s1: string; s2: string; s3: string } {
  const ch = rgb.split(/\s+/).map((x) => Number(x));
  if (ch.length !== 3 || ch.some((n) => !Number.isFinite(n))) return { s1: rgb, s2: rgb, s3: rgb };
  const 夹 = (x: number) => String(Math.max(0, Math.min(255, Math.round(x))));
  /* 明暗**由面板色自己说了算**，不从外面传：这个函数在两处被调用，
   * 一处（transformDreamSkinToBerryTrace）根本拿不到明暗档，
   * 传参就会变成「有的地方对、有的地方按浅色算」。
   * 判据取感知亮度，阈值 128 —— 深面板要「浮层更亮」，浅面板要「浮层不再抬」。 */
  const 亮度 = (0.299 * ch[0] + 0.587 * ch[1] + 0.114 * ch[2]);
  const isDark = 亮度 < 128;
  const k1 = isDark ? 0.842 : 0.922;
  const k3 = isDark ? 1.158 : 1.0;
  return {
    s1: ch.map((n) => 夹(n * k1)).join(' '),
    s2: ch.map((n) => 夹(n)).join(' '),
    s3: ch.map((n) => 夹(n * k3)).join(' '),
  };
}

/** alpha 下限：皮肤想更透可以，但不许透到字读不出来。 */
export function clampSurfaceAlpha(alpha: number, floor: number): number {
  if (!Number.isFinite(alpha)) return floor;
  return Math.min(1, Math.max(floor, alpha));
}

function hexToRgbaStr(colorStr: string | undefined, alpha: number, fallback: string): string {
  if (!colorStr) return fallback;
  const str = colorStr.trim();
  const match = str.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (match) {
    let hex = match[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((x) => x + x).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) {
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (str.startsWith('rgb')) {
    return str;
  }
  return fallback;
}

/**
 * 核心转换：DreamSkin Config → BerryTraceAppliedTheme
 */
export function transformDreamSkinToBerryTrace(
  config: DreamSkinThemeConfig,
  imageUri?: string,
  customCss?: string
): BerryTraceAppliedTheme {
  const cssVariables: Record<string, string> = {};
  let brandColor: string | undefined;

  const focusX = typeof config.art?.focusX === "number" ? config.art.focusX * 100 : 50;
  const focusY = typeof config.art?.focusY === "number" ? config.art.focusY * 100 : 50;
  const wallpaperUrl = formatPluginResourceUrl(imageUri || config.image);
  const wallpaperBlur = config.art?.blur || "0px";

  if (config.fontFamily) {
    cssVariables["--font-sans"] = config.fontFamily;
  }

  const c = config.colors || {};
  if (c.background) {
    cssVariables["--background"]                = c.background;
    cssVariables["--bg-page"]                   = c.background;
    /* 侧栏色相走**页面色**，不走 panel。
     *
     * 〔0910 李博实测，第二轮：「左边侧边栏，还是没有好」〕上一轮把三层表面拉开之后，
     * 侧栏仍然是宿主基座的冷灰 —— 因为宿主的 `--sidebar` 取的是
     * `--bg-surface-0-rgb` 的色相，而**那一条适配器按边界不许写**
     * （宿主 `--surface-floor-rgb` 以它为基准，是可读性地板的最后一道）。
     * ⇒ 宿主 0910 给侧栏开了一条独立通道 `--bg-sidebar-rgb`
     *   （`src/styles/palettes/*.css`，默认值就是 `var(--bg-surface-0-rgb)`），
     *   皮肤写它，地板照旧钉在 surface-0，两件事互不干涉。
     *
     * 🔴 用 `c.background` 而不是 panel 的 s1：宿主 `mono.css` 那条注释钉着李博
     * 08-25 的决定 ——「侧栏与主区同源，**独立于 --muted**（输入框底等），两处可分别调」。
     * 拿 s1 去染侧栏就正好撞上 `--muted`，等于把他那条决定推翻了。
     * 页面色才是「主区」在皮肤里的对应物。
     *
     * 失效条件：宿主不再定义 `--bg-sidebar-rgb`（palettes/*.css 里 grep 得到）时删掉。 */
    const 页面 = splitColorChannels(c.background);
    if (页面) cssVariables["--bg-sidebar-rgb"] = 页面.rgb;
    cssVariables["--ds-theme-color-background"] = c.background;
  }
  if (c.panel) {
    /* 🔴 **只写色相通道，不写 `--card` / `--popover` / `--sidebar-background`。**
     *
     * 〔0909 实测，李博 Mac，一整天的返工都出在这条上〕宿主的语义 token 是
     * 「色相通道 × alpha」合成出来的（`palettes/berry.css:53`
     * `--card: rgb(var(--bg-surface-2-rgb) / var(--surface-alpha-2))`）。
     * 适配器直接改语义 token ＝ **把宿主用来保证可读性的那层公式整个替换掉**，
     * 于是宿主每加一道防线，皮肤就能从另一个变量把它掀翻，变成打地鼠：
     *   · 皮肤把 alpha 烤进 `--card` ⇒ 乘法语义下双乘 ⇒ 宿主加地板；
     *   · 皮肤把 `--bg-surface-N-rgb` 换成面板色 ⇒ **地板自己被染成中灰** ⇒ 宿主再加 `--surface-floor-rgb`；
     *   · 皮肤把 `--accent` 换成 panelAlt ⇒ 选中态消失 ⇒ 再改皮肤。
     * 李博原话：「同一个皮肤 zip 细节差别很多…到底是哪里出现问题，结构，还是架构？」
     * —— 是架构：**方向盘交出去了**。上游 Codex 从不让皮肤写自己的语义 token。
     *
     * 边界（本文件唯一的一条）：**适配器只写色相通道与文字/品牌色，
     * 表面的 alpha、scrim、层级一律由宿主推导。**
     * ⚠️ 尤其不许写 `--bg-surface-0-rgb` —— 宿主的可读性地板
     * （`src/index.css` 的 `--surface-floor-rgb`）以它为基准，写了就等于把地板拆了。
     *
     * 失效条件：宿主不再用「通道 × alpha」合成语义 token 时，这条边界可以重议。 */
    const 面板 = splitColorChannels(c.panel);
    if (面板) {
      /* 🔴 三档**不许写成同一个值**。写一样的话，只要 alpha 也一样
       * （不透明皮肤下必然如此，见 surfaceAlphas），
       * --muted / --card / --popover 会逐字节相同 ⇒ 界面上只剩两种底色。
       * 〔0910 李博实测报的就是这个〕理由与比例见 surfaceLadder()。 */
      const 梯 = surfaceLadder(面板.rgb);
      cssVariables["--bg-surface-1-rgb"] = 梯.s1;
      cssVariables["--bg-surface-2-rgb"] = 梯.s2;
      cssVariables["--bg-surface-3-rgb"] = 梯.s3;
    }
    cssVariables["--ds-theme-color-panel"]      = c.panel;
  }
  if (c.panelAlt) {
    /* 同上：只写通道。`--muted` 由宿主用 `--bg-surface-1-rgb × --surface-alpha-1` 推导；
     * 选中/hover 态走 `--bg-accent-rgb`（宿主 `--accent` 的通道形式），
     * 这样选中块永远比承载面「抬起来」，不会像 0909 那样和侧栏底色撞成同一个值。 */
    const 次面板 = splitColorChannels(c.panelAlt);
    if (次面板) cssVariables["--bg-accent-rgb"] = 次面板.rgb;
    /* 🔴 **不要在这里写 `--accent`。**〔0909 实测，李博 Mac，两个应用并排量的〕
     *
     * 宿主的 `--accent` 不是「品牌强调色」，它是**导航选中态/hover 的承载面**：
     * `palettes/berry.css:63,200` 写的是
     * `--accent: rgb(var(--bg-accent-rgb) / var(--surface-alpha-1))`，
     * 侧栏选中项（`layouts/components/SidebarLayout.tsx:671` 的 `bg-accent`）吃的就是它。
     * 把它整体换成 `c.panelAlt`（一块**面板**色）有两个后果：
     *   ① 选中色变成一个与宿主调色板毫无关系的颜色 —— 李博报的「侧栏自动化选中色不对」；
     *   ② panelAlt 自带 alpha 时（社区皮肤常态，本例是 `rgba(95,95,95,0.5)`），
     *      选中块**既颜色不对又半透** ——〔实测〕他机器上 `--accent` 就是 `rgba(95,95,95,0.5)`。
     *
     * **上游 Codex 也不这么干**：〔0909 用 CDP 量他 Mac 上装着**同一张皮肤**的 Codex〕
     * 它侧栏选中项是 `rgba(102, 173, 243, 0.12)` —— 自己的品牌蓝 ghost，
     * **完全没被皮肤的 panelAlt 接管**。皮肤该管的是面板，不是选中态。
     *
     * 皮肤真要改强调色，走 `c.accent`（下面那支已写进 `--color-brand` / `--primary` / `--ring`），
     * 那几个不会撞上导航选中态。
     *
     * 失效条件：宿主把 nav 选中态从 `bg-accent` 换成一个专属 token
     * （与 `--accent` 解耦）之后，皮肤可以重新接管 `--accent`。
     */
    cssVariables["--ds-theme-color-panel-alt"]  = c.panelAlt;
  }
  if (c.accent) {
    brandColor = c.accent;
    cssVariables["--color-brand"]               = c.accent;
    cssVariables["--primary"]                   = c.accent;
    cssVariables["--ring"]                      = c.accent;
    cssVariables["--ds-theme-color-accent"]    = c.accent;
    const rgbTriple = hexToRgbTriple(c.accent);
    if (rgbTriple) {
      cssVariables["--brand-rgb"] = rgbTriple;
    }
  }
  /* accentAlt / secondary / highlight 只留在皮肤自己的 --ds-* 命名空间里。
   * 它们对应的宿主 token（--accent-alt / --secondary / --highlight）都是**表面**，
   * 由宿主从通道推导；皮肤覆盖它们就会绕过 alpha 与地板（同 c.panel 那条注释）。 */
  if (c.accentAlt) {
    cssVariables["--ds-theme-color-accent-alt"] = c.accentAlt;
  }
  if (c.secondary) {
    cssVariables["--ds-theme-color-secondary"]  = c.secondary;
  }
  if (c.highlight) {
    cssVariables["--ds-theme-color-highlight"]  = c.highlight;
  }
  if (c.text) {
    cssVariables["--foreground"]                = c.text;
    cssVariables["--card-foreground"]           = c.text;
    cssVariables["--popover-foreground"]        = c.text;
    cssVariables["--ds-theme-color-text"]      = c.text;
  }
  if (c.muted) {
    cssVariables["--muted-foreground"]          = c.muted;
    cssVariables["--ds-theme-color-muted"]      = c.muted;
  }
  if (c.line) {
    cssVariables["--border"]                    = c.line;
    cssVariables["--ds-theme-color-line"]       = c.line;
  }

  return {
    themeId:         config.id,
    name:            config.name || config.id,
    appearance:      config.appearance || "auto",
    cssVariables,
    brandColor,
    wallpaperUrl,
    wallpaperFocusX: focusX,
    wallpaperFocusY: focusY,
    wallpaperBlur,
    customCss,
    isDynamic:       !!config.dynamic,
  };
}

/**
 * 将 BerryTraceAppliedTheme 通过 sdk.ui 写入宿主
 */
export async function applySkinViaSDK(
  sdkUi: SdkUi,
  applied: BerryTraceAppliedTheme,
  sdkPlugin?: SdkPlugin
): Promise<void> {
  const { cssVariables, appearance, brandColor, wallpaperUrl, wallpaperFocusX, wallpaperFocusY, wallpaperBlur, customCss, isDynamic } = applied;

  console.log('🎨 [DreamSkin:Adapter] ========= 开始应用主题 =========');
  console.log(`🎨 [DreamSkin:Adapter] 主题ID: ${applied.themeId}, 名称: ${applied.name}`);

  // ── 0. 原子预清理 (Pre-Wipe Reset)：100% 抹除上一个皮肤的残留 CSS / 变量，防止污染 ──
  const root = document.documentElement;
  const ALL_THEME_VARS = [
    "--font-sans",
    "--background",
    "--bg-page",
    "--card",
    "--popover",
    "--muted",
    "--accent",
    "--accent-alt",
    "--primary",
    "--ring",
    "--secondary",
    "--highlight",
    "--foreground",
    "--card-foreground",
    "--popover-foreground",
    "--muted-foreground",
    "--border",
    "--color-brand",
    "--brand-rgb",
    "--sidebar-background",
    "--surface-blur",
    "--berrytrace-bg-blur",
    "--berrytrace-bg-image",
    "--berrytrace-bg-position",
    "--berrytrace-bg-opacity",
    "--ds-theme-color-background",
    "--ds-theme-color-panel",
    "--ds-theme-color-panel-alt",
    "--ds-theme-color-accent",
    "--ds-theme-color-accent-alt",
    "--ds-theme-color-secondary",
    "--ds-theme-color-highlight",
    "--ds-theme-color-text",
    "--ds-theme-color-muted",
    "--ds-theme-color-line"
  ];
  ALL_THEME_VARS.forEach((v) => root.style.removeProperty(v));
  sdkUi.clearPersistedStyle(SKIN_STYLE_ID.CUSTOM_CSS);

  // ── 0.5. 同步宿主明暗外观 (dark / light / system) ─────────────────────────────────
  if (sdkUi.setTheme) {
    sdkUi.setTheme(appearance === "auto" ? "system" : appearance);
  } else if (appearance === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    if (sdkUi.setAppearance) sdkUi.setAppearance("dark");
  } else if (appearance === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    if (sdkUi.setAppearance) sdkUi.setAppearance("light");
  } else if (appearance === "auto") {
    if (sdkUi.clearAppearance) sdkUi.clearAppearance();
  }

  // ── 1. 色彩 Token CSS ──────────────────────────────────────────────────────
  let colorsCss = `:root, html {\n`;
  for (const [k, v] of Object.entries(cssVariables)) {
    colorsCss += `  ${k}: ${v};\n`;
  }
  colorsCss += `}\n`;
  sdkUi.persistStyle(SKIN_STYLE_ID.COLORS, colorsCss);
  console.log('🎨 [DreamSkin:Adapter] 写入色彩与字体 CSS Token:\n' + colorsCss);

  // 关键补充：同步在 DOM 根节点 document.documentElement 上直接设置 CSS 变量，解开行内 style 特异性问题，让当前页面无需离开即可秒级生效！
  for (const [k, v] of Object.entries(cssVariables)) {
    root.style.setProperty(k, v);
  }

  // ── 2. 品牌色 setToken ─────────────────────────────────────────────────────
  if (brandColor) {
    sdkUi.setToken("--color-brand", brandColor, true);
    root.style.setProperty("--color-brand", brandColor);
    const rgbTriple = hexToRgbTriple(brandColor);
    if (rgbTriple) {
      root.style.setProperty("--brand-rgb", rgbTriple);
    }
    console.log(`🎨 [DreamSkin:Adapter] 设置品牌色 --color-brand: ${brandColor}`);
  }

  // ── 3. 主题原生 theme.css 自定义样式 ──────────────────────────────────────
  if (customCss) {
    sdkUi.persistStyle(SKIN_STYLE_ID.CUSTOM_CSS, customCss);
    console.log('🎨 [DreamSkin:Adapter] ✅ 成功持久化写入主题原生 theme.css 规则');
  } else {
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.CUSTOM_CSS);
  }

  // ── 4. 壁纸处理 ─────────────────────────────────────────────────────────────
  if (wallpaperUrl) {
    // 强制清洗 URL
    const cleanUrl = wallpaperUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    const posX = wallpaperFocusX ?? 50;
    const posY = wallpaperFocusY ?? 50;

    const isBase64Data = cleanUrl.trim().startsWith('data:');
    if (isBase64Data) {
      console.warn('⚠️ [DreamSkin:Adapter] 拒绝发送 Base64 图片数据！壁纸必须使用标准的 URL 地址 (如 http://, https://, file://, berrytrace-plugin://)，禁止嵌入巨型 Base64 数据！');
    } else {
      console.log(`🎨 [DreamSkin:Adapter] 🚀 正在调用 sdkUi.setWallpaper(cleanUrl)...`);
      console.log(`🎨 [DreamSkin:Adapter] 清洗后 cleanUrl: ${cleanUrl.slice(0, 80)}...`);

      try {
        sdkUi.setWallpaper(cleanUrl, {
          focusX:  posX,
          focusY:  posY,
          opacity: 0.85,
          blur:    wallpaperBlur || "0px",
        });
        // 同步直接更新根节点壁纸行内属性与 class 状态
        root.style.setProperty('--berrytrace-bg-image', `url('${cleanUrl}')`);
        root.style.setProperty('--berrytrace-bg-position', `${posX}% ${posY}%`);
        root.style.setProperty('--berrytrace-bg-blur', wallpaperBlur || "0px");
        root.classList.add('has-wallpaper');
        console.log('🎨 [DreamSkin:Adapter] ✅ sdkUi.setWallpaper 执行成功');
      } catch (wErr) {
        console.error('🚨 [DreamSkin:Adapter] sdkUi.setWallpaper 执行抛出异常:', wErr);
      }
    }
  } else {
    console.log('🎨 [DreamSkin:Adapter] ⚠️ 当前主题无壁纸，正在清除壁纸...');
    sdkUi.clearWallpaper();
    root.style.removeProperty('--berrytrace-bg-image');
    root.style.removeProperty('--berrytrace-bg-position');
    root.style.removeProperty('--berrytrace-bg-blur');
    root.classList.remove('has-wallpaper');
  }

  // ── 5. 顶级通透玻璃拟态 (结合自定义主题色彩协同) ──────────────────────────
  // 优先获取宿主系统的实际 Dark/Light 模式，避免强行把系统的 dark 冲掉
  const currentHostMode = sdkUi.getTheme ? sdkUi.getTheme() : (document.documentElement.classList.contains("dark") ? "dark" : "light");
  /*
   * 作者没声明明暗（`auto`）时，先问**皮肤自己的配色**，问不出来才问宿主。
   *
   * 只问宿主是不够的：`暮色温柔`/`明日香 二号机` 的 appearance 都是 `auto`，
   * 而配色是纯暗的（text #f0f0ef / background #141313）。宿主停在浅色档时
   * 下面这些兜底色和阴影会整套取反，且是注入那一刻算死的 —— 宿主之后再切
   * 明暗也不会重算。
   */
  const inferred =
    appearance === "auto" || !appearance
      ? inferAppearanceFromColors({
          text: cssVariables["--foreground"],
          background: cssVariables["--background"],
          panel: cssVariables["--ds-theme-color-panel"],
        })
      : null;
  const effectiveMode = inferred || currentHostMode;
  const isDark = appearance === "dark" || (appearance !== "light" && effectiveMode === "dark");

  const borderColor = applied.cssVariables["--border"] || (isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)");

  const userBg = applied.cssVariables["--background"];
  /* 皮肤的面板色现在只留在自己的命名空间里（不再覆盖宿主 --card），
   * 所以取色相要从这里读。读错的后果是回落到 background 色，
   * 表现为「换了皮肤但面板颜色没跟着变」，且零报错。 */
  const userCard = applied.cssVariables["--ds-theme-color-panel"];
  /* ⚠️ 这里原来还有 `hexToRgbaStr(userCard || userBg, 0.72, …)` 算出来的
   * `glassCard` / `glassSidebar` 两个常量，已删。它有两处静默失效：
   *   ① 传进去的 alpha（0.72 / 0.45）在皮肤写 rgba() 时被
   *      `if (str.startsWith('rgb')) return str;`（:374 那支）**整个丢弃** ——
   *      本仓给这两层设计的 alpha 从来没生效过；
   *   ② 算出来的是**含 alpha 的常量**，塞进 `--card` 之后被宿主的乘法语义再乘一次。
   * 现在一律走下面的 splitColorChannels 归一 + 表达式。 */

  /* ── 归一：把皮肤的面板色拆成「三通道 + alpha」喂给宿主的两个钩子 ──────────
   * 理由与实测数字见 splitColorChannels() 的函数头。
   *
   * 🔴 拆开之后**不要再写 `--card: <含 alpha 的常量>`**：那正是旧版的病根。
   * 这里写的是**表达式** `rgb(var(--bg-surface-2-rgb) / var(--surface-alpha-2))`，
   * 与宿主 `palettes/berry.css:53` 逐字同构 —— 即使宿主换了色板也不会脱节。
   *
   * 三个 floor 取宿主 `src/index.css` 壁纸段的设计值（0.55 / 0.72 / 0.88）。
   * 皮肤想更透可以（clamp 只抬不压是**错**的：那会让皮肤完全失效），
   * 所以 floor 取的是「宿主设计值」与「皮肤意图」里更能保住可读性的那个，
   * 且宿主侧还有第二道地板（index.css 的 Surface Opacity Floor）兜底。
   */
  /* 侧栏色相：走页面色（理由见 c.background 那段）。取不到就整条不写 ——
   * 宿主 `--bg-sidebar-rgb` 的默认值是 `var(--bg-surface-0-rgb)`，
   * 不写就自动回落到基座灰，也就是 0910 之前的样子。 */
  const 页面Split = splitColorChannels(userBg);
  const 侧栏通道 = 页面Split
    ? `\n  --bg-sidebar-rgb: ${页面Split.rgb} !important;`
    : '';

  const panelSplit = splitColorChannels(userCard || userBg);
  const surfaceRgb = panelSplit?.rgb ?? (isDark ? '20 20 28' : '255 255 255');
  const 梯 = surfaceLadder(surfaceRgb);
  const skinAlpha = panelSplit?.alpha ?? 1;

  /* 🔴 `skinAlpha === 1` 是「皮肤**没表态**」，不是「皮肤要求完全不透明」。
   *
   * 〔0910 实测，CDP 连李博 Mac 上运行中的应用〕他的皮肤 panel 是不透明 hex
   * （`#fbf9f3`）⇒ `skinAlpha = 1` ⇒ `clampSurfaceAlpha(1, floor) = min(1, max(floor,1)) = 1`
   * **三档一起变 1**。后果两条，他一眼就看见了：
   *   · 三档 alpha 相同 + 当时三档色相也相同 ⇒ --muted/--card/--popover 逐字节相同，
   *     界面上「只剩余 2 种颜色，换什么皮肤都一样」（他的原话）；
   *   · 壁纸再也透不进任何面板 —— 有壁纸却没有毛玻璃。
   * 而**绝大多数皮肤的 panel 都是不透明 hex**，所以这不是个别皮肤的问题。
   *
   * ⇒ 皮肤给了 alpha（<1）才算表态，按它来（floor 兜住可读性）；
   *   没表态就用宿主壁纸段的设计值，也就是这几个 floor 本身。
   *
   * 失效条件：皮肤契约能分别声明三档表面透明度时，这条推导换成直接读。 */
  const 有透明意图 = Number.isFinite(skinAlpha) && skinAlpha < 1;
  const 定档 = (floor: number) => (有透明意图 ? clampSurfaceAlpha(skinAlpha, floor) : floor);
  const alphaSidebar = 定档(isDark ? 0.45 : 0.58);
  const alphaCard = 定档(isDark ? 0.72 : 0.78);
  const alphaFloat = 定档(isDark ? 0.88 : 0.9);

  /*
   * 浮层那一条（下面第 5 条）的底色与字色**必须同源**。
   *
   * 🔴 它曾经把底色写成 isDark ? 深常量 : 白常量，而字色仍由
   * --popover-foreground（= 皮肤的 colors.text）决定。两者一脱钩就会错配：
   * 实测「暮色温柔」在浅色档下是 rgba(255,255,255,.95) 底 + #f0f0ef 字，
   * 对比度 1.06:1 —— 字等于看不见，且换任何壁纸都不变（常量与皮肤无关）。
   * 上游 Codex 侧遇到过同一个 bug（issue #233），修法同样是让两者成对指向皮肤变量。
   *
   * 用 var() 而不在注入时算死，还顺带免疫另一个坑：这段 CSS 与色彩变量是两次
   * 独立注入，切皮肤时可能残留上一个皮肤的值 —— 走变量就永远跟当前皮肤实时一致。
   *
   * 失效条件：宿主不再用 --popover / --popover-foreground 这对 token 时，删掉第 5 条。
   */
  const glassCss = `
/* 宿主全局背景声明：主工作区透明透出底层壁纸，保留卡片半透明度 */
html.has-wallpaper {
  /* 壁纸层自己的模糊仍由皮肤说了算 */
  --berrytrace-bg-blur: ${wallpaperBlur || '0px'} !important;
  --background: transparent !important;
  --bg-page: transparent !important;

  /* 色相：纯三通道，不含 alpha（上游 --ds-panel-rgb 的对应物） */
  --bg-surface-1-rgb: ${梯.s1} !important;
  --bg-surface-2-rgb: ${梯.s2} !important;
  --bg-surface-3-rgb: ${梯.s3} !important;
  /* 侧栏单独一条通道（宿主 0910 新开）。**仍然不写 --bg-surface-0-rgb** ——
   * 那是宿主可读性地板的基准，见 c.panel 那条边界。 */${侧栏通道}

  /* alpha：单独一档，由宿主在**用的地方**合成 */
  --surface-alpha-1: ${alphaSidebar} !important;
  --surface-alpha-2: ${alphaCard} !important;
  --surface-alpha-3: ${alphaFloat} !important;

  /* 🔴 这里**不再重写 --card / --muted / --popover / --sidebar**。
   * 宿主 palettes/*.css 本来就是用上面这几个通道 × alpha 合成它们的，
   * 皮肤再写一遍只会把宿主的公式换掉（理由见 c.panel 那条长注释）。
   * 上面给了通道与 alpha，宿主自会推导出全部四层。
   *
   * 上面那条 --bg-sidebar-rgb **不是这条规矩的例外** —— 它是**通道**不是语义 token，
   * 宿主那个 --sidebar 公式（rgb(通道 / alpha-1)）一个字没动。
   * 判据没变：**适配器只写色相通道，alpha / scrim / 层级由宿主推导。**
   * ⚠️ 本段在模板字符串里，是 CSS 注释不是 JS 注释 —— 不许出现反引号，会提前终止模板。 */
}

/* 1. 底座（工作区 / 页面根）清掉寄生灰层与模糊，让壁纸高清透出。
 *
 * 🔴 **不要把 .bg-card / .bg-muted / .bg-secondary / aside 加回这条**。
 * 〔0907 实测〕旧版把它们一起关了模糊，结果是：输入框最终 alpha 只有 0.20、
 * 背后又没有任何模糊，字直接糊在壁纸的人脸上。对照 ChatGPT 同一张皮肤，
 * 它的输入框是 blur(16px) + 0.86 —— **模糊是可读性的承载者，不是装饰**。
 * 上游自己也从不关这些，它靠 --ds-hero-scrim 渐变遮罩保可读性。
 *
 * 失效条件：宿主 index.css 的壁纸段不再给表面注入 backdrop-filter 时，本条可以删。 */
html.has-wallpaper main,
html.has-wallpaper .bg-background,
html.has-wallpaper [data-ds-part="page"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 2. 主工作区与页面根容器：100% 透明，完全透出 body 上的背景壁纸 */
html.has-wallpaper #root,
html.has-wallpaper main,
html.has-wallpaper .bg-background,
html.has-wallpaper .bg-page {
  background-color: transparent !important;
  background: transparent !important;
}

/* ── 到此为止：**适配器不再重画宿主的任何表面。** ────────────────────────────
 *
 * 这里原来还有三条规则（侧边栏本体 / 卡片面板输入框 / 弹出层对话框），
 * 一共 20 多条 !important，外加 [class*="bg-card/"]、[role="dialog"]、
 * [role="menu"] 这类通杀选择器 —— 它们直接改宿主元素的
 * background-color / border / box-shadow。〔0909 实测〕代价是：
 *   · 侧栏那条曾用 [class*="sidebar"] 通杀，**误伤 27 个纯排版容器**
 *     （Tailwind 任意值把 --sidebar-row-h 这类变量名带进了类名字串），
 *     还把导航选中态 bg-accent 一起按成面板色 ⇒ 选中块和侧栏同色，等于没有选中态；
 *   · 卡片那条把 alpha 与边框写死，宿主壁纸地板再怎么改都被它盖掉。
 *
 * 现在这些一律由**宿主**负责（src/index.css 的 Surface Opacity Floor：
 * Surface 1/2/3 各有地板，scrim 走皮肤动不到的 --surface-floor-rgb）。
 * 皮肤只提供色相通道与 alpha 意图，宿主保证「皮肤想多透都行，但不许透到读不出字」。
 *
 * 失效条件：宿主删掉 Surface Opacity Floor 那一段时，这些规则要重新讨论由谁承担。 */
`;
  if (wallpaperUrl) {
    sdkUi.persistStyle(SKIN_STYLE_ID.GLASS, glassCss);
    console.log('🎨 [DreamSkin:Adapter] ✅ 毛玻璃与主题色彩融合 CSS 已成功持久化写入');
  } else {
    console.log('🎨 [DreamSkin:Adapter] ⚠️ 当前主题无壁纸，正在清除壁纸...');
    sdkUi.clearWallpaper();
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.GLASS);
  }


  if (sdkPlugin) {
    await sdkPlugin.setStartupResident(!!isDynamic);
  }

  // 6. 广播事件与触发全局 Resize 重绘，通知 React 组件层即时刷新 UI
  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new CustomEvent('sdk:event:theme:change', { detail: appearance || 'dark' }));

  console.log('🎨 [DreamSkin:Adapter] ========= 主题应用流程完成 =========');
}

/**
 * 清空所有 DreamSkin 注入的 Skin CSS，100% 还原原生默认外观
 */
export async function clearSkinViaSDK(
  sdkUi: SdkUi,
  sdkPlugin?: SdkPlugin
): Promise<void> {
  console.log('🎨 [DreamSkin:Adapter] ========= 清空主题，恢复原生默认外观 =========');

  // 1. 优先使用全量清空接口，擦除全部 SkinLayer 持久化标签 (包括 __token__--color-brand)
  if (sdkUi.clearAllPersistedStyles) {
    sdkUi.clearAllPersistedStyles();
  } else {
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.COLORS);
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.GLASS);
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.CUSTOM_CSS);
    sdkUi.clearPersistedStyle(SKIN_STYLE_ID.SCROLLBAR);
    sdkUi.clearPersistedStyle('__token__--color-brand');
  }

  // 2. 清除壁纸及相关持久化 class 与变量
  sdkUi.clearWallpaper();

  // 3. 彻底擦除 DOM 根节点 document.documentElement 上的所有行内 CSS 变量与 style 属性
  const root = document.documentElement;
  root.removeAttribute('style');
  root.classList.remove('has-wallpaper');

  // 4. 清除外观覆盖，并还原宿主用户原本保存的主题模式 (dark / light / system)
  try {
    const savedAppTheme = (localStorage.getItem('app-theme') as 'light' | 'dark' | 'system') || 'system';
    if (sdkUi.setTheme) {
      sdkUi.setTheme(savedAppTheme);
    } else if (sdkUi.clearAppearance) {
      sdkUi.clearAppearance();
    }
    const isDark = savedAppTheme === 'dark' || (savedAppTheme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } catch {}

  if (sdkPlugin) {
    await sdkPlugin.setStartupResident(false);
  }

  // 5. 广播事件与触发全局 Resize 重绘，通知 React 组件层即时刷新 UI
  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new CustomEvent('sdk:event:theme:change', { detail: 'light' }));
}

/**
 * 动态退化方案：仅在当前窗口 DOM 节点注入主题变量（无宿主 SDK 支持时）
 */
export function injectThemeVariablesToDOM(applied: BerryTraceAppliedTheme): void {
  const root = document.documentElement;
  Object.entries(applied.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  if (applied.appearance === "dark") {
    root.classList.add("dark");
  } else if (applied.appearance === "light") {
    root.classList.remove("dark");
  }
}

/**
 * 动态退化方案：仅清空当前窗口 DOM 节点主题变量（无宿主 SDK 支持时）
 */
export function resetBerryTraceTheme(): void {
  const root = document.documentElement;
  const varsToClean = [
    "--font-sans",
    "--background",
    "--bg-page",
    "--card",
    "--popover",
    "--muted",
    "--accent",
    "--foreground",
    "--card-foreground",
    "--popover-foreground",
    "--muted-foreground",
    "--border",
    "--color-brand"
  ];
  varsToClean.forEach((v) => root.style.removeProperty(v));
  root.classList.remove("dark");
}

