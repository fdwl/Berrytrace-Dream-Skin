/**
 * SkinMenuItem.tsx —— 头像下拉菜单里的皮肤那一格
 *
 * ═══ 两种形态，由宿主的 `context.layout` 决定 ═════════════════════════════
 *
 * · **flat（0905 起宿主用的）** —— 宿主把「明暗 / 配色 / 皮肤」收进了一个叫
 *   「外观」的二级面板，这一格落在那个**已经展开的面板**里，所以直接平铺。
 * · **浮层（老宿主的兜底）** —— 宿主没传 `context` 时行为与 0904 完全一致：
 *   自己画一条「DreamSkin 皮肤 ▸」加一个 hover 浮层。
 *
 * 🔴 flat 那一支为什么必要：这一格在面板里如果还画自己的浮层，就是**第三级**
 * 菜单，而浮层用的 `left-full` 定位会把它顶到屏幕外面去（二级面板本身已经
 * 贴在右边了）。这不是审美问题，是那个浮层**看不见**。
 *
 * ═══ 0905 二轮李博实机反馈（截图 25.png）═════════════════════════════════
 *
 * 「我安装了 9 个皮肤，导致这个窗口超出屏幕之外了，折叠看不到了」
 * 「鼠标移上去以后是否可以显示预览图，纯看名字我根本不知道是那个皮肤」
 * 「那个『仅浅』删除不需要」
 *
 * 三条对应三个改动：
 *   ① 列表**自己滚动**（`max-h` + `overflow-y-auto`），不再无限撑高面板；
 *   ② 每行左边一个 28×18 的缩略图，hover 再出一张 176px 的大图；
 *   ③ 「仅浅 / 仅深」那个胶囊删掉 —— 信息没丢，挪进了 `title` 和预览卡。
 *
 * 🔴 预览卡**必须 portal 到 `document.body`**，光靠 `position: fixed` 不够。
 *
 * 第一版只用了 fixed（理由是列表容器 `overflow-y-auto` 会裁掉 absolute 浮层）。
 * 但 fixed 只在**没有 transform 祖先**时才相对视口定位 —— 而宿主那个「外观」
 * 面板带着 `zoom-in-95` 入场动画（transform），**它就成了包含块**。后果有两个，
 * 0905 李博实机同时撞上：
 *   ① 预览卡的坐标变成相对面板算 ⇒ 整张图落在**菜单里面**（他原话：
 *      「显示的预览图在菜单内显示，这样就导致了看不到任何预览图了」）；
 *   ② 它进而算进面板的 `scrollHeight` ⇒ 宿主那边按 scrollHeight 算上移量
 *      ⇒ 面板移动 ⇒ 鼠标落到别的行 ⇒ 预览卡换位置 ⇒ scrollHeight 又变
 *      ⇒ **无限循环**（他原话：「整个菜单上下跳动非常厉害，根本不能用了」，
 *      实测那会儿页面卡到 CDP 都不响应）。
 *
 * portal 到 body 之后这两条同时消失：它不再是面板的后代，既不受 transform
 * 包含块影响，也不进面板的 scrollHeight。**别改回去。**
 *
 * 🔴 **这里的 Tailwind「方括号任意值」类（`max-h-[184px]`、`h-[94px]` …）一律无效。**
 * 插件是**独立构建**的，而这些 class 要真的有样式，得由**宿主**的 Tailwind 在扫描
 * 源码时生成 —— 宿主的 `content` 里没有插件仓的路径 ⇒ 那条 CSS 规则压根不存在。
 * 普通类（`flex`、`text-xs`、`w-7`）能用，只因为宿主自己也用了同样的类，纯属搭便车。
 * 〔0905 实测〕`max-h-[184px]` 的容器量出来 `clientHeight=250`（＝完全没限高），
 * `h-[94px]` 的预览图量出来高 31px —— **两处都零报错**。
 * ⇒ 凡是**影响布局正确性**的尺寸（限高、宽高、z-index），一律写内联 `style`。
 *
 * ⚠️ 样式**刻意抄宿主那几组**（同样的 px/py、圆角、hover 颜色、11px 的分组标题）。
 * 这一格夹在宿主自己画的内容下面，稍微差一点就露馅，而且没有任何东西会报警。
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Brush, ChevronRight, Check, Library, RotateCcw, Image as ImageIcon } from 'lucide-react';

/** 已安装皮肤的最小形状（与 view/index.tsx 的 ThemeItem 取交集）。 */
export interface SkinMenuEntry {
  id: string;
  name: string;
  /**
   * 只支持一档明暗时给出那一档。
   * 0905 起**不再渲染成行内胶囊**（李博：「那个仅浅删除不需要」），
   * 但字段留着 —— 它进了 `title` 和 hover 预览卡，用户想知道时还问得到。
   */
  onlyMode?: 'light' | 'dark';
  /** 预览图地址（`berrytrace-plugin://local-file/…` 或拼出来的资源 URL）。 */
  preview?: string;
}

