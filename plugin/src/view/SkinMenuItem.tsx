/**
 * SkinMenuItem.tsx —— 头像下拉菜单里的「皮肤」一条（含二级菜单）
 *
 * ═══ 为什么二级菜单要插件自己画 ═══════════════════════════════════════════
 *
 * 宿主的座位数据结构是**平的**：`SlotItem`（`src/plugins/PluginSlotEngine.ts:28-51`）
 * 只有 `title / icon / priority / command / onClick / render / skeleton / meta`，
 * **没有 `children` / `submenu`**。宿主不做菜单项的层级合并与排序。
 *
 * 但 `render()` 可以返回任意 React 节点。所以「一格里自己画一个 hover 浮层」
 * 是官方给的做法，旁边宿主自己的「主题 / 配色」两条就是可直接照抄的样板
 * （`webapp/src/components/OnlineUserProfilePopover.tsx:232-330`）。
 *
 * ═══ 这一条菜单长什么样 ═══════════════════════════════════════════════════
 *
 *   DreamSkin 皮肤 ▸ ┌─────────────────────┐
 *           │ 主题库              │  ← 打开插件面板的「主题库」页签
 *           │ 恢复默认外观        │  ← 清掉皮肤 + 解开明暗锁定
 *           │ ───────────────     │
 *           │ ✓ 慵懒温存          │  ← 已安装的皮肤，点了就切
 *           │   安妮亚 无限城     │
 *           └─────────────────────┘
 *
 * ⚠️ 样式**刻意抄宿主那两条**（同样的 px/py、圆角、hover 颜色）。
 * 这里不是审美偏好：这一格夹在宿主自己画的条目中间，稍微差一点就露馅。
 * 宿主改了菜单样式而这里没跟，表现是「有一条长得不一样」——没有任何报警。
 */

import React, { useEffect, useRef, useState } from 'react';
import { Brush, ChevronRight, Check, Library, RotateCcw } from 'lucide-react';

/** 已安装皮肤的最小形状（与 view/index.tsx 的 ThemeItem 取交集）。 */
export interface SkinMenuEntry {
  id: string;
  name: string;
  /** 只支持一档明暗时给出那一档，用来在菜单里标「仅深色」。 */
  onlyMode?: 'light' | 'dark';
}

export interface SkinMenuItemProps {
  /**
   * 读当前状态。**异步**，因为底下是 `sdk.storage`（跨进程）。
   *
   * 🔴 0905 之前这里是同步签名 `readState()`，而真实读取是异步的 ——
   * 于是调用方只能返回一份「上一次读到的」缓存，而那份缓存初值是空的
   * ⇒ **第一次展开菜单永远看不到已装的皮肤**，要关掉再展开一次才有。
   * 李博看到的就是这个（他的描述是「这个时候插件还没有运行」）。
   * 签名说了实话，这个坑就不存在了。
   */
  loadState: () => Promise<{ skins: SkinMenuEntry[]; activeId: string | null }>;
  onOpenGallery: () => void;
  onResetAppearance: () => void;
  onApplySkin: (id: string) => void;
}

export const SkinMenuItem: React.FC<SkinMenuItemProps> = ({
  loadState,
  onOpenGallery,
  onResetAppearance,
  onApplySkin,
}) => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ skins: SkinMenuEntry[]; activeId: string | null }>({
    skins: [],
    activeId: null,
  });
  /** 有没有成功读到过一次。用来区分「读完了，一套都没装」和「还没读到」。 */
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * 请求序号。快速反复 hover 会并发好几次读取，而 Promise 的完成顺序
   * **不保证**与发起顺序一致 —— 没有它的话，一次早发出的慢请求会覆盖掉
   * 后发出的新结果，表现为「菜单里显示的是上一次的皮肤列表」。
   */
  const seqRef = useRef(0);
  const aliveRef = useRef(true);
  useEffect(() => () => { aliveRef.current = false; }, []);

  /**
   * 拉一次数据。两个时机都要：
   *   · **挂载时** —— 主条右边那个「当前皮肤名」不展开也得是对的；
   *   · **每次展开时** —— 这是李博点名要的：展开那一刻插件多半才刚起来，
   *     而且用户可能刚在设置页里换过皮肤，缓存必然是旧的。
   */
  const refresh = React.useCallback(() => {
    const mySeq = ++seqRef.current;
    void loadState()
      .then((v) => {
        if (!aliveRef.current || mySeq !== seqRef.current) return;
        setState(v);
        setLoaded(true);
      })
      .catch((err) => {
        if (!aliveRef.current || mySeq !== seqRef.current) return;
        console.warn('🎨 [DreamSkin] 读菜单状态失败:', err);
        // 🔴 失败时**不清空**已有内容：清了的话一次网络抖动就把好好的
        // 列表变成「还没装皮肤」，比显示旧数据误导得多。
        setLoaded(true);
      });
  }, [loadState]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  // 200ms 的离开延迟 —— 与宿主那两条一致。没有它的话，鼠标从主条移到浮层的
  // 那一瞬间会穿过一段两者都不覆盖的间隙，浮层当场收起来。
  const enter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const leave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  const activeName = state.skins.find((s) => s.id === state.activeId)?.name;

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-foreground hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <Brush className="size-4 text-muted-foreground" />
          <span>DreamSkin 皮肤</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs min-w-0">
          {/* 🔴 没读到之前显示「…」而不是「未启用」：那时我们根本不知道
              启没启用，写「未启用」是在拿一句确定的假话糊读者。 */}
          <span className="truncate max-w-[76px]">{loaded ? (activeName || '未启用') : '…'}</span>
          <ChevronRight className="size-3.5 shrink-0" />
        </div>
      </div>

      {open && (
        <div
          className="absolute left-full top-0 ml-[17px] w-[168px] bg-popover border border-border shadow-2xl rounded-xl p-2 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95 z-50"
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onOpenGallery(); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <Library className="size-3.5 shrink-0" />
            <span>主题库</span>
          </button>

          <button
            type="button"
            onClick={() => { setOpen(false); onResetAppearance(); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <RotateCcw className="size-3.5 shrink-0" />
            <span>恢复默认外观</span>
          </button>

          <div className="h-px bg-border/40 my-1" />

          {!loaded && state.skins.length === 0 ? (
            /* 骨架：两条灰杠。这一格底下是跨进程读存储，慢起来是几百毫秒，
               留白的话看着像「没装皮肤」——一句确定的假话。 */
            <div className="flex flex-col gap-1 px-2 py-1.5" aria-label="正在读取皮肤列表">
              <span className="h-3 w-full rounded bg-muted animate-pulse" />
              <span className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            </div>
          ) : state.skins.length === 0 ? (
            <div className="px-2 py-1.5 text-[11px] text-muted-foreground">还没有装皮肤</div>
          ) : (
            state.skins.map((skin) => {
              const on = skin.id === state.activeId;
              return (
                <button
                  key={skin.id}
                  type="button"
                  title={skin.name}
                  onClick={() => { setOpen(false); onApplySkin(skin.id); }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border-none text-left ${
                    on
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent'
                  }`}
                >
                  <span className="truncate flex-1">{skin.name}</span>
                  {/* 只支持一档时标出来 —— 用户会发现明暗切换器灰了，
                      不标的话他不知道是哪套皮肤锁的。 */}
                  {skin.onlyMode && (
                    <span className="text-[10px] px-1 rounded bg-muted shrink-0">
                      仅{skin.onlyMode === 'dark' ? '深' : '浅'}
                    </span>
                  )}
                  {on && <Check className="size-3 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SkinMenuItem;
