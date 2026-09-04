/**
 * dreamskin-api.ts —— dreamskin.cc 的 v1 接口
 *
 * ═══ 0904 实测出来的接口形状 ═══════════════════════════════════════════════
 *
 * `GET https://api.dreamskin.cc/v1/themes/<versionId>` →
 * ```json
 * {
 *   "id": "ver_83b692cc22ee42d33224",
 *   "name": "安妮亚 无限城",
 *   "slug": "spy-1", "themeId": "spy-1", "version": "0.1.0",
 *   "applyCompatible": true,
 *   "authorDisplayName": "…", "license": "DGON",
 *   "packageBytes": 66103,
 *   "packageSha256": "e74785ff…",
 *   "displayMeta": { "appearance": "auto", "platforms": ["macos","windows"],
 *                    "colors": {…}, "art": {…} },
 *   "downloadCount": 37, "favoriteCount": 0
 * }
 * ```
 *
 * `GET https://api.dreamskin.cc/v1/themes/<versionId>/download` → `application/zip`
 * （实测 66103 字节，sha256 与 `packageSha256` 逐字节对上）
 *
 * 🔴 **两个接口都不发 CORS 头**（实测：响应里只有 `content-type`）。
 * ⇒ 渲染层直接 `fetch()` **会被浏览器挡住**，而且报的是「Failed to fetch」，
 *   看着像网络断了，跟真的断网分不出来。
 * ⇒ 必须走宿主的主进程通道：`sdk.filesystem.downloadFile(url, destPath)`
 *   底下是 Electron 的 `net.fetch`，主进程发起，**没有 CORS 这回事**。
 *   （实现：electron/plugins/controllers/storage.ts 的 filesystem_downloadFile）
 *
 * `displayMeta.appearance` 就是「这套皮肤只支持哪一档明暗」——
 * `'dark'` / `'light'` / `'auto'`。宿主 0904 起支持把它锁死
 * （`sdk.ui.registerPalette({ modes })`），见 view/index.tsx 的 applyThemeItem。
 */

/** 接口基址。站点自己也是硬编码这一个（bundle 里 `nv()` 恒返回它）。 */
export const DREAMSKIN_API_BASE = 'https://api.dreamskin.cc';

/** 主题库页面。 */
export const DREAMSKIN_GALLERY_URL = 'https://dreamskin.cc/gallery';

/** 站点首页。免责声明那一页用它，且**只在系统浏览器里打开**（不嵌、不进内置窗口）。 */
export const DREAMSKIN_SITE_URL = 'https://dreamskin.cc';

/**
 * 版本 id 的形状。与站点自己那条正则一致（bundle 里的 `lv`）。
 * 校验它是必需的：这个字符串会被拼进 URL，也会被拿去当色系 id。
 */
export const VERSION_ID_RE = /^ver_[a-z0-9]{8,64}$/;

export interface DreamSkinThemeMeta {
  id: string;
  name: string;
  slug?: string;
  themeId?: string;
  version?: string;
  applyCompatible?: boolean;
  authorDisplayName?: string;
  license?: string;
  packageBytes?: number;
  packageSha256?: string;
  displayMeta?: {
    appearance?: 'light' | 'dark' | 'auto';
    platforms?: string[];
    colors?: Record<string, string>;
    art?: Record<string, unknown>;
  };
  downloadCount?: number;
  favoriteCount?: number;
}

export function themeMetaUrl(versionId: string): string {
  return `${DREAMSKIN_API_BASE}/v1/themes/${encodeURIComponent(versionId)}`;
}

export function themeDownloadUrl(versionId: string): string {
  return `${DREAMSKIN_API_BASE}/v1/themes/${encodeURIComponent(versionId)}/download`;
}

/**
 * 交给 `sdk.ui.interceptDownloads()` 的模式。
 *
 * 用户在站点上点它自己的「下载」时，Chromium 会走原生下载流程
 * （弹保存框、落到下载目录、然后什么也不会发生）。登记这条之后，
 * 那次下载被拦下来直接进我们的安装流程。
 *
 * ⚠️ `*` 不吃斜杠，所以这条只匹配 `/v1/themes/<一段>/download`，
 * 不会把 `/v1/themes/a/b/download` 之类的意外形状也吞掉。
 */
export const DOWNLOAD_INTERCEPT_PATTERNS = [
  `${DREAMSKIN_API_BASE}/v1/themes/*/download`,
];

/** 从任意 dreamskin 地址里抠版本 id（下载地址、详情页地址、dreamskin:// 都认）。 */
export function extractVersionId(input: string): string | null {
  if (typeof input !== 'string') return null;
  const m = input.match(/(ver_[a-z0-9]{8,64})/i);
  if (!m) return null;
  const v = m[1].toLowerCase();
  return VERSION_ID_RE.test(v) ? v : null;
}

type SdkLike = {
  filesystem?: {
    downloadFile?: (url: string, destPath: string) => Promise<unknown>;
    readFile?: (path: string, encoding?: string) => Promise<string>;
    removeFile?: (path: string) => Promise<unknown>;
    exists?: (path: string) => Promise<boolean>;
  };
  ai?: {
    fetchServiceCatalog?: (opts: { baseUrl: string; path: string }) => Promise<{
      ok?: boolean;
      status?: number;
      data?: unknown;
      error?: string;
    }>;
  };
};