export interface SkinMenuItemProps {
  /**
   * 读当前状态。**异步**，因为底下是存储读取。
   *
   * 🔴 0905 之前这里是同步签名 `readState()`，而真实读取是异步的 ——
   * 于是调用方只能返回一份「上一次读到的」缓存，而那份缓存初值是空的
   * ⇒ **第一次展开菜单永远看不到已装的皮肤**。签名说了实话，这个坑就没了。
   */
  loadState: () => Promise<{ skins: SkinMenuEntry[]; activeId: string | null }>;
  onOpenGallery: () => void;
  onResetAppearance: () => void;
  onApplySkin: (id: string) => void;
  /**
   * 关掉整个头像菜单。由宿主通过座位的 `context.closeMenu` 交下来。
   *
   * 🔴 菜单项点完就该收起 —— 宿主自己那几项（设置、问题反馈）都是这么做的。
   * 0905 之前这一格做不到：`onClose` 是宿主组件的 prop，座位这边够不着，
   * 于是点「主题库」设置页开了、而头像菜单还浮在旁边不走（李博截图 32）。
   * 宿主没给（老版本）时就是 undefined，行为回到那样，不会出错。
   */
  onCloseMenu?: () => void;
  /**
   * 平铺。宿主把这一格放进一个**已经展开的面板**时传 `true`（见文件头）。
   * 缺省 `false` = 老行为（自己画主条 + hover 浮层），所以老宿主不受影响。
   */
  flat?: boolean;
}

/** hover 预览卡的尺寸，算边界翻转要用，写死在一处避免两边对不上。 */
const PREVIEW_W = 176;
const PREVIEW_IMG_H = 94;
/** 预览卡整体高度 = 图 + 标题行 + 内边距，翻转判断用它，别让卡掉出视口。 */
const PREVIEW_H = PREVIEW_IMG_H + 34;
/**
 * 预览卡与菜单面板之间的间距。**跟宿主「面板↔头像菜单」那一档对齐**（30px）——
 * 0905 李博：「应该往右边再去一点，保持和前面两个菜单相同的间距」。
 */
const PREVIEW_GAP = 30;

/**
 * 皮肤列表最多这么高，再多就自己滚。
 * 〔0905 李博实机，窗口 1080×600〕装 9 套时整个菜单超出屏幕，底下的
 * 「恢复默认外观」看不见了 —— 而配色被置灰后那是唯一的出口。
 * 184px ≈ 6 行；再高一行就会顶到宿主的「设置 / 问题反馈」。
 *
 * ⚠️ 这只是**上限**，真正用的高度会向下取整到整数行（见 `listMaxH`）——
 * 0905 李博：「列表底部切了半行」。露半行既不好看，也让人以为那一项坏了。
 */
const SKIN_LIST_MAX_H = 184;
/** 列表的 `gap-0.5`，算整数行时要一起算进去。 */
const SKIN_LIST_GAP = 2;

/** 一张缩略图；加载不出来就退成一个占位图标，**不留空洞**（空洞会让行高塌一截）。 */
const Thumb: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className = '', style }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [src]);
  if (!src || bad) {
    return (
      <span
        style={style}
        className={`${className} flex items-center justify-center bg-muted text-muted-foreground/60`}
      >
        <ImageIcon className="size-2.5" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBad(true)}
      style={{ objectFit: 'cover', ...style }}
      className={className}
    />
  );
};

