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

declare const window: any;

export interface ThemeItem {
  id: string;
  name: string;
  author: string;
  isCustom?: boolean;
  config: DreamSkinThemeConfig;
  themeCss?: string;
  imageBlobUrl?: string;
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col h-full w-full bg-transparent text-foreground p-5 overflow-y-auto space-y-5 text-left transition-all ${
        isDragging ? 'ring-2 ring-brand ring-inset bg-brand/5' : ''
      }`}
    >
      {/* 拖拽全屏高亮 Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md border-2 border-dashed border-brand p-8 text-center pointer-events-none rounded-xl">
          <FileArchive className="w-14 h-14 text-brand animate-bounce mb-3" />
          <h2 className="text-base font-bold text-foreground">松开鼠标自动安装 DreamSkin 主题包</h2>
          <p className="text-xs text-muted-foreground mt-1">支持拖拽 .zip 完整资源包或 theme.json</p>
        </div>
      )}

      {/* 顶部标题与全局控制区 (符合 BerryTrace SettingsModal 标准 Card 样式) */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-brand/15 text-brand rounded-2xl border border-brand/20 shrink-0 shadow-2xs">
              <Palette className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight tracking-tight">DreamSkin 主题皮肤中心</h3>
              <p className="text-xs text-muted-foreground mt-1">
                完美兼容 DreamSkin (.zip / theme.json) 资源包，拖拽即装，秒级实时应用
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-brand text-brand-foreground rounded-xl hover:bg-brand/90 transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="size-4" />
              <span>选择 .zip 主题包</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-black/10 dark:border-white/10 bg-muted text-foreground rounded-xl hover:bg-accent transition-all cursor-pointer"
              title="恢复 BerryTrace 原生默认外观"
            >
              <RotateCcw className="size-4" />
              <span>恢复默认外观</span>
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

        {/* 宽敞大气的 ZIP 拖拽上传区域 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-brand bg-brand/10 scale-[1.01]'
              : 'border-black/15 dark:border-white/15 bg-muted hover:border-brand/60 hover:bg-brand/5 shadow-2xs'
          }`}
        >
          <div className="size-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <FileArchive className="size-5 text-brand" />
          </div>
          <div className="text-xs font-bold text-foreground">
            点击或拖拽 DreamSkin 皮肤包 (.zip / theme.json) 到此处安装
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            自动校验 manifest、theme.json 规范及背景图，一键完成解包与存储
          </div>
        </div>
      </div>

      {/* 状态通知与操作引导条 */}
      <div className="flex items-center justify-between text-xs px-4 py-3 rounded-2xl bg-card border border-black/10 dark:border-white/10 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand shrink-0 animate-pulse" />
          <span className="font-medium text-foreground">{statusMessage}</span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
          拖拽 .zip 文件至界面任意位置即可直接安装
        </span>
      </div>

      {/* 主题列表分组 */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 m-0 uppercase tracking-wider">
            <Brush className="size-4 text-brand" />
            <span>已安装的主题皮肤 ({themes.length})</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme, idx) => {
            if (!theme) return null;
            const uniqueKey = theme.id ? `theme-${theme.id}-${idx}` : `theme-item-${idx}`;
            const isActive = activeThemeId === theme.id;
            const themeTitle = theme.name || theme.config?.name || theme.id || `主题 ${idx + 1}`;
            const themeAuthor = theme.author || '自定义导入';
            return (
              <div
                key={uniqueKey}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all shadow-2xs bg-card ${
                  isActive
                    ? 'border-brand ring-2 ring-brand/50 bg-brand/10 shadow-md'
                    : 'border-black/10 dark:border-white/10 hover:border-brand/50 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-foreground truncate">{themeTitle}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {theme.isCustom ? '自定义导入包' : `创作者: ${themeAuthor}`}
                      </div>
                    </div>

                    {isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-brand px-2.5 py-0.5 bg-brand/15 border border-brand/25 rounded-full shrink-0">
                        <CheckCircle2 className="size-3" />
                        <span>使用中</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground px-2.5 py-0.5 bg-muted border border-black/5 dark:border-white/5 rounded-full shrink-0">
                        {theme.isCustom ? '自定义' : '预设'}
                      </span>
                    )}
                  </div>

                  {/* 16:9 大尺寸高清壁纸预览 — padding-top 56.25% = 9/16，兼容所有 WebView 渲染路径 */}
                  <div className="relative w-full rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-muted group shadow-2xs" style={{ paddingTop: '56.25%' }}>
                    <ThemePreviewCard theme={theme} sdk={propSdk} />
                  </div>
                </div>

                {/* 底部操作工具行 */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleApplyTheme(theme)}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-brand text-brand-foreground hover:bg-brand/90 shadow-2xs'
                        : 'bg-muted text-foreground hover:bg-brand hover:text-brand-foreground'
                    }`}
                  >
                    {isActive ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="size-3.5" />
                        <span>重新应用</span>
                      </span>
                    ) : (
                      <span>应用此主题</span>
                    )}
                  </button>

                  {theme.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomTheme(theme.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                      title="删除此自定义主题"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
      // 主题由宿主 SkinLayer 在启动时 step 2 自动恢复，此处无需手动重放
      console.log('🎨 [DreamSkin:ViewPlugin] 视图注册完成，SkinLayer 已自动恢复上次主题。');
    } catch (err) {
      console.error('🚨 [DreamSkin:ViewPlugin] 注册视图失败:', err);
    }
  }

  public async onunload(): Promise<void> {
    console.log('🎨 [DreamSkin:ViewPlugin] 注销视图: dream-skin-view');
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

