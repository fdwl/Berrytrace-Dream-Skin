/**
 * gallery-inject.ts —— 注入进 dreamskin.cc 的那一小段 CSS + JS
 *
 * ═══ 为什么要注入，注入了什么 ═══════════════════════════════════════════════
 *
 * 站点自己有一套「能不能一键换肤」的门禁，判据**全在前端 JS 里**，
 * 而且是按 `navigator.userAgent` 判的。0904 从 `assets/index-*.js` 逐段扒出来：
 *
 * ```js
 * function Wv(ua, platform, maxTouch) {          // 平台探测
 *   if (/Windows/i.test(...)) return "windows";
 *   if (/Macintosh|Mac OS X/i.test(...) && maxTouch < 2) return "macos";
 *   // 没有 linux 分支 → undefined
 * }
 * const xm = ["macos", "windows"];               // 平台白名单，就这两个
 * // $p(): applyCompatible 为假 → unverified；平台探测不到 → unverified；
 * //       主题的 platforms 不含当前平台 → unsupported（就是那句提示）；
 * //       都过了 → available，才渲染 <a href="dreamskin://apply?version=…">
 * ```
 *
 * 🔴 **那套 platforms 描述的是 Codex 的平台限制，不是我们的。**
 * DreamSkin 主题包在 Codex 那边要靠改渲染进程的 DOM 才能生效，所以分平台；
 * 而在 BerryTrace 这边，一套主题就是**一组 CSS 变量 + 一张壁纸**，
 * 跟操作系统没有一点关系。所以这道门禁对我们本来就不该生效。
 *
 * 注入做两件事：
 *   ① 把「该主题包不支持当前桌面平台」那类提示藏掉；
 *   ② 在每张卡片上补一颗**我们自己的**「一键换肤」，点了把 versionId 送回插件。
 *
 * ═══ 判据为什么不认站点的 class 名 ═════════════════════════════════════════
 *
 * `community-home-card-compatibility` 这种 class 是对方的实现细节，改版就没了，
 * 而失效的形态是**静默的**：按钮不再出现，没有任何报错。
 * 所以：
 *   · 找卡片认的是 **`a[href^="/themes/ver_"]`** —— 那是它的**路由契约**
 *     （详情页地址），比 class 稳得多；
 *   · 藏提示除了按 class，还按**文案**兜一层（文案也可能改，但两条同时失效的
 *     概率比一条低）；
 *   · 两条都失效时**按钮仍然会出现**（因为按钮只依赖路由契约），
 *     最坏情况是提示和按钮并存 —— 难看，但用户仍然能一键换肤。
 *     这是有意选的降级方向：宁可多一句废话，不要少一颗按钮。
 *
 * ⚠️ 这是个 SPA，换路由**不触发** dom-ready。所以脚本必须常驻：用
 *    MutationObserver 盯着 body，每次 DOM 变动重扫一遍。
 */

/** guest → 插件 的回传前缀。必须与宿主 `EmbeddedSite` 的 `GUEST_MESSAGE_PREFIX` 一致。 */
export const EMBED_MESSAGE_PREFIX = '__BERRYTRACE_EMBED__:';

/** 站点上那几句「不支持/仅可预览」的提示文案（中英各一套，取自它自己的 i18n 表）。 */
const NOTICE_TEXTS = [
  '该主题包不支持当前桌面平台；仍可在线预览或下载',
  '该主题已通过一键换肤格式验证；支持此功能的公开客户端发布后即可直接应用',
  '该版本尚无当前一键换肤兼容性证据；仍可在线预览或下载，客户端导入时会独立严格校验',
  '仅支持预览与下载',
  'This package does not support the current desktop platform; preview or download remains available',
  'Preview and download only',
];

/**
 * 注入的 CSS。
 *
 * 只做两件事：藏提示、给我们那颗按钮上妆。**不改站点的布局**——
 * 改布局等于跟对方的样式打架，对方一改版就错位，而错位没有任何信号。
 */
