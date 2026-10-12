/**
 * 「哪些已存皮肤的图片在磁盘上缺了」的纯判定。
 *
 * 探测（问磁盘文件在不在）在 theme-store.ts，判定（缺了意味着什么）在这里。
 * 这里不碰 sdk、不碰 window，可以直接用合成输入跑 node 脚本验证
 * （plugin/scripts/verify-skin-disk-check.mjs）。
 *
 * 存的是相对信息：skinDir（skin 根目录下的目录名，如 ver_xxx）+ imageFile（该目录内的相对路径）。
 * 绝对路径 / URL 一律不存，数据主目录搬家后才不会失效。
 */

import { VERSION_ID_RE } from './dreamskin-api';

export interface SkinImageRef {
  /** skin 根目录下的目录名。 */
  skinDir?: string;
  /** 背景图在 skinDir 内的相对路径（可含子目录，如 `pack/background.png`）。 */
  imageFile?: string;
  /** 主题库版本 id（ver_…）。 */
  versionId?: string;
}

/** 相对 skin 根目录的图片路径；没有图片信息（纯色皮肤）返回 null。 */
export function imageRelPath(skin: SkinImageRef): string | null {
  if (!skin.skinDir || !skin.imageFile) return null;
  return `${skin.skinDir}/${skin.imageFile}`.replace(/\\/g, '/');
}

/**
 * 把已存皮肤分成「图片在」和「图片缺」两组。
 * 没有图片信息的皮肤（纯色）视为在 —— 没有文件可缺。
 * `present` 里没出现的相对路径一律当缺。
 */
export function partitionByDisk<T extends SkinImageRef>(
  skins: T[],
  present: ReadonlySet<string>,
): { ok: T[]; missing: T[] } {
  const ok: T[] = [];
  const missing: T[] = [];
  for (const s of skins) {
    const rel = imageRelPath(s);
    if (rel === null || present.has(rel)) ok.push(s);
    else missing.push(s);
  }
  return { ok, missing };
}

/** 能重新下载的版本 id；手动导入的包没有，返回 null。 */
export function redownloadVersionId(skin: SkinImageRef): string | null {
  if (skin.versionId && VERSION_ID_RE.test(skin.versionId)) return skin.versionId;
  if (skin.skinDir && VERSION_ID_RE.test(skin.skinDir)) return skin.skinDir;
  return null;
}

/** 缺失的皮肤再按「能不能重新下载」分两组。 */
export function splitRedownloadable<T extends SkinImageRef>(
  missing: T[],
): { redownloadable: Array<{ skin: T; versionId: string }>; manualOnly: T[] } {
  const redownloadable: Array<{ skin: T; versionId: string }> = [];
  const manualOnly: T[] = [];
  for (const skin of missing) {
    const versionId = redownloadVersionId(skin);
    if (versionId) redownloadable.push({ skin, versionId });
    else manualOnly.push(skin);
  }
  return { redownloadable, manualOnly };
}
