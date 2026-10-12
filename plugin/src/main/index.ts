/**
 * Background Main Process Entry for BerryTrace DreamSkin Plugin
 *
 * 后台常驻进程：负责在插件激活、软件启动、工作区切换时，
 * 跨所有渲染窗口 100% 全局挂载与保持上一次选中的 DreamSkin 壁纸与色彩主题。
 */

import {
  transformDreamSkinToBerryTrace,
  applySkinViaSDK,
  type SdkUi,
  type SdkPlugin,
} from '../adapter/theme-adapter';

import { loadSkinsFromDisk, readActive } from '../adapter/theme-store';

declare const sdk: any;

/**
 * 从存储中恢复并跨窗口广播/挂载激活的主题
 */
export async function restoreAndApplyActiveTheme(): Promise<void> {
  try {
    if (!sdk?.storage || !sdk?.ui) return;

    const savedActive = await readActive(sdk);
    if (!savedActive?.themeId) {
      console.log('🎨 [DreamSkin:Main] 当前未激活任何自定义 DreamSkin 主题');
      return;
    }

    // 只认通过磁盘核对的皮肤：图片文件缺了的不挂载（面板打开时会问用户怎么处理）。
    const { ok } = await loadSkinsFromDisk(sdk);
    const activeItem = ok.find((t) => t.id === savedActive.themeId);
    if (!activeItem?.config) {
      console.log(`🎨 [DreamSkin:Main] 当前主题 ${savedActive.themeId} 不在列表里或图片文件缺失，跳过挂载`);
      return;
    }

    const applied = transformDreamSkinToBerryTrace(activeItem.config, activeItem.imageBlobUrl);
    await applySkinViaSDK(sdk.ui as SdkUi, applied, sdk.plugin as SdkPlugin);
    console.log(`🎨 [DreamSkin:Main] 成功跨窗口挂载常驻主题：${applied.name}`);
  } catch (err) {
    console.error('🚨 [DreamSkin:Main] 恢复常驻主题失败:', err);
  }
}

export async function activate() {
  console.log('🎨 [DreamSkin:Main] 插件后台进程已激活，正在进行常驻主题全窗口挂载...');

  // 1. 启动时立即挂载应用存储的主题
  await restoreAndApplyActiveTheme();

  // 2. 监听事件：当 UI 设置面板应用/切换新主题时，实时重新挂载
  if (sdk?.events) {
    sdk.events.on('dream-skin:applied', async () => {
      console.log('🎨 [DreamSkin:Main] 收到主题切换广播，重新刷新常驻挂载...');
      await restoreAndApplyActiveTheme();
    });
  }
}

export async function deactivate() {
  console.log('🎨 [DreamSkin:Main] 插件卸载，释放常驻资源');
}
