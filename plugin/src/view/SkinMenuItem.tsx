/**
 * SkinMenuItem.tsx —— 头像下拉菜单里的皮肤那一格
 *
 * ═══ 两种形态，由宿主的 `context.layout` 决定 ═════════════════════════════
 *
 * · **flat（0905 起宿主用的）** —— 宿主把「明暗 / 配色 / 皮肤」收进了一个叫
 *   「外观」的二级面板，这一格落在那个**已经展开的面板**里，所以直接平铺：
 *
 *       外观 ▸ ┌──────────────────────┐
 *              │ 明暗 [浅][深][自动]   │  ← 宿主画的
 *              │ ──────────────────── │
 *              │ 配色  ● 黑白灰 …      │  ← 宿主画的
 *              │ ──────────────────── │
 *              │ 皮肤          主题库  │  ← 这里开始是我们
 *              │  ✓ 慵懒温存          │
 *              │    安妮亚 无限城      │
 *              │  恢复默认外观         │
 *              └──────────────────────┘
 *
 * · **浮层（老宿主的兜底）** —— 宿主没传 `context` 时行为与 0904 完全一致：
 *   自己画一条「DreamSkin 皮肤 ▸」加一个 hover 浮层。
 *
 * 🔴 flat 那一支为什么必要：这一格在面板里如果还画自己的浮层，就是**第三级**
 * 菜单，而浮层用的 `left-full` 定位会把它顶到屏幕外面去（二级面板本身已经
 * 贴在右边了）。这不是审美问题，是那个浮层**看不见**。
 *
 * ═══ 为什么层级要插件自己画 ═══════════════════════════════════════════════
 *
 * 宿主的座位数据结构是**平的**：`SlotItem`（`src/plugins/PluginSlotEngine.ts:28-51`）
 * 只有 `title / icon / priority / command / onClick / render / skeleton / meta`，
 * **没有 `children` / `submenu`**。宿主不做菜单项的层级合并与排序。
 * 但 `render()` 可以返回任意 React 节点，所以自己画是官方给的做法。
 *
 * ⚠️ 样式**刻意抄宿主那几组**（同样的 px/py、圆角、hover 颜色、11px 的分组标题）。
 * 这里不是审美偏好：这一格夹在宿主自己画的内容下面，稍微差一点就露馅。
 * 宿主改了菜单样式而这里没跟，表现是「有一段长得不一样」——没有任何报警。
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
   * 签名说了实话，这个坑就不存在了。
   */
  loadState: () => Promise<{ skins: SkinMenuEntry[]; activeId: string | null }>;
  onOpenGallery: () => void;
  onResetAppearance: () => void;
  onApplySkin: (id: string) => void;
  /**
   * 平铺。宿主把这一格放进一个**已经展开的面板**时传 `true`（见文件头）。
   * 缺省 `false` = 老行为（自己画主条 + hover 浮层），所以老宿主不受影响。
   */
  flat?: boolean;
}

export const SkinMenuItem: React.FC<SkinMenuItemProps> = ({
  loadState,
  onOpenGallery,
  onResetAppearance,
  onApplySkin,
  flat = false,
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
  /**
   * 🔴 **挂载时必须重新置回 `true`**，不能只在 cleanup 里置 `false`。
   *
   * 宿主的 `mountSlot` 是用 `React.StrictMode` 包着渲染的
   * （`src/plugins/sdk.ts:1777`），StrictMode 下 effect 走
   * **mount → cleanup → mount**：第一次 cleanup 把 `aliveRef` 设成 false，
   * 而第二次 mount 如果不重置，它就**永久**是 false ⇒ `refresh()` 里
   * 那两个 `if (!aliveRef.current) return` 会把所有 `setState` 全部丢掉
   * ⇒ `loaded` 永远是 false ⇒ **菜单里永远转着骨架**。
   *
   * 〔0905 实机〕就是这个：分组标题「皮肤」「主题库」都渲染出来了，
   * 数据也确实读到了（同一份 localStorage 里躺着 9 套），
   * 唯独列表位置一直是那两条灰杠 —— 一个不会自己停下来的加载态，零报错。
   */
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  /**
   * 拉一次数据。两个时机都要：
   *   · **挂载时** —— flat 模式下这就是全部：宿主的 `mountSlot` 跟着面板的
   *     展开走，面板一展开这个组件就是全新挂载的，等于「每次展开现读」，
   *     正是李博点名要的那条（「移动上去以后再刷新数据，因为可能这个时候
   *     插件还没有运行」）；
   *   · **每次展开时** —— 浮层模式下组件是常驻的，得靠 `open` 触发。
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

  // 200ms 的离开延迟 —— 与宿主那几条一致。没有它的话，鼠标从主条移到浮层的
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

  /** 皮肤列表本体 —— 两种形态共用，样式必须一致，否则两条路会长得不一样。 */
  const skinList = !loaded && state.skins.length === 0 ? (
    /* 骨架：两条灰杠。这一格底下是跨进程读存储，慢起来是几百毫秒，
       留白的话看着像「没装皮肤」——一句确定的假话。 */
    <div className="flex flex-col gap-1 px-2 py-1.5" aria-label="正在读取皮肤列表">
      <span className="h-3 w-full rounded bg-muted animate-pulse" />
      <span className="h-3 w-2/3 rounded bg-muted animate-pulse" />
    </div>
  ) : state.skins.length === 0 ? (
    <div className="px-2 py-1.5 text-[11px] text-muted-foreground">还没有装皮肤</div>
  ) : (
    <>
      {state.skins.map((skin) => {
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
      })}
    </>
  );

  // ══ 形态一：平铺（宿主已经展开了面板） ═══════════════════════════════════
  if (flat) {
    return (
      <>
        <div className="h-px bg-border/40 my-1" />
        <div className="flex items-center justify-between gap-2 px-1.5 pb-1">
          <span className="text-[11px] text-muted-foreground shrink-0">皮肤</span>
          {/* 「主题库」放在分组标题这一行的右边，而不是列表里占一整行 ——
              它是**去别处**的入口，和下面那些「点了就切」的皮肤不是一类操作。 */}
          <button
            type="button"
            onClick={onOpenGallery}
            title="打开 DreamSkin 主题库"
            className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer"
          >
            <Library className="size-3 shrink-0" />
            <span>主题库</span>
          </button>
        </div>

        {skinList}

        {/* 🔴 只在**真有皮肤生效**时才出现。没有皮肤时它是一颗什么都不改变的
            按钮，摆在那儿只会让人以为「我的外观是不是坏了」。
            它也是配色被置灰之后唯一的出口，所以位置固定在最底下（终止操作）。 */}
        {state.activeId && (
          <button
            type="button"
            onClick={onResetAppearance}
            className="flex items-center gap-2 px-2 py-1.5 mt-0.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <RotateCcw className="size-3.5 shrink-0" />
            <span>恢复默认外观</span>
          </button>
        )}
      </>
    );
  }

  // ══ 形态二：自带主条 + hover 浮层（老宿主的兜底，行为与 0904 一致） ══════
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

          {skinList}
        </div>
      )}
    </div>
  );
};

export default SkinMenuItem;