export const GALLERY_CSS = `
/* ① 藏掉平台/兼容性提示。
      🔴 **三个页面三套 class**（0904 用无头浏览器逐页实测出来的，别照 bundle 猜）：
        · /gallery   主题库 → p.community-card-compatibility
                              （zh-CN 下文案是「仅支持预览与下载」）
        · /themes/<ver> 详情 → p.community-preview-apply-unavailable
                              （「该版本尚无当前一键换肤兼容性证据；仍可在线预览或下载…」）
        · /          首页   → community-home-* 那一套（bundle 里能搜到，但它只在首页用）
      我第一版只写了首页那套 —— 对主题库和详情页**一条都不生效**，
      而失效是静默的（提示照旧显示，按钮照旧出得来，没有任何报错）。
      失效条件：站点改版导致下面任一 class 消失时，本行连同 JS 里的文案兜底一起重新量。 */
.community-card-compatibility,
.community-preview-apply-unavailable,
.community-home-card-compatibility,
.community-home-card-apply-note,
.featured-community-apply-note {
  display: none !important;
}

/* ② 我们自己那颗一键换肤。刻意长得像站点的主按钮（.btn.is-primary），
      但用自己的 class，避免被对方的样式改动带走。 */
.bt-apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  background: #17181c;
  cursor: pointer;
  transition: opacity .15s ease, transform .15s ease;
  white-space: nowrap;
}
.bt-apply-btn:hover { opacity: .86; }
.bt-apply-btn:active { transform: scale(.97); }
.bt-apply-btn[disabled] { opacity: .5; cursor: default; }
.bt-apply-btn .bt-apply-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #2de1c2;   /* 站点自己的强调色，取自它的 favicon */
  flex: none;
}
/* 装在卡片操作区里时跟着排版走 */
.community-home-actions .bt-apply-btn { flex: none; }
`;

/**
 * 让嵌进来的站点跟着 App 一起变深色。
 *
 * ═══ 为什么只能靠覆盖 ═══════════════════════════════════════════════════
 * 〔0905 无头浏览器实测〕**dreamskin.cc 自己完全不支持暗色**，四条路全堵：
 *   · `prefers-color-scheme` 规则数 = **0**（三份 CSS 共 125093 字节里一条都没有）；
 *   · `<html>` 上只有 `lang`，`<body>` 零属性 —— 没有 `.dark`、没有 `data-theme`；
 *   · `<meta name="color-scheme" content="light">` **写死 light**；
 *   · localStorage 里 7 个 `dreamskin.*` 键，没有一个跟外观有关。
 * 负向验证：强行 `classList.add('dark')` + `data-theme=dark` + `style.colorScheme=dark`
 * 之后再量，body 仍是 `oklch(0.983 …)` —— **一点没动**，因为 CSS 里根本没有对应选择器。
 * ⇒ 想让它变暗，只能我们自己覆盖。
 *
 * ═══ 为什么覆盖变量而不是逐个元素改 ═══════════════════════════════════════
 * 整站配色由 `:root` 上 8 个变量驱动。实测覆盖率（有背景色的元素里"浅色底"的个数）：
 *   · /gallery：25 → 8   · /：17 → 4
 * 剩下的那几个只有**两类**需要单独写规则，就是下面 ② ③。
 * 逐元素改的话，对方一改版就大面积失效，而且失效是静默的。
 *
 * 🔴 失效条件：站点改版导致 `:root` 上这组变量名变化时，本段整体重量一次。
 * 判据脚本：`plugin/scripts/verify-gallery-inject.mjs`。
 */
