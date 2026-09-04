/**
 * verify-gallery-inject.mjs —— 拿真站点验一遍注入脚本
 *
 * ═══ 为什么必须打真站点 ═════════════════════════════════════════════════════
 *
 * 注入脚本要在**别人的页面**上生效，而那个页面随时会改版。
 * fixture 测不出改版 —— 它只会证明「我们的代码没变」。
 *
 * 0904 这个脚本当场逮到两条**我自己写错的**（都是静默失效）：
 *   · CSS 里那批 class 抄的是**首页**的 `community-home-*`，
 *     而 /gallery 用的是 `community-card-compatibility`、
 *     详情页用的是 `community-preview-apply-unavailable` ⇒ 提示一条都没藏掉；
 *   · 详情页会出**两颗**按钮（decorateCards 与 decorateDetail 各挂一颗）。
 *
 * 还逮到一条**这个脚本自己**的坑：默认 locale 是英文，
 * 而判据按中文文案找 ⇒ 报「0 处提示」，看着像站点没提示。已设 zh-CN。
 *
 * ── 怎么跑（本机需要无头 Chromium）──────────────────────────────────────
 *   LD_LIBRARY_PATH=/data/browsers/sysroot/usr/lib/x86_64-linux-gnu \
 *   BT_HEADLESS_SHELL=<chrome-headless-shell 路径> \
 *   node plugin/scripts/verify-gallery-inject.mjs
 *
 * 失效条件：dreamskin.cc 不再是我们内嵌的站点时，连同 gallery-inject.ts 一起删。
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SRC = new URL('../src/view/gallery-inject.ts', import.meta.url).pathname;
const src = readFileSync(SRC, 'utf-8');

/** 从 TS 源码里把两段模板字符串抠出来（不引 TS 编译器，脚本要能独立跑）。 */
function extractTemplate(name) {
  const start = src.indexOf(`export const ${name} = \``);
  if (start < 0) throw new Error(`没找到 ${name}`);
  const from = src.indexOf('`', start) + 1;
  // 找到未转义的结束反引号
  let i = from;
  while (i < src.length) {
    if (src[i] === '`' && src[i - 1] !== '\\') break;
    i++;
  }
  return src.slice(from, i);
}

let CSS = extractTemplate('GALLERY_CSS');
let JS = extractTemplate('GALLERY_JS');
// GALLERY_JS 里有一处 ${JSON.stringify(...)} 插值，这里按实际值代入。
JS = JS.replace('${JSON.stringify(EMBED_MESSAGE_PREFIX)}', JSON.stringify('__BERRYTRACE_EMBED__:'));
JS = JS.replace('${JSON.stringify(NOTICE_TEXTS)}', JSON.stringify([
  '该主题包不支持当前桌面平台；仍可在线预览或下载',
  '该主题已通过一键换肤格式验证；支持此功能的公开客户端发布后即可直接应用',
  '该版本尚无当前一键换肤兼容性证据；仍可在线预览或下载，客户端导入时会独立严格校验',
  '仅支持预览与下载',
  'This package does not support the current desktop platform; preview or download remains available',
  'Preview and download only',
]));
if (JS.includes('${')) {
  console.warn('⚠️ GALLERY_JS 里还有未代入的插值，测的可能不是真正会跑的那份');
}
// 🔴 上面抠出来的是 TS **源码的原始字节**，模板字符串里的转义（\\\\/ 之类）
// 还没被求值。直接拿去 eval 的话，正则里的 \\\\/ 会变成「字面反斜杠 + 斜杠」，
// 匹配不到任何东西 —— 而且是**静默**匹配不到，表现为「按钮一颗都没出」。
// 这里补上模板求值这一步，让测的和 esbuild 产出的那份逐字相同。
const evalTemplate = (raw) => eval('`' + raw + '`');
CSS = evalTemplate(CSS);
JS = evalTemplate(JS);

const results = [];
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); };

const browser = await chromium.launch({
  executablePath: process.env.BT_HEADLESS_SHELL,
  args: ['--no-sandbox', '--disable-gpu'],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'zh-CN',
  extraHTTPHeaders: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
});
const page = await ctx.newPage();

const guestMessages = [];
page.on('console', (m) => {
  const t = m.text();
  if (t.startsWith('__BERRYTRACE_EMBED__:')) guestMessages.push(t.slice('__BERRYTRACE_EMBED__:'.length));
});