/**
 * 取一个版本的元信息。
 *
 * 走宿主的 `sdk.ai.fetchServiceCatalog` —— 别被名字骗了，它就是一个
 * **主进程 GET 代理**（`electron/plugins/controllers/ai.ts`），返回
 * `{ok,status,data,error}`，没有 CORS 约束。这是当前 SDK 里唯一一个
 * 通用的、能拿回 JSON 的主进程 GET。
 *
 * 拿不到时**不抛**，返回 null —— 元信息只是锦上添花（用来锁明暗档、
 * 校验 sha256、拿作者名）。拿不到照样能装：包自己带 `manifest.json` 和
 * `theme.json`，那才是必需的那份。
 */
export async function fetchThemeMeta(
  sdk: SdkLike | undefined,
  versionId: string,
): Promise<DreamSkinThemeMeta | null> {
  if (!VERSION_ID_RE.test(versionId)) return null;
  const proxy = sdk?.ai?.fetchServiceCatalog;
  if (typeof proxy !== 'function') {
    console.warn('[DreamSkin:api] 宿主没有 ai.fetchServiceCatalog，跳过元信息（不影响安装）');
    return null;
  }
  try {
    const res = await proxy({
      baseUrl: DREAMSKIN_API_BASE,
      path: `/v1/themes/${encodeURIComponent(versionId)}`,
    });
    if (!res?.ok || !res.data) {
      console.warn(`[DreamSkin:api] 元信息 HTTP ${res?.status ?? '?'}：${res?.error ?? ''}`);
      return null;
    }
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    return data as DreamSkinThemeMeta;
  } catch (err) {
    console.warn('[DreamSkin:api] 取元信息失败（不影响安装）:', err);
    return null;
  }
}

/**
 * 把主题包下到磁盘，返回落点路径。
 *
 * 🔴 必须走 `sdk.filesystem.downloadFile`（主进程 net.fetch）。
 * 渲染层 `fetch()` 会被 CORS 挡住，而报的是「Failed to fetch」——
 * 跟真的断网一模一样，查不出来。
 */
export async function downloadThemePackage(
  sdk: SdkLike | undefined,
  versionId: string,
  destPath: string,
): Promise<string> {
  const dl = sdk?.filesystem?.downloadFile;
  if (typeof dl !== 'function') {
    throw new Error('宿主未提供 filesystem.downloadFile —— 无法下载主题包');
  }
  await dl(themeDownloadUrl(versionId), destPath);
  return destPath;
}

/**
 * 校验下载下来的包与元信息里的 `packageSha256` 是否一致。
 *
 * 返回值三态，**故意不是布尔**：
 *   · `'ok'`       —— 算出来了且对得上；
 *   · `'mismatch'` —— 算出来了但对不上 ⇒ 包坏了或被掉包，必须拒装；
 *   · `'skipped'`  —— 没法算（元信息没拿到 / 环境没有 crypto.subtle）。
 *
 * 🔴 两态布尔在这里是**危险**的：把 `'skipped'` 和 `'ok'` 并成 true，
 * 等于「校验不了就当校验过了」；并成 false 则等于「拿不到元信息就装不了」。
 * 两种都不对，所以让调用方自己决定 skipped 怎么办（当前实现：放行 + 出声）。
 */
export type ChecksumVerdict = 'ok' | 'mismatch' | 'skipped';

export async function verifyPackageChecksum(
  bytes: ArrayBuffer | Uint8Array | null | undefined,
  expectedSha256: string | undefined | null,
): Promise<ChecksumVerdict> {
  if (!expectedSha256 || !/^[0-9a-f]{64}$/i.test(expectedSha256)) return 'skipped';
  if (!bytes) return 'skipped';
  const subtle = (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle;
  if (!subtle) return 'skipped';
  try {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    // BufferSource 在不同 TS lib 下对 Uint8Array<ArrayBufferLike> 的收敛不一致，
    // 这里显式转成一段独立的 ArrayBuffer，避开那条纯类型层面的分歧。
    const buf = view.slice().buffer as ArrayBuffer;
    const digest = await subtle.digest('SHA-256', buf);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex === expectedSha256.toLowerCase() ? 'ok' : 'mismatch';
  } catch (err) {
    console.warn('[DreamSkin:api] sha256 计算失败:', err);
    return 'skipped';
  }
}

/**
 * 这套皮肤锁不锁明暗。
 *
 * `appearance` 是 `theme.json` 里的字段（包内），元信息里也有一份镜像
 * （`displayMeta.appearance`）。两份都可能缺，缺就按 `'auto'`（不锁）。
 *
 * 判据故意写成纯函数：它决定「明暗切换器要不要置灰」，
 * 而那件事在真实运行里只有装了皮肤才走得到 —— 抠出来才喂得动全部分支。
 */
export function supportedModesFor(
  appearance: string | undefined | null,
): Array<'light' | 'dark'> {
  if (appearance === 'dark') return ['dark'];
  if (appearance === 'light') return ['light'];
  // 'auto' 与任何认不出来的值都按「两档都支持」——
  // 锁错方向的代价是用户切不了明暗且找不到原因，比不锁严重得多。
  return ['light', 'dark'];
}
