/**
 * DreamSkin Resource Package Importer
 * 
 * 负责解析 DreamSkin 主题包格式 (.zip 或目录解压后的 JSON + Image):
 * - manifest.json (包元数据)
 * - theme.json (主题配置)
 * - background.png / background.webp (图片素材)
 */

import JSZip from 'jszip';
import type { DreamSkinThemeConfig } from './theme-adapter';

export interface DreamSkinManifest {
  packageVersion?: number;
  themeId: string;
  version: string;
  skinApiVersion?: number;
  minClientVersion?: string;
  publisher?: {
    id?: string;
    displayName?: string;
  };
  license?: string;
  provenance?: {
    aiGenerated?: boolean;
    summary?: string;
  };
  files?: Array<{
    path: string;
    mediaType?: string;
    bytes?: number;
    sha256?: string;
  }>;
  createdAt?: string;
}

export interface DreamSkinPackage {
  manifest?: DreamSkinManifest;
  theme: DreamSkinThemeConfig;
  imageBlobUrl?: string;
  imageBase64?: string;
}

/**
 * 从 .zip 文件或 Blob 中解压并解析 DreamSkin 主题包
 */
export async function parseDreamSkinZip(zipFile: File | Blob): Promise<DreamSkinPackage> {
  const zip = await JSZip.loadAsync(zipFile);

  // 1. 查找 theme.json (可能存放在根目录或子文件夹下)
  let themeZipEntry = zip.file('theme.json');
  if (!themeZipEntry) {
    const found = zip.file(/theme\.json$/i);
    if (found && found.length > 0) {
      themeZipEntry = found[0];
    }
  }

  if (!themeZipEntry) {
    throw new Error('无效的 DreamSkin 资源包：未包含 theme.json 配置文件');
  }

  const themeJsonText = await themeZipEntry.async('string');
  const theme: DreamSkinThemeConfig = JSON.parse(themeJsonText);

  if (!theme || !theme.id) {
    throw new Error('DreamSkin 主题配置无效：缺少 theme.id');
  }

  // 2. 尝试读取 manifest.json
  let manifest: DreamSkinManifest | undefined;
  let manifestZipEntry = zip.file('manifest.json') || zip.file(/manifest\.json$/i)[0];
  if (manifestZipEntry) {
    try {
      const manifestText = await manifestZipEntry.async('string');
      manifest = JSON.parse(manifestText);
    } catch {
      // 忽略非致命的 manifest 错误
    }
  }

  // 3. 读取背景图片素材
  let imageBlobUrl: string | undefined;
  const targetImgName = theme.image || 'background.png';
  let imgZipEntry = zip.file(targetImgName) || zip.file(new RegExp(`${targetImgName}$`, 'i'));

  if (!imgZipEntry) {
    // 降级匹配常用的背景图拓展名
    const fallbackImg = zip.file(/\.(png|jpg|jpeg|webp)$/i);
    if (fallbackImg && fallbackImg.length > 0) {
      imgZipEntry = fallbackImg[0];
    }
  }

  if (imgZipEntry) {
    const imgBase64 = await imgZipEntry.async('base64');
    const ext = imgZipEntry.name.split('.').pop()?.toLowerCase() || 'png';
    const mime = ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    imageBlobUrl = `data:${mime};base64,${imgBase64}`;
  }

  return {
    manifest,
    theme,
    imageBlobUrl,
  };
}

/**
 * 从纯 JSON 文本构建包
 */
export function buildDreamSkinPackage(
  themeJsonText: string,
  manifestJsonText?: string,
  imageUri?: string
): DreamSkinPackage {
  const theme: DreamSkinThemeConfig = JSON.parse(themeJsonText);
  let manifest: DreamSkinManifest | undefined;

  if (manifestJsonText) {
    try {
      manifest = JSON.parse(manifestJsonText);
    } catch {}
  }

  if (!theme || typeof theme !== 'object' || !theme.id) {
    throw new Error('无效的 DreamSkin 主题配置：缺少必要的 theme.id 字段');
  }

  return {
    manifest,
    theme,
    imageBlobUrl: imageUri,
  };
}
