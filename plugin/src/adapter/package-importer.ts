/**
 * DreamSkin Resource Package Importer
 * 
 * 负责解析 DreamSkin 主题包格式 (.zip 或目录解压后的 JSON + Image):
 * - manifest.json (包元数据)
 * - theme.json (主题配置)
 * - background.png / background.webp (图片素材)
 */

import JSZip from 'jszip';
import { formatPluginResourceUrl, type DreamSkinThemeConfig } from './theme-adapter';

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
  themeCss?: string;
  imageBlobUrl?: string;
  imageBase64?: string;
}

/**
 * 使用宿主原生的 sdk.filesystem.extractZip 原生解压与安装主题包
 * 优点：直接解压落盘，避免任何 Base64 转换与内存开销，返回纯净的 file:// 磁盘路径
 */
export async function installThemeZipNative(
  sdk: any,
  file: File
): Promise<DreamSkinPackage> {
  const fs = sdk?.filesystem;
  if (!fs?.extractZip || !fs?.getSafePath) {
    console.log('🎨 [DreamSkin:Importer] 宿主未提供 extractZip / getSafePath 原生接口，降级走前端 JSZip 解压模式');
    return parseDreamSkinZip(file);
  }

  console.log(`🎨 [DreamSkin:Importer] ======== 开始原生 Zip 解压流程: ${file.name} (大小: ${file.size} 字节) ========`);

  // 1. 将 File 暂存至宿主 temp 目录
  const tempDir = await fs.getSafePath('temp');
  const tempZipPath = `${tempDir}/${file.name}`;
  console.log(`🎨 [DreamSkin:Importer] [步骤 1/5] 写入临时 Zip 文件: ${tempZipPath}`);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(tempZipPath, new Uint8Array(arrayBuffer));

  // 2. 解压至 ~/.berrytrace/skin/<themeId> 目录
  let skinRootDir = '';
  try {
    skinRootDir = await fs.getSafePath('skin');
    console.log(`🎨 [DreamSkin:Importer] [步骤 2/5] 物理皮肤保存根目录 (getSafePath 'skin'): ${skinRootDir}`);
  } catch (err1) {
    try {
      skinRootDir = await fs.getSafePath('skins');
      console.log(`🎨 [DreamSkin:Importer] [步骤 2/5] 物理皮肤保存根目录 (getSafePath 'skins'): ${skinRootDir}`);
    } catch (err2) {
      try {
        const home = await fs.getSafePath('berrytraceHome');
        skinRootDir = `${home}/skin`;
        console.log(`🎨 [DreamSkin:Importer] [步骤 2/5] 物理皮肤保存根目录 (berrytraceHome/skin 拼接): ${skinRootDir}`);
      } catch (err3) {
        const pluginDataDir = await fs.getSafePath('pluginData');
        skinRootDir = pluginDataDir.replace(/[\/\\]data[\/\\][^\/\\]+$/, '/skin');
        console.log(`🎨 [DreamSkin:Importer] [步骤 2/5] 物理皮肤保存根目录 (pluginData 逆向推导): ${skinRootDir}`);
      }
    }
  }

  const rawId = file.name.replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const themeDir = `${skinRootDir}/${rawId}`;
  console.log(`🎨 [DreamSkin:Importer] [步骤 3/5] 本包目标解压目录: ${themeDir}`);
  await fs.mkdir(themeDir).catch(() => {});

  // 调用宿主原生 extractZip（内置 Zip Slip 安全防范）
  console.log(`🎨 [DreamSkin:Importer] [步骤 4/5] 正在调用宿主 fs.extractZip("${tempZipPath}", "${themeDir}")...`);
  await fs.extractZip(tempZipPath, themeDir, true);
  console.log(`🎨 [DreamSkin:Importer] ✅ 宿主原生 extractZip 解压完成！已落盘至: ${themeDir}`);

  // 打印解压目录下的顶级文件/文件夹列表，方便开发者在 Debug 控制台直接查验路径结构
  let rootItems: any[] = [];
  try {
    rootItems = await fs.readDir(themeDir);
    const itemList = rootItems.map((item: any) => `${item.name}${item.isDirectory ? '/' : ''}`).join(', ');
    console.log(`🎨 [DreamSkin:Importer] 📂 查验解压目录包含 (${rootItems.length} 项): [${itemList}]`);
  } catch (e) {
    console.warn(`🎨 [DreamSkin:Importer] 无法列出目录内容:`, e);
  }

  // 3. 查找并读取 theme.json (支持根目录或一层子目录)
  let themeConfig: DreamSkinThemeConfig | null = null;
  let targetDir = themeDir;
  const themeJsonPath = `${themeDir}/theme.json`;
  
  try {
    const jsonStr = await fs.readFile(themeJsonPath, 'utf8');
    themeConfig = JSON.parse(jsonStr);
    console.log(`🎨 [DreamSkin:Importer] ✅ 在根目录找到配置文件 theme.json: ${themeJsonPath}`);
  } catch {
    console.log(`🎨 [DreamSkin:Importer] 根目录未直接找到 theme.json，正在检索一级子目录...`);
    for (const item of rootItems) {
      if (item.isDirectory) {
        const subJsonPath = `${themeDir}/${item.name}/theme.json`;
        try {
          const subJson = await fs.readFile(subJsonPath, 'utf8');
          themeConfig = JSON.parse(subJson);
          targetDir = `${themeDir}/${item.name}`;
          console.log(`🎨 [DreamSkin:Importer] ✅ 在子目录 [${item.name}] 中成功找到 theme.json！校准真实主题目录为: ${targetDir}`);
          break;
        } catch {}
      }
    }
  }

  if (!themeConfig || !themeConfig.id) {
    console.error(`🎨 [DreamSkin:Importer] ❌ 导入失败：解压路径 [${themeDir}] 中未找到包含有效 theme.id 的 theme.json 文件！`);
    throw new Error(`无效的主题包：解压路径 [${themeDir}] 中未找到包含有效 theme.id 的 theme.json 文件`);
  }

  // 4. 读取背景图片素材的磁盘物理路径
  const rawImgName = (themeConfig.image || 'background.png').replace(/^\.[/\\]/, '').replace(/^[/\\]+/, '');
  let diskImgPath = `${targetDir}/${rawImgName}`;
  console.log(`🎨 [DreamSkin:Importer] [步骤 5/5] 寻找背景图片素材, 预估磁盘物理路径: ${diskImgPath}`);

  let resolvedImgPath = diskImgPath;
  try {
    // 校验背景图片是否存在
    await fs.readFile(diskImgPath, 'base64');
    console.log(`🎨 [DreamSkin:Importer] ✅ 确认根目录背景图片存在: ${diskImgPath}`);
  } catch (err) {
    console.warn(`🎨 [DreamSkin:Importer] ⚠️ 根路径 ${diskImgPath} 未能直接匹配，检索子目录图源...`, err);
    try {
      const subItems = await fs.readDir(targetDir);
      for (const sub of subItems) {
        if (sub.isDirectory) {
          const tryPath = `${targetDir}/${sub.name}/${rawImgName}`;
          try {
            await fs.readFile(tryPath, 'base64');
            resolvedImgPath = tryPath;
            console.log(`🎨 [DreamSkin:Importer] ✅ 在嵌套子目录 [${sub.name}] 中成功匹配背景图: ${tryPath}`);
            break;
          } catch {}
        }
      }
    } catch {}
  }

  const cleanPath = resolvedImgPath.replace(/\\/g, '/');
  // 核心：直接生成指向 ~/.berrytrace/skin/... 的轻量级协议 URL，切勿在原生解压流程中将文件转成 5MB Base64！
  const imageBlobUrl = formatPluginResourceUrl(cleanPath);

  // 5. 读取可选的 theme.css 自用自定义 CSS
  let themeCss: string | undefined;
  const cssPath = `${targetDir}/theme.css`;
  try {
    themeCss = await fs.readFile(cssPath, 'utf8');
    console.log(`🎨 [DreamSkin:Importer] ✅ 成功读取主题原生 theme.css (${themeCss?.length || 0} 字节)`);
  } catch {
    console.log(`🎨 [DreamSkin:Importer] 该主题无自定义 css 文件 (${cssPath})`);
  }

  console.log(`🎨 [DreamSkin:Importer] 🏁 解压全流程完成！ID=${themeConfig.id}, 名称="${themeConfig.name}", 目标物理目录=${targetDir}, 资源 URL=${imageBlobUrl}`);
  return {
    theme: themeConfig,
    themeCss,
    imageBlobUrl,
  };
}