export const DARK_OVERRIDE_CSS = `
/* ① 站点的 8 个配色变量，翻成深色。
      原值（实测）：--bg #faf9f8 / --panel #fdfcfc / --mist #ededea
                    --text #1e1f22 / --muted #66696e / --ink #16181c
                    --line rgba(23,24,28,.1) / --site-accent #3f4650 */
:root {
  --bg:          oklch(0.185 0.006 260);
  --panel:       oklch(0.225 0.006 260);
  --mist:        oklch(0.270 0.006 260);
  --text:        oklch(0.930 0.004 260);
  --muted:       oklch(0.680 0.008 260);
  --ink:         oklch(0.950 0.003 260);
  --line:        rgba(255, 255, 255, .12);
  --site-accent: #9fb0c4;
  /* 这两个站点**从来没定义过**（三份 CSS 里 grep 命中 0），一直在吃 fallback ——
     分页控件的 hover 与当前页底色。补上就跟着一起暗，属于白捡的。 */
  --hairline:    rgba(255, 255, 255, .12);
  --panel-alt:   rgba(255, 255, 255, .06);
  /* 让滚动条、原生表单控件也跟着暗。CSS 的 color-scheme 压得过 <meta>。 */
  color-scheme: dark;
}

/* ② 主按钮必须单独写死。
      🔴 站点的规则是 \`.btn.is-primary{background:var(--ink);color:#fbfbfa}\` ——
      --ink **同时**当 h1 文字色和主按钮底色用。①把 --ink 翻浅之后，
      这里就变成 #fbfbfa 浅字压在浅底上，**一个字都看不见**。 */
.btn.is-primary,
a.btn.is-primary,
.community-card-preview.btn.is-primary,
.community-card-apply.btn.is-primary,
.community-preview-apply.btn.is-primary {
  background: oklch(0.950 0.003 260) !important;
  color: oklch(0.200 0.008 260) !important;
}

/* ③ 「全部 / 浅色 / 深色」那个筛选胶囊：在 gallery 的 CSS 里是**硬编码字面量**
      \`background: rgb(237,237,234)\`，不走变量，只能单独覆盖。 */
.gallery-community-appearance {
  background: oklch(0.270 0.006 260) !important;
}

/* ④ 🔴 皮肤预览区**必须还原成原值**。
      那里画的是「这套皮肤长什么样」，用的是皮肤自己的配色（实测量到过
      rgb(66,255,114) 这种绿）。把我们的深色变量继承进去，用户看到的预览
      就不是那套皮肤真实的样子了 —— 而这正是他来这个页面要看的东西。
      在子树上重新声明一遍原值即可，不影响外面。 */
.community-card-thumbnail,
.community-preview-stage,
.community-home-card-thumbnail {
  --bg:    oklch(98.3% .002 95);
  --panel: oklch(99.2% .001 95);
  --mist:  oklch(94.5% .003 95);
  --text:  oklch(24% .006 260);
  --muted: oklch(52% .008 260);
  --ink:   oklch(21% .008 260);
  --line:  rgba(23, 24, 28, .1);
  color-scheme: light;
}

/* ⑤ 我们自己那颗按钮跟着反色（浅底深字），与站点主按钮保持一致。 */
.bt-apply-btn {
  background: oklch(0.950 0.003 260);
  color: #16181c;
}
`;

/**
 * 注入的 JS。
 *
 * ⚠️ 这段字符串会被 `EmbeddedSite` 包进一层 try/catch + 幂等 marker 再
 * `executeJavaScript` 进 guest。里面**不要**用 `return`（顶层）——
 * 包装层是 IIFE，顶层 return 会被吃掉但不会报错，行为上等于后面全不执行。
 */
