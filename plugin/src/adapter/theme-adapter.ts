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
    cssVariables["--ds-theme-color-background"] = c.background;
  }
  if (c.panel) {
    cssVariables["--card"]                      = c.panel;
    cssVariables["--popover"]                   = c.panel;
    cssVariables["--sidebar-background"]        = c.panel;
    cssVariables["--ds-theme-color-panel"]      = c.panel;
  }
  if (c.panelAlt) {
    cssVariables["--muted"]                     = c.panelAlt;
    cssVariables["--accent"]                    = c.panelAlt;
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
  if (c.accentAlt) {
    cssVariables["--accent-alt"]                = c.accentAlt;
    cssVariables["--ds-theme-color-accent-alt"] = c.accentAlt;
  }
  if (c.secondary) {
    cssVariables["--secondary"]                 = c.secondary;
    cssVariables["--ds-theme-color-secondary"]  = c.secondary;
  }
  if (c.highlight) {
    cssVariables["--highlight"]                 = c.highlight;
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
          panel: cssVariables["--card"],
        })
      : null;
  const effectiveMode = inferred || currentHostMode;
  const isDark = appearance === "dark" || (appearance !== "light" && effectiveMode === "dark");

  const borderColor = applied.cssVariables["--border"] || (isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)");

  const userBg = applied.cssVariables["--background"];
  const userCard = applied.cssVariables["--card"];
  const defaultBg = isDark ? `rgba(12, 12, 18, 0)` : `rgba(243, 245, 246, 0)`;
  const defaultCard = isDark ? `rgba(20, 20, 28, 0.72)` : `rgba(255, 255, 255, 0.78)`;
  const defaultSidebar = isDark ? `rgba(12, 12, 18, 0.45)` : `rgba(255, 255, 255, 0.58)`;

  const glassCard = hexToRgbaStr(userCard || userBg, isDark ? 0.72 : 0.78, defaultCard);
  const glassSidebar = hexToRgbaStr(userCard || userBg, isDark ? 0.45 : 0.58, defaultSidebar);

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
  --surface-blur: ${wallpaperBlur || '0px'} !important;
  --berrytrace-bg-blur: ${wallpaperBlur || '0px'} !important;
  --background: transparent !important;
  --bg-page: transparent !important;
  --card: ${glassCard} !important;
  --sidebar: ${glassSidebar} !important;
  --sidebar-background: ${glassSidebar} !important;
  --muted: ${glassCard} !important;
}

/* 1. 彻底清除工作区与导航栏/侧边栏的 backdrop-filter 模糊与寄生灰层，保证背景高清通透 */
html.has-wallpaper main,
html.has-wallpaper aside,
html.has-wallpaper nav,
html.has-wallpaper [class*="sidebar"],
html.has-wallpaper .bg-sidebar,
html.has-wallpaper .bg-background,
html.has-wallpaper .bg-card,
html.has-wallpaper .bg-muted,
html.has-wallpaper .bg-secondary,
html.has-wallpaper [data-ds-part="sidebar"] {
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

/* 3. 导航栏与侧边栏 (aside / sidebar / nav / .bg-sidebar / [data-ds-part="sidebar"])：通透半透明与分隔线 */
html.has-wallpaper aside,
html.has-wallpaper nav,
html.has-wallpaper [class*="sidebar"],
html.has-wallpaper .bg-sidebar,
html.has-wallpaper [data-ds-part="sidebar"] {
  --sidebar-background: ${glassSidebar} !important;
  background-color: ${glassSidebar} !important;
  border-right: 1px solid ${borderColor} !important;
}

/* 4. Card 卡片/面板/输入框：半透明 + 1px 亮边框 + 浮光阴影 */
html.has-wallpaper .bg-card,
html.has-wallpaper .bg-muted,
html.has-wallpaper [data-ds-part="composer"],
html.has-wallpaper [data-ds-part="message"] {
  background-color: ${glassCard} !important;
  border: 1px solid ${borderColor} !important;
  box-shadow: ${isDark 
    ? "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)" 
    : "0 8px 24px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)"} !important;
}

/* 5. 弹出层/下拉菜单：底色与字色同源，都走宿主 token（理由见 TS 侧注释） */
html.has-wallpaper .bg-popover,
html.has-wallpaper [role="dialog"],
html.has-wallpaper [role="menu"] {
  background-color: var(--popover) !important;
  color: var(--popover-foreground) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
}
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

