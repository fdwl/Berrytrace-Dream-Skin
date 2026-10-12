/**
 * 已装皮肤列表 + 当前生效皮肤的唯一读写点。
 *
 * 只认宿主 `sdk.storage`（全局、按插件分库）；面板、头像菜单、后台 main 都从这里读写，
 * 调用方不分支。宿主没有 `sdk.storage`（太老）时一律当空，不退 localStorage。
 *
 * 存的图片信息是相对的：`skinDir`（skin 根目录下的目录名）+ `imageFile`（目录内相对路径）。
 * 绝对 URL（berrytrace-plugin://local-file/…）不落盘，加载时用
 * `getSafePath('skin')` + skinDir + imageFile 现拼，主目录搬家 / 目录被删都不会留下坏链接。
 *
 * 列表以磁盘为准：`loadSkinsFromDisk` 逐个核对图片文件在不在，缺的分到 `missing`，
 * 由调用方问用户（重新下载 / 移除），这里从不静默删除、静默重下。
 */

import {
  formatPluginResourceUrl,
  getSkinRootDir,
  type DreamSkinThemeConfig,
} from './theme-adapter';
import { imageRelPath, partitionByDisk } from './skin-disk-check';

export const STORAGE_KEY_SKINS = 'berrytrace_dream_skin_custom_themes';
export const STORAGE_KEY_ACTIVE = 'berrytrace_dream_skin_active';

/** 落盘的形状。没有任何 URL 字段。 */
export interface StoredSkin {
  id: string;
  name: string;
  author: string;
  isCustom?: boolean;
  config: DreamSkinThemeConfig;
  themeCss?: string;
  /** skin 根目录下的目录名（ver_xxx / 导入包名 / wallpapers）。 */
  skinDir?: string;
  /** 背景图在 skinDir 内的相对路径。 */
  imageFile?: string;
  /** 主题库版本 id（ver_…）；手动导入的包没有。 */
  versionId?: string;
}

/** 加载后的形状：多一个运行期现拼的预览 URL（不落盘）。 */
export interface LoadedSkin extends StoredSkin {
  imageBlobUrl?: string;
}

export interface StoredActive {
  themeId: string;
  name?: string;
}

/** 去掉运行期字段，得到可以落盘的形状。 */
export function toStoredSkin(skin: LoadedSkin): StoredSkin {
  const { imageBlobUrl: _runtimeUrl, ...stored } = skin;
  return stored;
}

function storageOf(sdk: any): any {
  return sdk?.storage && typeof sdk.storage.getItem === 'function' ? sdk.storage : null;
}

export async function readStoredSkins(sdk: any): Promise<StoredSkin[]> {
  const storage = storageOf(sdk);
  if (!storage) return [];
  try {
    const v = await storage.getItem(STORAGE_KEY_SKINS);
    return Array.isArray(v) ? (v as StoredSkin[]) : [];
  } catch (err) {
    console.warn('🎨 [DreamSkin:Store] 读皮肤列表失败:', err);
    return [];
  }
}

export async function writeStoredSkins(sdk: any, skins: StoredSkin[]): Promise<void> {
  const storage = storageOf(sdk);
  if (!storage) return;
  await storage.setItem(STORAGE_KEY_SKINS, skins);
}

export async function readActive(sdk: any): Promise<StoredActive | null> {
  const storage = storageOf(sdk);
  if (!storage) return null;
  try {
    const v = await storage.getItem(STORAGE_KEY_ACTIVE);
    return v && typeof v === 'object' && (v as StoredActive).themeId ? (v as StoredActive) : null;
  } catch (err) {
    console.warn('🎨 [DreamSkin:Store] 读当前皮肤失败:', err);
    return null;
  }
}

/** `null` = 清除当前生效记录。 */
export async function writeActive(sdk: any, active: StoredActive | null): Promise<void> {
  const storage = storageOf(sdk);
  if (!storage) return;
  if (active) await storage.setItem(STORAGE_KEY_ACTIVE, active);
  else await storage.removeItem(STORAGE_KEY_ACTIVE);
}

export async function clearStore(sdk: any): Promise<void> {
  const storage = storageOf(sdk);
  if (!storage) return;
  await storage.removeItem(STORAGE_KEY_SKINS);
  await storage.removeItem(STORAGE_KEY_ACTIVE);
}

/** skin 根目录下的相对路径 → berrytrace-plugin:// 预览 URL。 */
export function buildImageUrl(skinRoot: string, skin: StoredSkin): string | undefined {
  const rel = imageRelPath(skin);
  if (!rel || !skinRoot) return undefined;
  return formatPluginResourceUrl(`${skinRoot.replace(/\\/g, '/')}/${rel}`);
}

/** 磁盘上这个文件在不在。stat 对不存在的路径会抛。 */
async function fileExists(fs: any, absPath: string): Promise<boolean> {
  try {
    const st = await fs.stat(absPath);
    return !!st?.isFile;
  } catch {
    return false;
  }
}

/**
 * 读已存列表并核对磁盘。
 * - `ok`：图片在（或本来就没图片）的皮肤，已带上现拼的 `imageBlobUrl`；
 * - `missing`：图片文件缺了，原样返回（不删、不改），交调用方处理；
 * - `stored`：存储里的完整原始列表（写回时 missing 条目要带上，否则等于静默删除）。
 * 宿主没有 filesystem.stat / getSafePath 时验不了盘，三组全空（不展示、不询问）。
 */
export async function loadSkinsFromDisk(
  sdk: any,
): Promise<{ ok: LoadedSkin[]; missing: StoredSkin[]; stored: StoredSkin[] }> {
  const stored = await readStoredSkins(sdk);
  if (!stored.length) return { ok: [], missing: [], stored };

  const fs = sdk?.filesystem;
  const skinRoot = typeof fs?.stat === 'function' ? (await getSkinRootDir(sdk)).replace(/\\/g, '/') : '';
  if (!skinRoot) {
    console.warn('🎨 [DreamSkin:Store] 宿主没有 filesystem.stat / getSafePath，无法核对磁盘，皮肤列表按空处理');
    return { ok: [], missing: [], stored };
  }

  const rels = Array.from(new Set(stored.map(imageRelPath).filter((r): r is string => r !== null)));
  const present = new Set<string>();
  await Promise.all(
    rels.map(async (rel) => {
      if (await fileExists(fs, `${skinRoot}/${rel}`)) present.add(rel);
    }),
  );

  const { ok, missing } = partitionByDisk(stored, present);
  return {
    ok: ok.map((s) => ({ ...s, imageBlobUrl: buildImageUrl(skinRoot, s) })),
    missing,
    stored,
  };
}
