/**
 * 「一个版本只能有一颗一键换肤」——打真站点验，**用 macOS 的 UA**。
 *
 * ═══ 为什么必须单开一个脚本、而且必须换 UA ═══════════════════════════════
 * 站点按 `navigator.userAgent` 推断桌面平台，再和主题包的 `platforms` 求交，
 * 命中才渲染它**自己**那颗 `<a class="community-card-apply" href="dreamskin://…">`。
 * 〔0905 实测，连跑 3 轮稳定〕同一批 6 张卡：
 *     Linux UA → 0 颗   ·   macOS UA → 2 颗   ·   Windows UA → 6 颗
 *
 * 🔴 所以「站点自己的按钮 + 我们注入的 = 两颗」这个 bug，
 * **在这台 Linux 车间机上永远复现不出来**（`verify-gallery-inject.mjs` 跑的就是
 * Linux 默认 UA，它 12 条全绿，而李博的 Mac 上一眼就能看见多出来那颗）。
 * 这正是 CLAUDE.md 六点六第④种：射程为空 —— 判据在跑，但那段代码在这台机器上
 * 根本不会被执行。换 UA 就是把射程补上。
 *
 * 跑法：
 *   source /data/browsers/env.sh
 *   node plugin/scripts/verify-no-duplicate-apply.mjs
 *
 * 失效条件：站点不再按 UA 分平台（Linux UA 下也渲染 apply 按钮）时，
 * 本脚本的 macOS/Linux 对照失去意义，届时重写。
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SRC = new URL('../src/view/gallery-inject.ts', import.meta.url).pathname;
const src = readFileSync(SRC, 'utf-8');

function extractTemplate(name) {
  const start = src.indexOf(`export const ${name} = \``);
  if (start < 0) throw new Error(`没找到 ${name}`);
  const from = src.indexOf('`', start) + 1;
  let i = from;
  while (i < src.length) {
    if (src[i] === '`' && src[i - 1] !== '\\') break;
    i++;
  }
  return src.slice(from, i);
}

let CSS = extractTemplate('GALLERY_CSS');
let JS = extractTemplate('GALLERY_JS');
JS = JS.replace('${JSON.stringify(EMBED_MESSAGE_PREFIX)}', JSON.stringify('__BERRYTRACE_EMBED__:'));
JS = JS.replace('${JSON.stringify(NOTICE_TEXTS)}', JSON.stringify([
  '该主题包不支持当前桌面平台；仍可在线预览或下载',
  '该主题已通过一键换肤格式验证；支持此功能的公开客户端发布后即可直接应用',
  '该版本尚无当前一键换肤兼容性证据；仍可在线预览或下载，客户端导入时会独立严格校验',
  '仅支持预览与下载',
  'This package does not support the current desktop platform; preview or download remains available',
  'Preview and download only',
]));
// 🔴 抠出来的是**源码原始字节**，模板转义还没求值。少这一步的话正则里的
// \\/ 会变成字面反斜杠，静默匹配不到任何东西（踩过）。
const evalTemplate = (raw) => eval('`' + raw + '`');
CSS = evalTemplate(CSS);
JS = evalTemplate(JS);

const UAS = {
  macOS: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

const results = [];
const rec = (name, ok, detail) => { results.push({ ok }); console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); };

/** 数一遍：站点自己的、我们的、以及按版本号汇总。 */
const COUNT = `(() => {
  const native = [...document.querySelectorAll('a[href^="dreamskin://"]')];
  const ours = [...document.querySelectorAll('.bt-apply-btn')];
  const per = {};
  const ver = (h) => { const m = /version=([^&]+)/.exec(h || ''); return m ? decodeURIComponent(m[1]) : null; };
  for (const a of native) { const v = ver(a.getAttribute('href')); if (v) per[v] = (per[v] || 0) + 1; }
  for (const b of ours) { const v = b.getAttribute('data-bt-version'); if (v) per[v] = (per[v] || 0) + 1; }
  return {
    native: native.length,
    ours: ours.length,
    cards: document.querySelectorAll('article.community-card').length,
    per,
    dup: Object.entries(per).filter(([, n]) => n > 1).map(([v, n]) => v + '×' + n),
  };
})()`;