export const SkinMenuItem: React.FC<SkinMenuItemProps> = ({
  loadState,
  onOpenGallery,
  onResetAppearance,
  onApplySkin,
  onCloseMenu,
  flat = false,
}) => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ skins: SkinMenuEntry[]; activeId: string | null }>({
    skins: [],
    activeId: null,
  });
  /** 有没有成功读到过一次。用来区分「读完了，一套都没装」和「还没读到」。 */
  const [loaded, setLoaded] = useState(false);
  /** hover 预览卡：哪一项 + 它该出现在屏幕的什么位置（fixed 坐标）。 */
  const [preview, setPreview] = useState<{ id: string; top: number; left: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * 请求序号。快速反复 hover 会并发好几次读取，而 Promise 的完成顺序
   * **不保证**与发起顺序一致 —— 没有它的话，一次早发出的慢请求会覆盖掉
   * 后发出的新结果，表现为「菜单里显示的是上一次的皮肤列表」。
   */
  const seqRef = useRef(0);
  const aliveRef = useRef(true);
  /** 皮肤列表的滚动容器，用来量真实行高。 */
  const listRef = useRef<HTMLDivElement | null>(null);
  /** 向下取整到整数行之后的实际限高。 */
  const [listMaxH, setListMaxH] = useState(SKIN_LIST_MAX_H);

  /**
   * 把限高对齐到**整数行**。
   * 行高不写死：图标、字号、宿主的 line-height 都可能变，写死迟早对不上。
   * 量不到（还没渲染出行）时保持上限，不影响首帧。
   */
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const first = el.querySelector('button');
    if (!first) return;
    const per = (first as HTMLElement).offsetHeight + SKIN_LIST_GAP;
    if (per <= SKIN_LIST_GAP) return;
    const rows = Math.max(3, Math.floor((SKIN_LIST_MAX_H + SKIN_LIST_GAP) / per));
    const next = rows * per - SKIN_LIST_GAP;
    setListMaxH((prev) => (prev === next ? prev : next));
  }, [state.skins.length, loaded]);
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
   * 数据也确实读到了，唯独列表位置一直是那两条灰杠 —— 零报错。
   */
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  /**
   * 拉一次数据。两个时机都要：
   *   · **挂载时** —— flat 模式下这就是全部：宿主的 `mountSlot` 跟着面板的
   *     展开走，面板一展开这个组件就是全新挂载的，等于「每次展开现读」；
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
        // 🔴 失败时**不清空**已有内容：清了的话一次抖动就把好好的
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

  /**
   * 算 hover 预览卡的落点。**两个方向都要翻转**：
   * 右边放不下就翻到行的左侧；下边放不下就上移到贴着视口底。
   * 李博那台窗口只有 1080×600，不做翻转的话预览卡有一半在屏幕外。
   */
  const showPreview = (id: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();

    /**
     * 横向以**整个面板**的边缘起算，不是以这一行起算。
     * 行在面板内侧（面板还有一圈 padding），按行算出来的浮层会**压在面板身上**
     * 或者只差几像素贴着它 —— 0905 李博：「被遮挡到下面了，应该往右边再去一点，
     * 保持和前面两个菜单相同的间距」。
     * `offsetParent` 就是那个 absolute 定位的面板；拿不到时退回按行算。
     */
    const panel = el.offsetParent as HTMLElement | null;
    const pr = panel ? panel.getBoundingClientRect() : null;
    const anchorRight = pr ? pr.right : r.right + 8;
    const anchorLeft = pr ? pr.left : r.left - 8;

    let left = anchorRight + PREVIEW_GAP;
    if (left + PREVIEW_W > window.innerWidth - 8) left = anchorLeft - PREVIEW_W - PREVIEW_GAP;
    if (left < 8) left = 8;

    // 纵向对齐 hover 的那一行，只在会掉出视口时才夹回来。
    let top = r.top;
    if (top + PREVIEW_H > window.innerHeight - 8) top = window.innerHeight - PREVIEW_H - 8;
    if (top < 8) top = 8;
    setPreview({ id, top, left });
  };

  const activeName = state.skins.find((s) => s.id === state.activeId)?.name;
  const hovered = preview ? state.skins.find((s) => s.id === preview.id) : null;

  /** 皮肤列表本体 —— 两种形态共用，样式必须一致，否则两条路会长得不一样。 */
  const skinList = !loaded && state.skins.length === 0 ? (
    /* 骨架：两条灰杠。这一格底下是读存储，慢起来是几百毫秒，
       留白的话看着像「没装皮肤」——一句确定的假话。 */
    <div className="flex flex-col gap-1 px-2 py-1.5" aria-label="正在读取皮肤列表">
      <span className="h-3 w-full rounded bg-muted animate-pulse" />
      <span className="h-3 w-2/3 rounded bg-muted animate-pulse" />
    </div>
  ) : state.skins.length === 0 ? (
    <div className="px-2 py-1.5 text-[11px] text-muted-foreground">还没有装皮肤</div>
  ) : (
    /* 🔴 列表自己滚动，别再把面板无限撑高。
       〔0905 李博实机〕装到 9 套时整个菜单已经超出他那台 600px 高的窗口，
       底下的「恢复默认外观」直接看不见 —— 而那正是配色被置灰后唯一的出口。
       max-h 取 ~6 行：再多一行就会顶到设置/问题反馈那两行。 */
    <div
      ref={listRef}
      // 🔴 限高走内联 style：`max-h-[184px]` 这个类宿主的 Tailwind 不会生成（见文件头）。
      // 高度是**向下取整到整数行**的，别露半行（见 listMaxH）。
      style={{ maxHeight: listMaxH, overflowY: 'auto', overscrollBehavior: 'contain' }}
      className="flex flex-col gap-0.5 pr-0.5"
    >
      {state.skins.map((skin) => {
        const on = skin.id === state.activeId;
        return (
          <button
            key={skin.id}
            type="button"
            title={skin.onlyMode ? `${skin.name}（只有${skin.onlyMode === 'dark' ? '深' : '浅'}色版）` : skin.name}
            onClick={() => { setOpen(false); setPreview(null); onCloseMenu?.(); onApplySkin(skin.id); }}
            onMouseEnter={(e) => showPreview(skin.id, e.currentTarget)}
            onMouseLeave={() => setPreview((p) => (p && p.id === skin.id ? null : p))}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer border-none text-left ${
              on
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent'
            }`}
          >
            {/* 行内缩略图：不用 hover 也能一眼扫出哪套是哪套。
                作者起的名字常常是 `BP2xdx7Vzb` 这种，纯文字列表等于没有信息。 */}
            <Thumb
              src={skin.preview}
              alt={skin.name}
              style={{ width: 28, height: 18, borderRadius: 3, flexShrink: 0 }}
              className="border border-border/40"
            />
            <span className="truncate flex-1">{skin.name}</span>
            {on && <Check className="size-3 shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  /**
   * hover 大图。`position: fixed` —— 上面列表是 `overflow-y-auto`，
   * 绝对定位的浮层会被它裁掉（且零报错）。
   */
  const previewCardNode = preview && hovered && (
    <div
      className="fixed rounded-xl border border-border bg-popover shadow-2xl p-1.5 pointer-events-none animate-in fade-in-0"
      style={{ top: preview.top, left: preview.left, width: PREVIEW_W, zIndex: 80 }}
    >
      <Thumb
        src={hovered.preview}
        alt={hovered.name}
        style={{ width: '100%', height: PREVIEW_IMG_H, borderRadius: 8, display: 'block' }}
      />
      <div className="px-1 pt-1 flex items-baseline gap-1 min-w-0">
        <span className="text-[11px] text-foreground truncate flex-1">{hovered.name}</span>
        {/* 「只有深色版」挪到了这儿：行内不占地方，想知道的时候看得到。 */}
        {hovered.onlyMode && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            仅{hovered.onlyMode === 'dark' ? '深' : '浅'}色
          </span>
        )}
      </div>
    </div>
  );

  /**
   * 🔴 portal 到 `document.body` —— 见文件头。挂在组件自己这棵树上的话，
   * 它就是那个带 transform 的面板的后代，fixed 会退化成相对面板定位。
   * `typeof document` 的判空是给非浏览器环境留的（渲染不到就当没有预览）。
   */
  const canPortal = typeof createPortal === 'function' && typeof document !== 'undefined';
  const previewCard = !previewCardNode
    ? null
    : canPortal
      ? createPortal(previewCardNode, document.body)
      // 🔴 退路：老宿主的 `window.ReactDOM` 门面里**没有** createPortal
      // （它 spread 的是 `react-dom/client`，而 createPortal 在主包里）。
      // 〔0905 实测〕那时 `createPortal` 是 `undefined`，直接调用会在渲染中抛，
      // 表现是**这一格整块消失**而不是报错。宁可就地渲染（位置可能被包含块带偏），
      // 也不能崩。宿主侧 0905 已把 createPortal 补进门面。
      : previewCardNode;

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
            onClick={() => { setPreview(null); onCloseMenu?.(); onOpenGallery(); }}
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
            它也是配色被置灰之后唯一的出口，所以位置固定在最底下（终止操作），
            而且**在滚动区外面** —— 在里面的话皮肤一多它就被滚没了。 */}
        {state.activeId && (
          <button
            type="button"
            onClick={() => { setPreview(null); onCloseMenu?.(); onResetAppearance(); }}
            className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <RotateCcw className="size-3.5 shrink-0" />
            <span>恢复默认外观</span>
          </button>
        )}

        {previewCard}
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
          <span className="truncate" style={{ maxWidth: 76 }}>{loaded ? (activeName || '未启用') : '…'}</span>
          <ChevronRight className="size-3.5 shrink-0" />
        </div>
      </div>

      {open && (
        <div
          style={{ marginLeft: 17, width: 188, zIndex: 50 }}
          className="absolute left-full top-0 bg-popover border border-border shadow-2xl rounded-xl p-2 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95"
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <button
            type="button"
            onClick={() => { setOpen(false); onCloseMenu?.(); onOpenGallery(); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <Library className="size-3.5 shrink-0" />
            <span>主题库</span>
          </button>

          <button
            type="button"
            onClick={() => { setOpen(false); onCloseMenu?.(); onResetAppearance(); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 bg-transparent border-none cursor-pointer text-left"
          >
            <RotateCcw className="size-3.5 shrink-0" />
            <span>恢复默认外观</span>
          </button>

          <div className="h-px bg-border/40 my-1" />

          {skinList}
        </div>
      )}

      {previewCard}
    </div>
  );
};

export default SkinMenuItem;