export const GALLERY_JS = `
var PREFIX = ${JSON.stringify(EMBED_MESSAGE_PREFIX)};
var NOTICE_TEXTS = ${JSON.stringify(NOTICE_TEXTS)};

function post(payload) {
  try { console.log(PREFIX + JSON.stringify(payload)); } catch (e) {}
}

/** 从 /themes/ver_xxx 这样的路径里抠出版本 id。抠不出来返回 null。 */
function versionFromHref(href) {
  if (!href) return null;
  var m = String(href).match(/\\\/themes\\\/(ver_[a-z0-9]{8,64})(?:[/?#]|$)/i);
  return m ? m[1] : null;
}

/** 兜底：按文案藏提示（class 那一层在 CSS 里，改版会失效）。 */
function hideNoticesByText(root) {
  var nodes = root.querySelectorAll('p, span, div, small');
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    if (el.dataset && el.dataset.btHidden === '1') continue;
    // 只看直接文本，避免把整张卡片（它的 textContent 也包含这句）藏掉。
    var t = (el.textContent || '').trim();
    if (!t || t.length > 120) continue;
    for (var j = 0; j < NOTICE_TEXTS.length; j++) {
      if (t.indexOf(NOTICE_TEXTS[j]) !== -1) {
        el.style.display = 'none';
        if (el.dataset) el.dataset.btHidden = '1';
        break;
      }
    }
  }
}

/** 造一颗我们的按钮。 */
function makeButton(versionId, label) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'bt-apply-btn';
  b.dataset.btVersion = versionId;
  var dot = document.createElement('span');
  dot.className = 'bt-apply-dot';
  b.appendChild(dot);
  b.appendChild(document.createTextNode(label || '一键换肤'));
  b.addEventListener('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    post({ type: 'apply', versionId: versionId });
  });
  return b;
}

/**
 * 找一张卡片的操作区。
 * 优先站点自己的 .community-home-actions；没有就退到那条 /themes/ 链接的父节点。
 * 退化时按钮仍然出得来，只是排版可能不如原位好看 —— 见文件头「降级方向」。
 */
function actionHost(card, link) {
  return (
    card.querySelector('.community-card-actions') ||     // /gallery（实测在用）
    card.querySelector('.community-home-actions') ||     // 首页
    link.parentElement ||
    card
  );
}

/**
 * 站点**自己**那颗一键换肤在不在（针对某个版本）。
 *
 * 🔴 这是 0905 那个「有时候皮肤下面会多一个一键换肤」的判据。
 * 站点按 UA 判平台：macOS / Windows 上、且主题 platforms 命中时，它会渲染
 * 自己的 <a href="dreamskin://apply?version=…">。Linux 上一颗都不渲染 ——
 * 所以这个 bug 在车间机上**永远复现不出来**，只有李博的 Mac 上才有。
 *
 * 站点那颗经 hijackProtocolLinks() 接管之后功能与我们的完全一致，
 * 所以有它就不该再补一颗。
 */
function hasNativeApply(v) {
  return !!document.querySelector('a[data-bt-hijacked="1"][data-bt-version="' + v + '"]');
}

/**
 * 站点那颗后到时，把我们先注入的那颗撤掉。
 *
 * 🔴 少了这一步，「先注入后重复」这条时序仍然会漏：站点是 SPA，
 * 首屏 HTML 里没有按钮，hydration 之后才渲染出来 —— 那时我们的按钮
 * 早就挂上去了。这也是李博说「**有时候**」的原因：快的时候看不到，
 * 慢的时候两颗一起在。
 */
function dropRedundantOwnButtons() {
  var mine = document.querySelectorAll('.bt-apply-btn[data-bt-version]');
  for (var i = 0; i < mine.length; i++) {
    var b = mine[i];
    var v = b.getAttribute('data-bt-version');
    if (v && hasNativeApply(v) && b.parentNode) b.parentNode.removeChild(b);
  }
}

/** 扫一遍所有卡片，缺按钮的补上。幂等。 */
function decorateCards(root) {
  var links = root.querySelectorAll('a[href*="/themes/ver_"]');
  var seen = {};
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var v = versionFromHref(link.getAttribute('href'));
    if (!v) continue;
    // 一张卡片上通常有三条指向同一个详情页的链接（缩略图/标题/预览按钮），
    // 只处理第一条，否则一张卡上会冒出三颗按钮。
    // article.community-card 是 /gallery 的真实形状（实测）；
    // .community-home-card 是首页的；article/li 是兜底。
    var card = link.closest('.community-card, .community-home-card, article, li') || link.parentElement;
    if (!card) continue;
    // 🔴 去重按**全文档**、按版本号，不是按卡片。
    // 按卡片查的话，详情页上会出两颗：decorateDetail() 挂在操作区、
    // decorateCards() 又从页内某条指向本主题的链接上再挂一颗（实测就是 2 颗）。
    // 一个版本一颗按钮，这才是用户预期。
    if (document.querySelector('.bt-apply-btn[data-bt-version="' + v + '"]')) continue;
    // 站点自己那颗已经在（且已被接管）⇒ 不补，用它的，样式还原生。
    if (hasNativeApply(v)) continue;
    if (seen[v]) continue;
    seen[v] = 1;
    actionHost(card, link).appendChild(makeButton(v));
  }
}

/**
 * 详情页（/themes/ver_xxx）：版本 id 直接从地址栏取。
 * 按钮挂到页面上第一个操作区里；找不到就挂一颗浮在右下角的。
 */
function decorateDetail() {
  var v = versionFromHref(location.pathname);
  if (!v) return;
  if (document.querySelector('.bt-apply-btn[data-bt-version="' + v + '"]')) return;
  if (hasNativeApply(v)) return;   // 站点自己那颗在，用它的
  // 详情页上站点自己那颗按钮是 a.community-preview-apply（macOS/Windows 才有），
  // 它不在时那块位置由 p.community-preview-apply-unavailable 占着（已被 CSS 藏掉）。
  // 两者的父节点是同一个，所以先找它们。
  var sibling =
    document.querySelector('.community-preview-apply') ||
    document.querySelector('.community-preview-apply-unavailable');
  var host =
    (sibling && sibling.parentElement) ||
    document.querySelector('.community-card-actions') ||
    document.querySelector('.community-home-actions') ||
    (document.querySelector('main .btn') && document.querySelector('main .btn').parentElement);
  var btn = makeButton(v);
  if (host) {
    host.appendChild(btn);
  } else {
    btn.style.position = 'fixed';
    btn.style.right = '24px';
    btn.style.bottom = '24px';
    btn.style.zIndex = '2147483000';
    btn.style.boxShadow = '0 6px 24px rgba(0,0,0,.25)';
    document.body.appendChild(btn);
  }
}

/**
 * 站点**自己**渲染出来的一键换肤（macOS/Windows 上、主题 platforms 命中时会有）
 * 走的是 <a href="dreamskin://apply?version=…">。
 *
 * 🔴 那种链接在 <webview> 里点下去是**接不住**的：guest 上没有 will-navigate
 * 监听，Chromium 多半直接吞成 ERR_UNKNOWN_URL_SCHEME；走 window.open 则被
 * 宿主的弹窗策略按「自定义协议」硬 block。所以这里把它就地改写成走我们这条路，
 * 让两个入口最终汇到**同一个处理器**。
 */
function hijackProtocolLinks(root) {
  var as = root.querySelectorAll('a[href^="dreamskin://"]');
  for (var i = 0; i < as.length; i++) {
    var a = as[i];
    if (a.dataset && a.dataset.btHijacked === '1') continue;
    var m = (a.getAttribute('href') || '').match(/version=([^&]+)/);
    if (!m) continue;
    var v = decodeURIComponent(m[1]);
    if (a.dataset) {
      a.dataset.btHijacked = '1';
      // 记下版本号，好让 hasNativeApply() 一次 querySelector 就查得到 ——
      // 否则每次都要把所有 dreamskin:// 链接的 href 重新 parse 一遍。
      a.dataset.btVersion = v;
    }
    a.addEventListener('click', function (vv) {
      return function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        post({ type: 'apply', versionId: vv });
      };
    }(v), true);
  }
}

function sweep() {
  try {
    hideNoticesByText(document);
    // 🔴 次序是判据的一部分，四步都不能换位置：
    //   ① hijack 先跑 —— 后面两步要靠 data-bt-hijacked 判断「站点自己那颗在不在」；
    //      放到最后的话每一轮 sweep 都会先补一颗我们的，再接管一颗站点的 ⇒ 两颗。
    //   ② 清理：站点那颗是 hydration 之后才出现的，我们可能已经先补过了。
    //   ③ detail 在 cards 之前 —— 两者共用「一个版本一颗」的全局去重，谁先跑谁占位。
    //      详情页上 detail 那颗落在操作区（正位），cards 那颗会落在某条链接旁边（歪的）。
    // 顺序错了都不报错，只是按钮多一颗或长在奇怪的地方。
    hijackProtocolLinks(document);
    dropRedundantOwnButtons();
    decorateDetail();
    decorateCards(document);
  } catch (e) {
    post({ type: 'error', message: String(e && e.message || e) });
  }
}

// SPA 换路由不触发 dom-ready，所以必须常驻盯着。
// 用节流：卡片列表一次渲染会产生大量 mutation，每条都扫一遍会卡住页面。
var pending = null;
var obs = new MutationObserver(function () {
  if (pending) return;
  pending = setTimeout(function () { pending = null; sweep(); }, 120);
});
obs.observe(document.documentElement, { childList: true, subtree: true });

sweep();
post({ type: 'ready', url: location.href });
`;
