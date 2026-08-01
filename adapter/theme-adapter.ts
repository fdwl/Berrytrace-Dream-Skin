/**
 * DreamSkin Protocol Adapter for BerryTrace
 * 
 * 将 Codex-Dream-Skin 的 theme.json (colors, art, appearance)
 * 无损映射转换为 BerryTrace 全局语义 CSS 变量与外观模式。
 */

export interface DreamSkinArt {
  focusX?: number; // 0.0 - 1.0 (default: 0.5)
  focusY?: number; // 0.0 - 1.0 (default: 0.5)
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
}

export interface BerryTraceAppliedTheme {
  themeId: string;
  name: string;
  appearance: "light" | "dark" | "auto";
  cssVariables: Record<string, string>;
}

/**
 * 核心转换逻辑：DreamSkin Config -> BerryTrace CSS Variables
 */
export function transformDreamSkinToBerryTrace(
  config: DreamSkinThemeConfig,
  imageUri?: string
): BerryTraceAppliedTheme {
  const cssVariables: Record<string, string> = {};

  // 1. 背景图片与高斯/焦点控制
  if (imageUri) {
    cssVariables["--berrytrace-custom-bg"] = `url("${imageUri}")`;
    const focusX = typeof config.art?.focusX === "number" ? config.art.focusX * 100 : 50;
    const focusY = typeof config.art?.focusY === "number" ? config.art.focusY * 100 : 50;
    cssVariables["--berrytrace-bg-position"] = `${focusX}% ${focusY}%`;
  }

  // 2. 色彩 Token 批量映射 (严格契合 BerryTrace 设计系统规则)
  const colors = config.colors || {};
  if (colors.background) cssVariables["--bg-background"] = colors.background;
  if (colors.panel) cssVariables["--bg-card"] = colors.panel;
  if (colors.panelAlt) cssVariables["--bg-muted"] = colors.panelAlt;
  if (colors.accent) cssVariables["--brand-primary"] = colors.accent;
  if (colors.text) cssVariables["--text-foreground"] = colors.text;
  if (colors.muted) cssVariables["--text-muted-foreground"] = colors.muted;
  if (colors.line) cssVariables["--border-border"] = colors.line;

  return {
    themeId: config.id,
    name: config.name || config.id,
    appearance: config.appearance || "auto",
    cssVariables,
  };
}

/**
 * 将 BerryTraceAppliedTheme 挂载到渲染进程的 document.documentElement 根节点
 */
export function injectThemeVariablesToDOM(applied: BerryTraceAppliedTheme): void {
  const root = document.documentElement;

  // 批量应用 CSS 变量
  Object.entries(applied.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 处理 Dark / Light 外观模式
  if (applied.appearance === "dark") {
    root.classList.add("dark");
  } else if (applied.appearance === "light") {
    root.classList.remove("dark");
  }
}

/**
 * 恢复 BerryTrace 原生默认主题
 */
export function resetBerryTraceTheme(previous?: BerryTraceAppliedTheme): void {
  const root = document.documentElement;

  // 清除自定义变量
  const keysToClean = [
    "--berrytrace-custom-bg",
    "--berrytrace-bg-position",
    "--bg-background",
    "--bg-card",
    "--bg-muted",
    "--brand-primary",
    "--text-foreground",
    "--text-muted-foreground",
    "--border-border",
  ];

  keysToClean.forEach((key) => root.style.removeProperty(key));
}