/**
 * 从 .zip 文件或 Blob 中解压并解析 DreamSkin 主题包 (前端 JSZip 降级备用)
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
  let manifestZipEntry: any = zip.file('manifest.json');
  if (!manifestZipEntry) {
    const matched = zip.file(/manifest\.json$/i);
    if (matched && matched.length > 0) {
      manifestZipEntry = matched[0];
    }
  }
  if (manifestZipEntry) {
    try {
      const manifestText = await manifestZipEntry.async('string');
      manifest = JSON.parse(manifestText);
    } catch {
      // 忽略非致命的 manifest 错误
    }
  }

  // 3. 尝试读取 theme.css
  let themeCss: string | undefined;
  let cssZipEntry: any = zip.file('theme.css');
  if (!cssZipEntry) {
    const matched = zip.file(/theme\.css$/i);
    if (matched && matched.length > 0) {
      cssZipEntry = matched[0];
    }
  }
  if (cssZipEntry) {
    try {
      themeCss = await cssZipEntry.async('string');
    } catch {
      // 忽略非致命 css 错误
    }
  }

  // 4. 读取背景图片素材
  let imageBlobUrl: string | undefined;
  const targetImgName = theme.image || 'background.png';
  let imgZipEntry: any = zip.file(targetImgName);
  if (!imgZipEntry) {
    const matched = zip.file(new RegExp(`${targetImgName}$`, 'i'));
    if (matched && matched.length > 0) {
      imgZipEntry = matched[0];
    }
  }

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
    themeCss,
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
