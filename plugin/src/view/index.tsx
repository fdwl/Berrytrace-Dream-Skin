import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  Palette,
  Brush,
  Upload,
  RotateCcw,
  Check,
  Sparkles,
  Trash2,
  FileArchive,
  Download,
  CheckCircle2,
  Library,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  transformDreamSkinToBerryTrace,
  applySkinViaSDK,
  clearSkinViaSDK,
  saveWallpaperToDisk,
  resolvePreviewDataUrl,
  formatPluginResourceUrl,
  getSkinRootDir,
  BerryTraceAppliedTheme,
  DreamSkinThemeConfig,
  type SdkUi,
  type SdkPlugin,
} from '../adapter/theme-adapter';
import {
  parseDreamSkinZip,
  buildDreamSkinPackage,
  installThemeZipNative,
  DreamSkinPackage,
} from '../adapter/package-importer';
import {
  DREAMSKIN_GALLERY_URL,
  DOWNLOAD_INTERCEPT_PATTERNS,
  extractVersionId,
  fetchThemeMeta,
  supportedModesFor,
  themeDownloadUrl,
  verifyPackageChecksum,
  VERSION_ID_RE,
} from '../adapter/dreamskin-api';
import { GALLERY_CSS, GALLERY_JS } from './gallery-inject';
import { SkinMenuItem, type SkinMenuEntry } from './SkinMenuItem';

declare const window: any;

export interface ThemeItem {
  id: string;
  name: string;
  author: string;
  isCustom?: boolean;
  config: DreamSkinThemeConfig;
  themeCss?: string;
  imageBlobUrl?: string;
  /** 来自主题库的版本 id（`ver_…`）。手动导入的包没有这个字段。 */
  versionId?: string;
}


/**
 * 皮肤注册成宿主色系时的 id 前缀。
 *
 * 🔴 为什么要注册成色系：宿主的「明暗档」是按色系的 `modes` 收拢的
 * （`src/stores/app.ts` 的 `_clampThemeMode` 五个收拢点 + `isThemeModeAvailable`
 * 置灰判据）。只调 `setAppearance('dark')` 表达不了「这套皮肤不许切明暗」——
 * 那条状态写成了 DOM 副作用，而宿主 `initTheme()` 比 SkinLayer 的恢复更早跑，
 * 下一次系统明暗事件就把它冲掉了（李博 0904 报的「下次启动跟随系统了」）。
 *
 * 注册成色系之后 `data-palette` 会写成本 id，**内置的色系覆盖层一条都不命中**
 * —— 这正是我们要的：皮肤自己带全套颜色（走 persistStyle 注进 <head>），
 * 底下留宿主的裸 `:root` 基座就行。
 */
const PALETTE_ID_PREFIX = 'dreamskin-';

/** 本插件 id。要与 plugin.json 的 `id` 逐字相同 —— 它决定内嵌站点用哪个 Cookie 罐。 */
const PLUGIN_ID = 'org.dreamskin.plugin.dream-skin';

/**
 * 宿主提供的「把外部网站嵌进插件面板」的组件。
 *
 * 🔴 **不要自己写 `<webview>` 或 `<iframe>`**，这条路上有四个零报错的坑，
 * 宿主那个组件已经全收口了（`src/components/plugin-embed/EmbeddedSite.tsx`）：
 *   ① iframe 嵌不了 —— dreamskin.cc 带 `x-frame-options: SAMEORIGIN` +
 *      `frame-ancestors 'self'`（0904 实测），iframe 里一片空白且控制台零输出；
 *   ② `<webview>` 的 partition 名算错 ⇒ `will-attach-webview` 当场拒绝挂载，
 *      面板永远空白、没有任何报错指向原因；
 *   ③ preload 挂不上（宿主会主动 strip），所以 guest→插件不能走 ipc-message；
 *   ④ `dreamskin://` 这类自定义协议在 webview 里接不住。
 *
 * 宿主版本旧时这里是 undefined —— 渲染侧据此退化成一句说明 + 引导去「我的皮肤」，
 * **不是白屏**。
 */
const EmbeddedSiteComp: React.ComponentType<{
  pluginId: string;
  src: string;
  injectCSS?: string;
  injectJS?: string;
  onGuestMessage?: (payload: unknown) => void;
  onProtocolLink?: (url: string) => void;
  onReady?: () => void;
  onLoadError?: (code: number, description: string, url: string) => void;
  className?: string;
  style?: React.CSSProperties;
}> | undefined = (window as any)?.berrytrace?.ui?.EmbeddedSite;

/** 色系 id 只允许 `[A-Za-z0-9_.:-]`（它会被写进 data-palette 和 CSS 属性选择器）。 */
function paletteIdForTheme(themeId: string): string {
  return (PALETTE_ID_PREFIX + String(themeId)).replace(/[^A-Za-z0-9_.:-]/g, '-').slice(0, 64);
}

const STORAGE_KEY_CUSTOM_THEMES = 'berrytrace_dream_skin_custom_themes';
const STORAGE_KEY_ACTIVE_THEME = 'berrytrace_dream_skin_active';

interface DreamSkinAppProps {
  sdk?: any;
}

// sdk.ui / sdk.plugin を React コンポーネント内または prop 从获取的助手函数
function getSdkUi(propSdk?: any): SdkUi | null {
  return (propSdk?.ui as SdkUi) ?? (window.berrytracePluginSdk?.ui as SdkUi) ?? null;
}
function getSdkPlugin(propSdk?: any): SdkPlugin | null {
  return (propSdk?.plugin as SdkPlugin) ?? (window.berrytracePluginSdk?.plugin as SdkPlugin) ?? null;
}