try {
  await page.goto('https://dreamskin.cc/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('a[href*="/themes/ver_"]', { timeout: 30000 });

  // ── 注入前的现场（这是我们要改的那个状态）──────────────────────
  const before = await page.evaluate(() => ({
    cards: document.querySelectorAll('a[href*="/themes/ver_"]').length,
    notices: [...document.querySelectorAll('p, span, div, small')]
      .filter((e) => {
        const t = (e.textContent || '').trim();
        return t.length < 150 && /不支持当前桌面平台|仅支持预览与下载|尚无当前一键换肤兼容性证据|公开客户端发布后|does not support the current desktop platform|Preview and download only/.test(t);
      })
      .filter((e) => getComputedStyle(e).display !== 'none').length,
    siteApplyButtons: document.querySelectorAll('a[href^="dreamskin://"]').length,
  }));
  console.log(`\n注入前：/themes 链接 ${before.cards} 条，可见的兼容性提示 ${before.notices} 处，站点自带一键换肤 ${before.siteApplyButtons} 个`);
  const sample = await page.evaluate(() => {
    const card = document.querySelector('.community-home-card') || document.querySelector('a[href*="/themes/ver_"]')?.closest('article, li, div');
    return card ? (card.innerText || '').slice(0, 300) : '(没找到卡片容器)';
  });
  console.log('第一张卡片的文字：\n' + sample.split('\n').map((l) => '   | ' + l).join('\n') + '\n');
  rec('页面上确实有主题卡片（否则后面全是空转 —— 六点六第④种）', before.cards > 0, `${before.cards} 条链接`);
  rec('注入前确实存在要藏的提示（这是本次注入的射程）', before.notices > 0, `${before.notices} 处可见`);

  // ── 注入 ────────────────────────────────────────────────────────
  await page.addStyleTag({ content: CSS });
  await page.addScriptTag({ content: JS });
  await page.waitForTimeout(600);

  // ── 注入后 ──────────────────────────────────────────────────────
  const after = await page.evaluate(() => ({
    visibleNotices: [...document.querySelectorAll('p, span, div, small')]
      .filter((e) => {
        const t = (e.textContent || '').trim();
        return t.length < 150 && /不支持当前桌面平台|仅支持预览与下载|尚无当前一键换肤兼容性证据|公开客户端发布后|does not support the current desktop platform|Preview and download only/.test(t);
      })
      .filter((e) => getComputedStyle(e).display !== 'none').length,
    btButtons: document.querySelectorAll('.bt-apply-btn').length,
    versions: [...document.querySelectorAll('.bt-apply-btn')].map((b) => b.dataset.btVersion),
    firstBtnVisible: (() => {
      const b = document.querySelector('.bt-apply-btn');
      if (!b) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })(),
  }));

  console.log(`注入后：可见提示 ${after.visibleNotices} 处，我们的按钮 ${after.btButtons} 颗\n`);
  rec('① 平台/兼容性提示已全部藏掉', after.visibleNotices === 0, `剩 ${after.visibleNotices} 处`);
  rec('② 每张卡片都补上了「一键换肤」', after.btButtons > 0, `${after.btButtons} 颗`);
  rec('② 按钮真的可见（有宽高，不是被挤成 0）', after.firstBtnVisible === true);
  rec('② 抠出来的版本号形状正确', after.versions.every((v) => /^ver_[a-z0-9]{8,64}$/.test(v || '')), after.versions.slice(0, 3).join(', '));
  rec('② 一张卡片只出一颗按钮（版本号不重复）', new Set(after.versions).size === after.versions.length, `${after.versions.length} 颗 / ${new Set(after.versions).size} 个不同版本`);

  // ── ③ 点一下 ────────────────────────────────────────────────────
  const target = after.versions[0];
  await page.click('.bt-apply-btn');
  await page.waitForTimeout(300);
  const applyMsgs = guestMessages.map((m) => { try { return JSON.parse(m); } catch { return null; } }).filter((m) => m && m.type === 'apply');
  rec('③ 点击送回了 apply 消息', applyMsgs.length > 0, `${applyMsgs.length} 条`);
  rec('③ 送回的版本号与按钮上的一致', applyMsgs[0]?.versionId === target, `期望 ${target}，收到 ${applyMsgs[0]?.versionId}`);

  // ── SPA 换路由之后脚本还在不在（MutationObserver 常驻）──────────
  const detailHref = await page.getAttribute('a[href*="/themes/ver_"]', 'href');
  await page.click('a[href*="/themes/ver_"]');
  await page.waitForTimeout(1500);
  const onDetail = await page.evaluate(() => ({
    url: location.pathname,
    btButtons: document.querySelectorAll('.bt-apply-btn').length,
  }));
  rec('④ SPA 换路由到详情页后按钮仍在（MutationObserver 常驻生效）', onDetail.btButtons > 0, `${onDetail.url} 上 ${onDetail.btButtons} 颗`);

  // ready 消息
  const ready = guestMessages.map((m) => { try { return JSON.parse(m); } catch { return null; } }).filter((m) => m && m.type === 'ready');
  rec('脚本自报就绪', ready.length > 0);
  const errs = guestMessages.map((m) => { try { return JSON.parse(m); } catch { return null; } }).filter((m) => m && m.type === 'error');
  rec('脚本自身没有抛异常', errs.length === 0, errs.map((e) => e.message).join('; '));
} finally {
  await browser.close();
}

console.log('\n' + '='.repeat(66));
const bad = results.filter((r) => !r.ok);
console.log(`${results.length} 条判据，${results.length - bad.length} 条通过`);
for (const b of bad) console.log(`  ❌ ${b.name}${b.detail ? ' — ' + b.detail : ''}`);
process.exit(bad.length ? 1 : 0);