const browser = await chromium.launch({
  executablePath: process.env.BT_HEADLESS_SHELL,
  args: ['--no-sandbox', '--disable-gpu'],
});

try {
  for (const [label, ua] of Object.entries(UAS)) {
    console.log(`\n════════ ${label} UA`);
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: ua,
      locale: 'zh-CN',
      extraHTTPHeaders: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
    });
    const page = await ctx.newPage();
    await page.goto('https://dreamskin.cc/gallery', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('article.community-card', { timeout: 30000 });
    await page.waitForTimeout(1500);

    const pre = await page.evaluate(COUNT);
    // 射程自检：站点在这个 UA 下必须**真的**渲染了它自己的按钮，
    // 否则这一轮什么都没验到（第④种）。
    rec(`[${label}] 注入前站点自己就有一键换肤（否则本轮射程为空）`, pre.native > 0,
      `站点自己 ${pre.native} 颗 / ${pre.cards} 张卡`);

    await page.addStyleTag({ content: CSS });
    await page.evaluate(JS);
    await page.waitForTimeout(1500);

    const post = await page.evaluate(COUNT);
    console.log(`   注入后：站点自己 ${post.native} 颗，我们的 ${post.ours} 颗，覆盖 ${Object.keys(post.per).length} 个版本`);

    rec(`[${label}] 没有任何一个版本出现两颗按钮`, post.dup.length === 0,
      post.dup.length ? '重复的：' + post.dup.join(', ') : `${Object.keys(post.per).length} 个版本各一颗`);
    rec(`[${label}] 站点已有按钮的那些卡，我们没有重复补`, post.ours <= post.cards - pre.native + 0.001,
      `我们补了 ${post.ours} 颗（站点已占 ${pre.native} 颗，共 ${post.cards} 张卡）`);

    // 站点那颗必须已被接管，否则点下去是 ERR_UNKNOWN_URL_SCHEME
    const hijacked = await page.evaluate(() =>
      document.querySelectorAll('a[href^="dreamskin://"][data-bt-hijacked="1"]').length);
    rec(`[${label}] 站点自己那些按钮都已被接管`, hijacked === post.native,
      `${hijacked}/${post.native}`);

    // 真点一下站点那颗，必须回传 apply
    const msgs = [];
    page.on('console', (m) => {
      const t = m.text();
      if (t.startsWith('__BERRYTRACE_EMBED__:')) msgs.push(t.slice('__BERRYTRACE_EMBED__:'.length));
    });
    const clicked = await page.evaluate(() => {
      const a = document.querySelector('a[href^="dreamskin://"][data-bt-hijacked="1"]');
      if (!a) return null;
      const m = /version=([^&]+)/.exec(a.getAttribute('href'));
      a.click();
      return m ? decodeURIComponent(m[1]) : null;
    });
    await page.waitForTimeout(600);
    const applied = msgs.map((s) => { try { return JSON.parse(s); } catch { return null; } })
      .filter((o) => o && o.type === 'apply');
    rec(`[${label}] 点站点那颗按钮，回传的版本号对得上`,
      !!clicked && applied.some((o) => o.versionId === clicked),
      clicked ? `期望 ${clicked}，收到 ${applied.map((o) => o.versionId).join(',') || '(无)'}` : '没找到可点的');

    await ctx.close();
  }
} finally {
  await browser.close();
}

const pass = results.filter((r) => r.ok).length;
console.log(`\n${'='.repeat(66)}\n${results.length} 条判据，${pass} 条通过`);
process.exit(pass === results.length ? 0 : 1);