const ThemePreviewCard: React.FC<{ theme: ThemeItem; sdk?: any }> = ({ theme, sdk }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setHasError(false);
    const configImage = theme?.config?.image;
    const rawUrl = theme?.imageBlobUrl || (configImage ? formatPluginResourceUrl(configImage) : '');
    setImgSrc(rawUrl);
  }, [theme?.imageBlobUrl, theme?.config?.image]);

  const colors = theme?.config?.colors;
  const focusX = theme?.config?.art?.focusX ?? 0.5;
  const focusY = theme?.config?.art?.focusY ?? 0.5;

  if (imgSrc && !hasError) {
    return (
      <img
        src={imgSrc}
        alt={theme?.name || theme?.id || ''}
        onError={() => {
          // URL 加载失败时才降级读 Base64
          const targetSdk = sdk || (typeof window !== 'undefined' && window.berrytracePluginSdk);
          if (targetSdk && !imgSrc.startsWith('data:')) {
            resolvePreviewDataUrl(targetSdk, imgSrc)
              .then((dataUrl) => {
                if (dataUrl && dataUrl.startsWith('data:')) {
                  setImgSrc(dataUrl);
                } else {
                  setHasError(true);
                }
              })
              .catch(() => setHasError(true));
          } else {
            setHasError(true);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{
          objectPosition: `${focusX * 100}% ${focusY * 100}%`,
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2.5 p-2 px-3 bg-card rounded-full border border-black/10 dark:border-white/10 shadow-2xs">
      <span
        className="size-5 rounded-full border border-black/10 shadow-2xs"
        style={{ backgroundColor: colors?.background || '#f5f5f5' }}
        title="背景"
      />
      <span
        className="size-5 rounded-full border border-black/10 shadow-2xs"
        style={{ backgroundColor: colors?.panel || '#ffffff' }}
        title="面板"
      />
      <span
        className="size-5 rounded-full border border-black/10 shadow-2xs"
        style={{ backgroundColor: colors?.accent || '#0e8fbf' }}
        title="品牌色"
      />
      <span
        className="size-5 rounded-full border border-black/10 shadow-2xs"
        style={{ backgroundColor: colors?.highlight || colors?.secondary || '#0b6b8f' }}
        title="高亮"
      />
    </div>
  );
};

const DreamSkinApp: React.FC<DreamSkinAppProps> = ({ sdk: propSdk }) => {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('就绪 - 支持拖拽 .zip / .json 主题包至此安装');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  /** 顶部页签。默认落在主题库 —— 网站嵌进来之后它才是主入口，上传退居次要。 */
  const [activeTab, setActiveTab] = useState<'gallery' | 'mine'>('gallery');
  /** 正在从主题库装的那个版本 id（用来把按钮转成转圈）。 */
  const [installingVersion, setInstallingVersion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedUrlRef = useRef<string | null>(null);

  // 标志位：防范应用主题过程中触发事件广播造成的递归重入
  const isApplyingRef = useRef<boolean>(false);

  // 仅恢复 UI 激活状态及主题列表（不触发 DOM/CSS 重新应用，防止死循环）
  const syncActiveThemeStateOnly = async () => {
    try {
      const sdk = window.berrytracePluginSdk;
      let savedCustom: ThemeItem[] = [];
      let savedActiveId: string | null = null;
      let savedActiveName: string | null = null;

      if (sdk?.storage) {
        savedCustom = (await sdk.storage.getItem(STORAGE_KEY_CUSTOM_THEMES)) || [];
        const savedActive = await sdk.storage.getItem(STORAGE_KEY_ACTIVE_THEME);
        savedActiveId = savedActive?.themeId ?? null;
        savedActiveName = savedActive?.name ?? null;
      } else {
        const rawCustom = window.localStorage.getItem(STORAGE_KEY_CUSTOM_THEMES);
        if (rawCustom) savedCustom = JSON.parse(rawCustom);
        const rawActive = window.localStorage.getItem(STORAGE_KEY_ACTIVE_THEME);
        if (rawActive) {
          const parsed = JSON.parse(rawActive);
          savedActiveId = parsed?.themeId ?? null;
          savedActiveName = parsed?.name ?? null;
        }
      }

      // 恢复 imageBlobUrl：优先使用存储中保存的完整协议路径，不要用相对文件名重新生成
      const cleanedCustom = savedCustom.map((item) => {
        if (item.imageBlobUrl && item.imageBlobUrl.startsWith('data:image')) {
          // 旧版本存了 Base64，丢弃，用空字符串（下次会触发 onError 降级）
          return { ...item, imageBlobUrl: '' };
        }
        return item;
      });

      setThemes(cleanedCustom);

      if (savedActiveId) {
        // 如果 custom 列表里有这个 ID，直接同步该 item 的 imageBlobUrl 并补全存储
        const activeItem = cleanedCustom.find((t) => t.id === savedActiveId);
        setActiveThemeId(savedActiveId);
        setStatusMessage(`当前生效主题：${activeItem?.name || savedActiveName || savedActiveId}`);
      }
    } catch (err: any) {
      console.error('同步保存的主题状态失败:', err);
    }
  };

  // 初始化加载与宿主明暗模式切换监听
  useEffect(() => {
    syncActiveThemeStateOnly();

    // 1. 订阅 SDK UI 主题变更事件
    const sdkUi = getSdkUi(propSdk);
    let unsubUi: (() => void) | undefined;
    if (sdkUi?.onThemeChange) {
      unsubUi = sdkUi.onThemeChange(() => {
        if (isApplyingRef.current) return;
        console.log('🎨 [DreamSkin] 收到 sdk.ui.onThemeChange 通知，仅刷新 UI 状态...');
        syncActiveThemeStateOnly();
      });
    }

    // 2. 响应 plugin.json 声明式事件总线 (theme:changed / theme:change)
    const sdkEvents = (propSdk || window.berrytracePluginSdk)?.events;
    let unsubEvents: (() => void) | undefined;
    if (sdkEvents?.on) {
      const handleEvent = (eventName: string) => () => {
        if (isApplyingRef.current) return;
        console.log(`🎨 [DreamSkin] 收到声明式总线事件 ${eventName} 通知，仅刷新 UI 状态...`);
        syncActiveThemeStateOnly();
      };
      const u1 = sdkEvents.on('theme:changed', handleEvent('theme:changed'));
      const u2 = sdkEvents.on('theme:change', handleEvent('theme:change'));
      unsubEvents = () => {
        if (typeof u1 === 'function') u1();
        if (typeof u2 === 'function') u2();
      };
    }

    return () => {
      if (unsubUi) unsubUi();
      if (unsubEvents) unsubEvents();
    };
  }, []);

  const persistThemesAndActive = async (
    newThemes: ThemeItem[],
    activeItem?: ThemeItem | null,
    applied?: BerryTraceAppliedTheme | null
  ) => {
    const customList = newThemes.filter((t) => t.isCustom);
    setThemes(newThemes);

    // 只存储 UI 状态（ID + name），CSS 已由 sdk.ui.persistStyle 接管
    const sdk = window.berrytracePluginSdk;
    if (sdk?.storage) {
      await sdk.storage.setItem(STORAGE_KEY_CUSTOM_THEMES, customList);
      if (activeItem && applied) {
        await sdk.storage.setItem(STORAGE_KEY_ACTIVE_THEME, {
          themeId: activeItem.id,
          name: applied.name,
          imageBlobUrl: activeItem.imageBlobUrl,
        });
      } else if (activeItem === null) {
        await sdk.storage.removeItem(STORAGE_KEY_ACTIVE_THEME);
      }
    } else {
      window.localStorage.setItem(STORAGE_KEY_CUSTOM_THEMES, JSON.stringify(customList));
      if (activeItem && applied) {
        window.localStorage.setItem(STORAGE_KEY_ACTIVE_THEME, JSON.stringify({
          themeId: activeItem.id,
          name: applied.name,
          imageBlobUrl: activeItem.imageBlobUrl,
        }));
      } else if (activeItem === null) {
        window.localStorage.removeItem(STORAGE_KEY_ACTIVE_THEME);
      }
    }
  };

  /**
   * 把这套皮肤注册成宿主的运行期色系，并切过去。
   *
   * 这一步做完，「这套皮肤支持哪几档明暗」就成了宿主 store 里的一等状态：
   * 只支持深色的皮肤，头像菜单里「浅色 / 自动」自动置灰，**重启也不会被
   * 系统明暗拽走**。见 PALETTE_ID_PREFIX 那段注释。
   *
   * 宿主版本旧（没有 registerPalette）时**静默降级**为原来的 setAppearance ——
   * 行为退回改造前，不是报错。判据写在返回值里，调用方据此决定要不要出声。
   */
  const registerSkinAsPalette = (item: ThemeItem): 'registered' | 'fallback' => {
    const sdkUi = getSdkUi(propSdk) as (SdkUi & {
      registerPalette?: (d: { id: string; label?: string; attr?: string | null; modes: Array<'light' | 'dark'> }) => boolean;
      setPalette?: (id: string) => void;
    }) | null;
    const appearance = item.config?.appearance;
    const modes = supportedModesFor(appearance);

    if (sdkUi && typeof sdkUi.registerPalette === 'function' && typeof sdkUi.setPalette === 'function') {
      const pid = paletteIdForTheme(item.id);
      const ok = sdkUi.registerPalette({ id: pid, label: item.name || item.id, attr: pid, modes });
      if (ok) {
        sdkUi.setPalette(pid);
        console.log(`🎨 [DreamSkin] 已注册色系 ${pid}，支持档位 ${modes.join('/')}`);
        return 'registered';
      }
      console.warn(`🎨 [DreamSkin] registerPalette 拒收了 ${pid}（id 非法或撞了内置色系），降级`);
    }

    // 降级：老宿主只有 setAppearance。它锁不住明暗（重启后会跟随系统），
    // 但至少当前这一刻是对的。
    if (sdkUi?.setTheme && appearance && appearance !== 'auto') {
      sdkUi.setTheme(appearance);
    }
    return 'fallback';
  };

  /** 摘掉某套皮肤的色系登记。删除皮肤 / 恢复默认外观时调。 */
  const unregisterSkinPalette = (themeId: string) => {
    const sdkUi = getSdkUi(propSdk) as (SdkUi & {
      unregisterPalette?: (id: string) => boolean;
    }) | null;
    if (sdkUi && typeof sdkUi.unregisterPalette === 'function') {
      sdkUi.unregisterPalette(paletteIdForTheme(themeId));
    }
  };

  // 应用指定的 ThemeItem（使用 sdk.ui + sdk.plugin 全套 API）
  const handleApplyTheme = async (item: ThemeItem) => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    try {
      // 若是大体积 Base64 数据，优先保存至系统磁盘，拿回轻量的 URL
      const savedImageUrl = await saveWallpaperToDisk(propSdk || window.berrytracePluginSdk, item.id, item.imageBlobUrl);
      const applied = transformDreamSkinToBerryTrace(item.config, savedImageUrl);

      // ── 优先使用 sdk.ui（persistStyle + setWallpaper + setToken）───────
      const sdkUi = getSdkUi(propSdk);
      if (sdkUi) {
        await applySkinViaSDK(sdkUi, applied, getSdkPlugin(propSdk) ?? undefined);
      } else {
        // fallback：仅注入当前窗口（无持久化、无跨窗口）
        const { injectThemeVariablesToDOM: legacy } = await import('../adapter/theme-adapter');
        legacy(applied);
      }

      // 🔴 注册色系必须在 applySkinViaSDK **之后**：后者会调 setTheme/setAppearance，
      // 那时色系还没换过去，明暗收拢用的是旧色系的 modes。顺序反了的表现是
      // 「第一次点没锁住，再点一次才锁住」——两次之间没有任何报错。
      registerSkinAsPalette(item);

      setActiveThemeId(item.id);
      setStatusMessage(`已切换为主题：${item.name}`);
      await persistThemesAndActive(themes, item, applied);

      // 广播插件事件通知
      window.berrytracePluginSdk?.events?.emit('dream-skin:applied', {
        themeId: item.id,
        name: item.name,
      });
    } catch (err: any) {
      setStatusMessage(`应用失败: ${err?.message || '未知错误'}`);
    } finally {
      setTimeout(() => {
        isApplyingRef.current = false;
      }, 300);
    }
  };

  // 恢复原生 BerryTrace 默认外观
  const handleReset = async () => {
    const sdkUi = getSdkUi(propSdk);
    if (sdkUi) {
      await clearSkinViaSDK(sdkUi, getSdkPlugin(propSdk) ?? undefined);
    } else {
      const { resetBerryTraceTheme: legacy } = await import('../adapter/theme-adapter');
      legacy();
    }
    // 摘掉当前皮肤的色系并切回内置默认，否则明暗会一直被它的 modes 锁着 ——
    // 「恢复默认外观」这句话对用户的承诺里就包含「明暗能切了」。
    if (activeThemeId) unregisterSkinPalette(activeThemeId);
    const sdkUiForPalette = getSdkUi(propSdk) as (SdkUi & { setPalette?: (id: string) => void }) | null;
    if (typeof sdkUiForPalette?.setPalette === 'function') sdkUiForPalette.setPalette('mono');

    setActiveThemeId(null);
    setStatusMessage('已恢复 BerryTrace 原生默认外观');
    await persistThemesAndActive(themes, null, null);
  };

  // 删除自定义导入的主题 (物理清理解压目录与数据)
  const handleDeleteCustomTheme = async (id: string) => {
    try {
      const sdk = propSdk || window.berrytracePluginSdk;
      const fs = sdk?.filesystem;
      const skinRootDir = await getSkinRootDir(sdk);
      if (fs?.removeDir && skinRootDir) {
        await fs.removeDir(`${skinRootDir}/${id}`).catch(() => {});
      }
    } catch (e) {
      console.warn('删除物理主题目录异常:', e);
    }

    unregisterSkinPalette(id);

    const updated = themes.filter((t) => t.id !== id);
    if (activeThemeId === id) {
      await handleReset();
    } else {
      await persistThemesAndActive(updated);
    }
    setStatusMessage(`已删除主题 [${id}]`);
  };

  // 一键清空所有自定义主题与解压目录，恢复初始状态
  const handleClearAllCustomThemes = async () => {
    try {
      const sdk = propSdk || window.berrytracePluginSdk;
      const fs = sdk?.filesystem;
      const skinRootDir = await getSkinRootDir(sdk);

      // 1. 物理删除所有解压的皮肤文件夹
      const customItems = themes.filter((t) => t.isCustom);
      if (fs?.removeDir && skinRootDir) {
        for (const item of customItems) {
          await fs.removeDir(`${skinRootDir}/${item.id}`).catch(() => {});
        }
        await fs.removeDir(`${skinRootDir}/wallpapers`).catch(() => {});
      }

      // 2. 擦除插件持久化存储 (storage & localStorage)
      if (sdk?.storage) {
        await sdk.storage.removeItem(STORAGE_KEY_CUSTOM_THEMES);
        await sdk.storage.removeItem(STORAGE_KEY_ACTIVE_THEME);
      }
      window.localStorage.removeItem(STORAGE_KEY_CUSTOM_THEMES);
      window.localStorage.removeItem(STORAGE_KEY_ACTIVE_THEME);

      // 3. 恢复原生默认外观
      await handleReset();
      setThemes([]);
      setStatusMessage('🎉 已彻底一键清空所有自定义皮肤及物理解压文件，恢复初始状态');
    } catch (err: any) {
      console.error('清空自定义皮肤失败:', err);
      setStatusMessage(`清空失败: ${err?.message || '未知错误'}`);
    }
  };

  // 解析并导入 DreamSkinPackage
  const processImportPackage = async (pkg: DreamSkinPackage, filename: string) => {
    if (!pkg.theme?.id) {
      throw new Error('主题包无效：theme.json 缺少 id 字段');
    }

    const themeId = pkg.theme.id;
    pkg.theme.name = pkg.theme.name || pkg.manifest?.themeId || filename.replace(/\.(zip|json)$/i, '');

    // imageBlobUrl 由 installThemeZipNative 直接返回 berrytrace-plugin:// 物理路径，直接使用
    const imageUrl = pkg.imageBlobUrl || '';

    const newThemeItem: ThemeItem = {
      id: themeId,
      name: pkg.theme.name,
      author: pkg.manifest?.publisher?.displayName || '自定义导入',
      isCustom: true,
      config: pkg.theme,
      themeCss: pkg.themeCss,
      imageBlobUrl: imageUrl,
    };

    // 同名主题直接覆盖替换，不追加不改名
    const updated = [...themes.filter((t) => t.id !== themeId), newThemeItem];

    // 自动应用
    const applied = transformDreamSkinToBerryTrace(pkg.theme, imageUrl);
    const sdkUi = getSdkUi(propSdk);
    if (sdkUi) {
      await applySkinViaSDK(sdkUi, applied, getSdkPlugin(propSdk) ?? undefined);
    } else {
      const { injectThemeVariablesToDOM: legacy } = await import('../adapter/theme-adapter');
      legacy(applied);
    }
    registerSkinAsPalette(newThemeItem);

    setActiveThemeId(themeId);
    setStatusMessage(`🎉 已安装并应用主题：${newThemeItem.name}`);

    await persistThemesAndActive(updated, newThemeItem, applied);
  };

  // 从远程 HTTP/HTTPS URL 下载皮肤资源包并自动套用
  const handleDownloadAndInstallFromUrl = async (url: string) => {
    try {
      setStatusMessage(`正在从远程地址下载皮肤资源包: ${url}...`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP 响应错误 (${response.status} ${response.statusText})`);
      }

      const blob = await response.blob();
      let filename = 'downloaded_theme.zip';
      try {
        const parsedUrl = new URL(url);
        const nameFromPath = parsedUrl.pathname.split('/').pop();
        if (nameFromPath && (nameFromPath.endsWith('.zip') || nameFromPath.endsWith('.json'))) {
          filename = nameFromPath;
        }
      } catch {}

      const file = new File([blob], filename, { type: blob.type || 'application/zip' });
      let pkg: DreamSkinPackage;
      if (filename.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        pkg = buildDreamSkinPackage(text);
      } else {
        pkg = await installThemeZipNative(propSdk || window.berrytracePluginSdk, file);
      }

      await processImportPackage(pkg, filename);
      setStatusMessage(`🎉 自动下载并套用皮肤成功: ${pkg.theme.name || filename}`);
    } catch (err: any) {
      console.error('自动下载皮肤包失败:', err);
      setStatusMessage(`❌ 自动下载皮肤失败: ${err?.message || '网络下载失败'}`);
    }
  };

  /**
   * ★ 一键换肤 —— 三个入口最终都汇到这一个函数。
   *
   * 入口一：注入脚本在卡片上补的那颗按钮（`gallery-inject.ts` 的 `post({type:'apply'})`）；
   * 入口二：站点**自己**渲染的 `<a href="dreamskin://apply?version=…">` —— 注入脚本
   *         把它就地改写成走入口一（原样点下去在 webview 里是接不住的，
   *         guest 上没有 will-navigate，Chromium 直接吞成 ERR_UNKNOWN_URL_SCHEME）；
   * 入口三：用户点站点自己的「下载」⇒ 宿主 `will-download` 把它拦下来交给我们
   *         （`sdk.ui.interceptDownloads`）。
   *
   * 汇到一处的好处很实在：这条流程里最容易出错的是**校验与降级**那几步，
   * 三个入口各写一遍必然漂。
   */
  const installFromVersionId = async (versionId: string) => {
    if (!VERSION_ID_RE.test(versionId)) {
      setStatusMessage(`❌ 版本号形状不对：${versionId}`);
      return;
    }
    if (installingVersion) return;   // 同一时刻只装一个，避免两次解压写同一个目录
    setInstallingVersion(versionId);
    try {
      const sdk = propSdk || window.berrytracePluginSdk;
      setStatusMessage(`正在获取主题信息…（${versionId}）`);

      // ① 元信息。拿不到**不算失败** —— 它只用来锁明暗档、校验 sha256、写作者名，
      //    真正必需的 manifest.json / theme.json 在包里。
      const meta = await fetchThemeMeta(sdk, versionId);
      const displayName = meta?.name || versionId;

      // ② 下载。必须走主进程（sdk.filesystem.downloadFile 底下是 net.fetch）——
      //    渲染层 fetch() 会被 CORS 挡住，而报的是「Failed to fetch」，
      //    跟真的断网一模一样，查不出来。api.dreamskin.cc 实测不发 CORS 头。
      setStatusMessage(`正在下载主题包：${displayName}…`);
      const skinRoot = await getSkinRootDir(sdk);
      const tmpPath = `${skinRoot}/.download/${versionId}.zip`;
      const dl = sdk?.filesystem?.downloadFile;
      if (typeof dl !== 'function') {
        throw new Error('宿主未提供 filesystem.downloadFile');
      }
      await dl(themeDownloadUrl(versionId), tmpPath);

      // ③ 读回字节 + 校验 sha256。
      setStatusMessage(`正在校验主题包：${displayName}…`);
      const b64 = await sdk?.filesystem?.readFile?.(tmpPath, 'base64');
      if (!b64) throw new Error('下载完成但读不回文件');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

      const verdict = await verifyPackageChecksum(bytes, meta?.packageSha256);
      if (verdict === 'mismatch') {
        // 🔴 对不上就必须停。包坏了或被掉包，装进去的是别人的东西。
        throw new Error('主题包校验失败（sha256 与服务端记录不一致），已拒绝安装');
      }
      if (verdict === 'skipped') {
        // 三态的意义就在这儿：把「校验不了」和「校验过了」并成一个 true，
        // 等于悄悄放弃了校验。这里放行，但**出声**。
        console.warn('🎨 [DreamSkin] 未能校验 sha256（元信息缺失或环境无 crypto.subtle），已放行');
      }

      // ④ 解包 + 应用（复用既有那条路，与拖拽导入完全一致）。
      setStatusMessage(`正在安装：${displayName}…`);
      const file = new File([new Blob([bytes], { type: 'application/zip' })], `${versionId}.zip`);
      const pkg = await installThemeZipNative(sdk, file);

      // 元信息里的名字比包里的好看（包里常是 slug），有就用它。
      if (meta?.name && pkg.theme) pkg.theme.name = meta.name;
      // 元信息里的 appearance 是权威的那份镜像；包里没写时补上，
      // 它决定这套皮肤锁不锁明暗。
      if (pkg.theme && !pkg.theme.appearance && meta?.displayMeta?.appearance) {
        pkg.theme.appearance = meta.displayMeta.appearance;
      }

      await processImportPackage(pkg, `${versionId}.zip`);

      // ⑤ 收尾：把下载的临时包删掉（解压产物已经落在 skin 目录里了）。
      await sdk?.filesystem?.removeFile?.(tmpPath).catch(() => {});

      const modes = supportedModesFor(pkg.theme?.appearance);
      const lockNote = modes.length === 1 ? `（此皮肤只支持${modes[0] === 'dark' ? '深色' : '浅色'}，明暗切换已锁定）` : '';
      setStatusMessage(`🎉 已换肤：${pkg.theme?.name || displayName}${lockNote}`);
      // 装完把用户拨到「我的皮肤」，让他看见东西真的进来了 ——
      // 留在主题库页面的话，除了背景变了没有任何反馈。
      setActiveTab('mine');
    } catch (err: any) {
      console.error('一键换肤失败:', err);
      setStatusMessage(`❌ 一键换肤失败：${err?.message || '未知错误'}`);
    } finally {
      setInstallingVersion(null);
    }
  };

  /** 内嵌站点用 console 前缀送回来的消息。 */
  const handleGuestMessage = (payload: unknown) => {
    const msg = payload as { type?: string; versionId?: string; message?: string; url?: string };
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'apply' && msg.versionId) {
      void installFromVersionId(msg.versionId);
    } else if (msg.type === 'error') {
      console.warn('🎨 [DreamSkin] 注入脚本报错:', msg.message);
    } else if (msg.type === 'ready') {
      console.log('🎨 [DreamSkin] 主题库页面就绪:', msg.url);
    }
  };

  /**
   * 拦下站点自己那条下载（`…/v1/themes/<ver>/download`）。
   *
   * 用户点站点的「下载」按钮时，Chromium 走原生下载：弹保存框、落到下载目录、
   * **然后什么也不会发生**。拦下来之后直接进一键换肤流程 —— 对用户来说，
   * 「下载」和「一键换肤」这两颗按钮做的是同一件事，这正是我们要的。
   */
  useEffect(() => {
    const sdkUi = getSdkUi(propSdk) as (SdkUi & {
      interceptDownloads?: (
        patterns: string[],
        cb: (info: { url: string; filename: string; mimeType: string; totalBytes: number }) => void,
      ) => () => void;
    }) | null;
    if (!sdkUi || typeof sdkUi.interceptDownloads !== 'function') {
      console.warn('🎨 [DreamSkin] 宿主没有 ui.interceptDownloads，站点自带的「下载」按钮仍会走原生下载');
      return;
    }
    const off = sdkUi.interceptDownloads(DOWNLOAD_INTERCEPT_PATTERNS, (info) => {
      const v = extractVersionId(info.url);
      if (!v) {
        console.warn('🎨 [DreamSkin] 拦到一条下载但抠不出版本号:', info.url);
        return;
      }
      console.log('🎨 [DreamSkin] 拦下站点下载，转入一键换肤:', v);
      void installFromVersionId(v);
    });
    // 🔴 必须撤销。留死条目的话，那条下载会被拦下并送给一个已销毁的窗口，
    // 而 preventDefault() 不可撤销 ⇒ 用户点了下载什么都没发生。
    return off;
    // installFromVersionId 每次渲染都是新引用，放进依赖会导致反复登记/撤销。
    // 它内部读的都是 ref 或 setState，闭包过期不影响正确性。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 从 Deep Link 传入的本地磁盘文件绝对路径导入皮肤包
  const handleInstallFromLocalPath = async (filePath: string) => {
    try {
      setStatusMessage(`正在读取本地皮肤包: ${filePath}...`);
      const sdk = propSdk || window.berrytracePluginSdk;
      const fs = sdk?.filesystem;
      const filename = filePath.split(/[/\\]/).pop() || 'local_theme.zip';

      if (fs?.readFile) {
        const rawBase64 = await fs.readFile(filePath, 'base64');
        const byteCharacters = atob(rawBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/zip' });
        const file = new File([blob], filename);

        let pkg: DreamSkinPackage;
        if (filename.toLowerCase().endsWith('.json')) {
          const text = await file.text();
          pkg = buildDreamSkinPackage(text);
        } else {
          pkg = await installThemeZipNative(sdk, file);
        }
        await processImportPackage(pkg, filename);
        setStatusMessage(`🎉 本地皮肤导入成功: ${pkg.theme.name || filename}`);
      } else {
        throw new Error('宿主未接入 filesystem.readFile 原生权限');
      }
    } catch (err: any) {
      console.error('导入本地路径皮肤失败:', err);
      setStatusMessage(`❌ 读取本地皮肤失败: ${err?.message || '无法访问文件'}`);
    }
  };

  // 监听/处理 URL Deep Link 协议参数 (?themeUrl=... 或 ?filePath=... 或 ?url=...)
  useEffect(() => {
    const checkDeepLinkParams = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const themeUrl = searchParams.get('themeUrl') || searchParams.get('url');
      const filePath = searchParams.get('filePath') || searchParams.get('file');

      const targetIdentifier = themeUrl ? `url:${themeUrl}` : filePath ? `file:${filePath}` : null;
      if (!targetIdentifier || processedUrlRef.current === targetIdentifier) {
        return;
      }
      processedUrlRef.current = targetIdentifier;

      if (themeUrl) {
        console.log('🎨 [DreamSkin] 收到 Deep Link 唤醒参数，启动自动下载:', themeUrl);
        await handleDownloadAndInstallFromUrl(themeUrl);
      } else if (filePath) {
        console.log('🎨 [DreamSkin] 收到 Deep Link 唤醒参数，启动本地导入:', filePath);
        await handleInstallFromLocalPath(filePath);
      }
    };

    checkDeepLinkParams();
  }, []);

  // 文件处理 (.zip 或 .json)
  const handleFileSelected = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    try {
      setStatusMessage(`正在使用宿主原生引擎解压与校验 ${file.name}...`);
      let pkg: DreamSkinPackage;

      if (lowerName.endsWith('.zip')) {
        pkg = await installThemeZipNative(propSdk || window.berrytracePluginSdk, file);
      } else if (lowerName.endsWith('.json')) {
        const text = await file.text();
        pkg = buildDreamSkinPackage(text);
      } else {
        throw new Error('只支持 .zip 资源包或 theme.json 文件');
      }

      await processImportPackage(pkg, file.name);
    } catch (err: any) {
      setStatusMessage(`安装失败: ${err?.message || '文件格式错误'}`);
    }
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileSelected(files[0]);
    }
  };

  /** 顶部页签定义。主题库在前 —— 网站嵌进来之后它是主入口。 */
  const TABS = [
    { id: 'gallery' as const, label: '主题库', icon: Library },
    { id: 'mine' as const, label: `我的皮肤${themes.length ? ` (${themes.length})` : ''}`, icon: Brush },
  ];

  const activeTheme = themes.find((t) => t.id === activeThemeId) || null;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col h-full w-full bg-transparent text-foreground text-left ${
        isDragging ? 'ring-2 ring-brand ring-inset' : ''
      }`}
    >
      {/* 拖拽落点提示。
          ⚠️ 网站嵌进来之后拖拽的权重下降了，但**不能删** —— 主题库里没有的包
          （作者私发的、自己做的）只能这么进来。所以它从「页面主角」降级成
          「整页任意位置都接得住的隐藏能力」，只在真的拖东西进来时才现身。 */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/92 backdrop-blur-md border-2 border-dashed border-brand p-8 text-center pointer-events-none">
          <FileArchive className="w-14 h-14 text-brand animate-bounce mb-3" />
          <h2 className="text-base font-bold text-foreground">松开即安装 DreamSkin 主题包</h2>
          <p className="text-xs text-muted-foreground mt-1">支持 .zip 完整资源包或 theme.json</p>
        </div>
      )}

      {/* ── 顶栏：页签 + 当前生效 ─────────────────────────────────────
          刻意做得很薄（一行高）：下面那块是嵌进来的网站，顶栏越重，
          「网站是嵌进来的」这件事就越明显。 */}
      <div className="flex items-center justify-between gap-3 px-4 h-11 shrink-0 border-b border-black/8 dark:border-white/8">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const on = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none ${
                  on
                    ? 'bg-accent text-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {installingVersion ? (
            <span className="flex items-center gap-1.5 text-[11px] text-brand min-w-0">
              <Loader2 className="size-3.5 animate-spin shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </span>
          ) : activeTheme ? (
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
              <CheckCircle2 className="size-3.5 text-brand shrink-0" />
              <span className="truncate">{activeTheme.name}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* ── 页签一：主题库（嵌入的网站，全宽无边框）───────────────── */}
      {activeTab === 'gallery' && (
        <div className="flex-1 min-h-0 relative">
          {EmbeddedSiteComp ? (
            <EmbeddedSiteComp
              pluginId={PLUGIN_ID}
              src={DREAMSKIN_GALLERY_URL}
              injectCSS={GALLERY_CSS}
              injectJS={GALLERY_JS}
              onGuestMessage={handleGuestMessage}
              onProtocolLink={(url: string) => {
                // 兜底通道：注入脚本已经把 dreamskin:// 链接就地改写了，
                // 走到这里说明改写没盖到（新的 UI、或脚本注入失败）。
                const v = extractVersionId(url);
                if (v) void installFromVersionId(v);
              }}
              onLoadError={(code: number, desc: string) => {
                setStatusMessage(`❌ 主题库加载失败（${code} ${desc}）`);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <Download className="size-8 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground">当前宿主版本不支持内嵌主题库</div>
              <p className="text-xs text-muted-foreground max-w-md">
                需要宿主提供 <code className="px-1 rounded bg-muted">window.berrytrace.ui.EmbeddedSite</code>。
                升级宿主后即可在这里直接浏览并一键换肤；在那之前仍可在「我的皮肤」里拖入 .zip 安装。
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('mine')}
                className="mt-1 px-3.5 py-2 text-xs font-semibold bg-brand text-brand-foreground rounded-xl cursor-pointer border-none"
              >
                去「我的皮肤」
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 页签二：我的皮肤 ─────────────────────────────────────── */}
      {activeTab === 'mine' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {/* 操作条：恢复默认 / 手动导入。窄窄一条，不抢皮肤卡片的位置。 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Sparkles className="size-3.5 text-brand shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-black/10 dark:border-white/10 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
                title="恢复 BerryTrace 原生默认外观，并解开明暗锁定"
              >
                <RotateCcw className="size-3.5" />
                <span>恢复默认外观</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-black/10 dark:border-white/10 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
                title="从磁盘导入 .zip / theme.json（主题库里没有的包走这里）"
              >
                <Upload className="size-3.5" />
                <span>导入 .zip</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
                }}
              />
            </div>
          </div>

          {themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <Brush className="size-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground">还没有装皮肤</div>
              <p className="text-xs text-muted-foreground max-w-sm">
                到「主题库」挑一个，点卡片上的「一键换肤」即可；也可以把 .zip 拖到这个窗口任意位置。
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className="mt-1 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-brand text-brand-foreground rounded-xl cursor-pointer border-none"
              >
                <Library className="size-3.5" />
                <span>逛主题库</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme, idx) => {
                if (!theme) return null;
                const uniqueKey = theme.id ? `theme-${theme.id}-${idx}` : `theme-item-${idx}`;
                const isActive = activeThemeId === theme.id;
                const themeTitle = theme.name || theme.config?.name || theme.id || `主题 ${idx + 1}`;
                const modes = supportedModesFor(theme.config?.appearance);
                return (
                  <div
                    key={uniqueKey}
                    className={`relative flex flex-col justify-between rounded-2xl border transition-all overflow-hidden bg-card ${
                      isActive
                        ? 'border-brand ring-1 ring-brand/40'
                        : 'border-black/10 dark:border-white/10 hover:border-brand/50'
                    }`}
                  >
                    {/* 16:9 预览。padding-top 56.25% = 9/16，兼容所有 WebView 渲染路径 */}
                    <div className="relative w-full bg-muted" style={{ paddingTop: '56.25%' }}>
                      <ThemePreviewCard theme={theme} sdk={propSdk} />
                      {isActive && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-brand-foreground px-2 py-0.5 bg-brand rounded-full">
                          <CheckCircle2 className="size-3" />
                          <span>使用中</span>
                        </span>
                      )}
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{themeTitle}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {theme.author || '自定义导入'}
                          {/* 只支持一档时明说 —— 用户会在头像菜单里发现明暗切换器灰了，
                              这里不写的话他不知道是谁锁的。 */}
                          {modes.length === 1 && (
                            <span className="ml-1.5 px-1.5 py-px rounded bg-muted border border-black/5 dark:border-white/5">
                              仅{modes[0] === 'dark' ? '深色' : '浅色'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyTheme(theme)}
                          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                            isActive
                              ? 'bg-muted text-foreground hover:bg-accent'
                              : 'bg-brand text-brand-foreground hover:bg-brand/90'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <RefreshCw className="size-3.5" />
                              <span>重新应用</span>
                            </>
                          ) : (
                            <span>应用</span>
                          )}
                        </button>

                        {theme.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomTheme(theme.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                            title="删除此皮肤"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * BerryTrace 视图工厂，防范 createRoot 生命周期重复激活问题
 */
export class DreamSkinView {
  private container: HTMLElement;
  private subContainer: HTMLDivElement | null = null;
  private root: Root | null = null;
  private sdk: any;

  constructor(container: HTMLElement, sdk?: any) {
    this.container = container;
    this.sdk = sdk;
  }

  public async onOpen(_params?: Record<string, unknown>): Promise<void> {
    this.render();
  }

  public async onClose(): Promise<void> {
    this.destroy();
  }

  public render() {
    this.destroy();

    this.subContainer = document.createElement('div');
    this.subContainer.className = 'w-full h-full';
    this.container.appendChild(this.subContainer);

    this.root = createRoot(this.subContainer);
    this.root.render(<DreamSkinApp sdk={this.sdk} />);
  }

  public destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.subContainer) {
      this.subContainer.remove();
      this.subContainer = null;
    }
  }
}

/* ══ 头像菜单贡献 ══════════════════════════════════════════════════════════
 *
 * 🔴 这一段**不能依赖插件面板是否打开**。菜单常驻在头像下拉里，而面板可能一次
 * 都没被打开过 —— 那时 `DreamSkinApp` 那个 React 组件根本没挂载，它里面的
 * `themes` / `handleApplyTheme` 全都不存在。
 *
 * 所以菜单这条路自己直接读 `sdk.storage`、自己调 adapter 层，
 * 与面板共用的只有存储键和 adapter 函数（那两样才是真正的单一事实源）。
 */

/** 读已安装皮肤 + 当前生效。菜单展开的那一刻现读。 */
async function readSkinsForMenu(): Promise<{ skins: SkinMenuEntry[]; activeId: string | null }> {
  const sdk = (window as any).berrytracePluginSdk;
  let list: ThemeItem[] = [];
  let activeId: string | null = null;
  try {
    if (sdk?.storage) {
      list = (await sdk.storage.getItem(STORAGE_KEY_CUSTOM_THEMES)) || [];
      const active = await sdk.storage.getItem(STORAGE_KEY_ACTIVE_THEME);
      activeId = active?.themeId ?? null;
    } else {
      const raw = window.localStorage.getItem(STORAGE_KEY_CUSTOM_THEMES);
      if (raw) list = JSON.parse(raw);
      const rawActive = window.localStorage.getItem(STORAGE_KEY_ACTIVE_THEME);
      if (rawActive) activeId = JSON.parse(rawActive)?.themeId ?? null;
    }
  } catch (err) {
    console.warn('🎨 [DreamSkin:Menu] 读皮肤列表失败:', err);
  }
  const skins: SkinMenuEntry[] = (list || []).map((t) => {
    const modes = supportedModesFor(t?.config?.appearance);
    return {
      id: t.id,
      name: t.name || t.id,
      onlyMode: modes.length === 1 ? modes[0] : undefined,
    };
  });
  return { skins, activeId };
}

/** 菜单里点某套皮肤 —— 走与面板完全相同的那条应用链路。 */
async function applySkinFromMenu(themeId: string): Promise<void> {
  const sdk = (window as any).berrytracePluginSdk;
  const { skins } = await readSkinsForMenu();
  if (!skins.some((s) => s.id === themeId)) return;

  let list: ThemeItem[] = [];
  try {
    list = (await sdk?.storage?.getItem(STORAGE_KEY_CUSTOM_THEMES)) || [];
  } catch { /* 下面按空表兜底 */ }
  const item = list.find((t) => t.id === themeId);
  if (!item) {
    console.warn(`🎨 [DreamSkin:Menu] 皮肤 ${themeId} 在存储里找不到，跳过`);
    return;
  }

  const sdkUi = (sdk?.ui ?? null) as (SdkUi & {
    registerPalette?: (d: { id: string; label?: string; attr?: string | null; modes: Array<'light' | 'dark'> }) => boolean;
    setPalette?: (id: string) => void;
  }) | null;
  if (!sdkUi) return;

  const savedImageUrl = await saveWallpaperToDisk(sdk, item.id, item.imageBlobUrl);
  const applied = transformDreamSkinToBerryTrace(item.config, savedImageUrl);
  await applySkinViaSDK(sdkUi, applied, sdk?.plugin);

  // 与面板那条路同一个顺序：先 applySkinViaSDK，再注册色系。
  // 反过来的话明暗收拢用的是旧色系的 modes，表现为「第一次点没锁住」。
  const pid = paletteIdForTheme(item.id);
  const modes = supportedModesFor(item.config?.appearance);
  if (typeof sdkUi.registerPalette === 'function' && typeof sdkUi.setPalette === 'function') {
    if (sdkUi.registerPalette({ id: pid, label: item.name || item.id, attr: pid, modes })) {
      sdkUi.setPalette(pid);
    }
  }

  await sdk?.storage?.setItem(STORAGE_KEY_ACTIVE_THEME, {
    themeId: item.id,
    name: applied.name,
    imageBlobUrl: item.imageBlobUrl,
  });
  sdk?.events?.emit('dream-skin:applied', { themeId: item.id, name: item.name });
}

/** 菜单里点「恢复默认外观」。 */
async function resetAppearanceFromMenu(): Promise<void> {
  const sdk = (window as any).berrytracePluginSdk;
  const sdkUi = (sdk?.ui ?? null) as (SdkUi & {
    unregisterPalette?: (id: string) => boolean;
    setPalette?: (id: string) => void;
  }) | null;
  if (!sdkUi) return;

  const { activeId } = await readSkinsForMenu();
  await clearSkinViaSDK(sdkUi, sdk?.plugin);

  // 摘色系 + 切回内置默认。少这一步的话皮肤的 CSS 清了，
  // 但明暗还被它的 modes 锁着 ——「恢复默认外观」这句话就没兑现。
  if (activeId && typeof sdkUi.unregisterPalette === 'function') {
    sdkUi.unregisterPalette(paletteIdForTheme(activeId));
  }
  if (typeof sdkUi.setPalette === 'function') sdkUi.setPalette('mono');

  await sdk?.storage?.removeItem(STORAGE_KEY_ACTIVE_THEME);
  sdk?.events?.emit('dream-skin:applied', { themeId: null, name: null });
}

/** 菜单里点「主题库」—— 打开插件面板。 */
function openGalleryFromMenu(): void {
  const sdk = (window as any).berrytracePluginSdk;
  try {
    if (typeof sdk?.workspace?.activateView === 'function') {
      sdk.workspace.activateView('dream-skin-view');
      return;
    }
    if (typeof sdk?.workspace?.openView === 'function') {
      sdk.workspace.openView('dream-skin-view');
      return;
    }
    // 两条都没有就派发一条命令，宿主那边有命令注册表兜底。
    sdk?.commands?.execute?.('dream-skin-view');
  } catch (err) {
    console.warn('🎨 [DreamSkin:Menu] 打开主题库失败:', err);
  }
}

/**
 * 把「皮肤」这一条挂进头像下拉菜单。
 *
 * 座位是宿主 0904 新开的 `user-profile-menu:items`（配色之下、分割线之上）。
 * 宿主版本旧时这个座位不存在 —— `registerSlotItem` 对不存在的座位
 * **永远成功且零日志**（CLAUDE.md 六点五之补），所以这里不靠返回值判断，
 * 直接注册即可：座位不在场的后果就是这一格不显示，不会出错。
 */
function registerAvatarMenuItem(): (() => void) | null {
  const sdk = (window as any).berrytracePluginSdk;
  const reg = sdk?.ui?.registerSlotItem;
  if (typeof reg !== 'function') {
    console.warn('🎨 [DreamSkin] 宿主没有 ui.registerSlotItem，跳过头像菜单贡献');
    return null;
  }
  try {
    const dispose = reg({
      slotId: 'user-profile-menu:items',
      id: 'dream-skin:menu',
      priority: 50,
      title: '皮肤',
      render: () =>
        React.createElement(SkinMenuItem, {
          readState: () => {
            // SkinMenuItem 要的是同步返回值，而读存储是异步的。
            // 用一份**上一次读到的**缓存先画出来，同时发起刷新 ——
            // 菜单是 hover 展开的，第二次展开就一定是新的了。
            void readSkinsForMenu().then((v) => { menuStateCache = v; });
            return menuStateCache;
          },
          onOpenGallery: openGalleryFromMenu,
          onResetAppearance: () => { void resetAppearanceFromMenu(); },
          onApplySkin: (id: string) => { void applySkinFromMenu(id); },
        }),
    });
    // 先热一次缓存，让第一次展开就有内容。
    void readSkinsForMenu().then((v) => { menuStateCache = v; });
    return typeof dispose === 'function' ? dispose : null;
  } catch (err) {
    console.warn('🎨 [DreamSkin] 注册头像菜单条目失败:', err);
    return null;
  }
}

/** 菜单状态的一份快照。见 registerAvatarMenuItem 里 readState 的说明。 */
let menuStateCache: { skins: SkinMenuEntry[]; activeId: string | null } = { skins: [], activeId: null };

/**
 * BerryTrace 插件 View 进程入口文件类
 *
 * 注：主题 CSS 恢复无需在此处处理。
 * 宿主 SkinLayer 在步骤 2（插件系统启动之前）已从 persistStyle 存储中
 * 自动恢复所有 Skin CSS，DreamSkin 用户看到的界面是零闪烁的。
 */
export class DreamSkinViewPlugin {
  public app: any;
  public manifest: any;
  /** 头像菜单那一格的注销函数。onunload 必须调，否则插件卸载后菜单里留个死条目。 */
  private _disposeMenu: (() => void) | null = null;

  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  public async onload(): Promise<void> {
    console.log('🎨 [DreamSkin:ViewPlugin] 正在注册视图 dream-skin-view...');
    try {
      if (this.app?.workspace?.registerView) {
        this.app.workspace.registerView('dream-skin-view', DreamSkinView);
      } else if (this.app?.registerView) {
        this.app.registerView('dream-skin-view', DreamSkinView);
      } else if (typeof window !== 'undefined' && window.berrytrace?.workspace?.registerView) {
        window.berrytrace.workspace.registerView('dream-skin-view', DreamSkinView);
      }
      // 头像下拉菜单里挂一条「皮肤」（含二级菜单）。
      // 它不依赖面板是否打开 —— 面板可能一次都没被打开过。
      this._disposeMenu = registerAvatarMenuItem();

      // 主题由宿主 SkinLayer 在启动时 step 2 自动恢复，此处无需手动重放
      console.log('🎨 [DreamSkin:ViewPlugin] 视图注册完成，SkinLayer 已自动恢复上次主题。');
    } catch (err) {
      console.error('🚨 [DreamSkin:ViewPlugin] 注册视图失败:', err);
    }
  }

  public async onunload(): Promise<void> {
    console.log('🎨 [DreamSkin:ViewPlugin] 注销视图: dream-skin-view');
    try {
      this._disposeMenu?.();
      this._disposeMenu = null;
    } catch (err) {
      console.warn('🚨 [DreamSkin:ViewPlugin] 注销头像菜单条目失败:', err);
    }
    try {
      if (this.app?.workspace?.unregisterView) {
        this.app.workspace.unregisterView('dream-skin-view');
      } else if (this.app?.unregisterView) {
        this.app.unregisterView('dream-skin-view');
      }
    } catch (err) {
      console.error('🚨 [DreamSkin:ViewPlugin] 注销 dream-skin-view 失败:', err);
    }
  }
}

export default DreamSkinViewPlugin;

