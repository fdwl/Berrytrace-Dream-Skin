// 实测 DARK_OVERRIDE_CSS：只看点名的关键元素，判据是 oklch 的 L 分量本身。
//
// 🔴 前两版都栽在同一件事上：**这台机器的 Chromium 不把 oklch() 归一成 rgb**，
// 无论是 `el.style.color` + getComputedStyle 还是 canvas 的 fillStyle。
// 于是自制的亮度函数把 `oklch(0.93 …)` 的三个数当成 rgb(0.93, 0.004, 260)，
// 算出来接近全黑 ⇒ 把一屏浅色字全报成「暗底暗字」。
// 这正是 CLAUDE.md 六点六说的那种「harness 自己瞎」：脚本在跑、断言在执行，
// 就是分辨不出对错。
//
// 改法不是继续修亮度函数，是**换判据**：oklch 的第一个数就是感知亮度 L，
// 直接读它。读不到 L 的（rgb / color(srgb …)）单独列出来人眼看。
import { chromium } from 'playwright';
import fs from 'node:fs';

const SRC = '/data/work/Berrytrace-Dream-Skin/plugin/src/view/gallery-inject.ts';
const raw = fs.readFileSync(SRC, 'utf8');
const m = raw.match(/export const DARK_OVERRIDE_CSS = `([\s\S]*?)\n`;/);
if (!m) { console.error('没抠到 DARK_OVERRIDE_CSS'); process.exit(1); }
const CSS = m[1];

const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * 取「感知亮度」。两种格式都认：
 *   · `oklch(L C H)` —— 第一个数**就是** L（带 % 时除 100）；
 *   · `color(srgb r g b / a)` —— 顶栏那种，按 sRGB 相对亮度折一下。
 * 其余（rgba(0,0,0,0) 这类全透明）返回 null，表示「这个元素自己没有底色」。
 */
const L = (s) => {
  const str = String(s || '').trim();
  const ok = /^oklch\(\s*([\d.]+)(%?)/.exec(str);
  if (ok) { const v = parseFloat(ok[1]); return ok[2] === '%' ? v / 100 : v; }
  const sr = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(str);
  if (sr) {
    const a = sr[4] === undefined ? 1 : parseFloat(sr[4]);
    if (a < 0.5) return null;   // 太透明，压的是祖先的底，别拿它判
    return 0.2126 * parseFloat(sr[1]) + 0.7152 * parseFloat(sr[2]) + 0.0722 * parseFloat(sr[3]);
  }
  return null;
};

const TARGETS = [
  ['页面底', 'body'],
  ['顶栏', 'header.nav'],
  ['大标题', 'main h1'],
  ['分段控件槽', '.gallery-source-switcher'],
  ['外观筛选胶囊', '.gallery-community-appearance'],
  ['卡片', 'article.community-card'],
  ['卡片标题', '.community-card-title'],
  ['作者', '.community-card-author'],
  // 🔴 主按钮是**故意反色**的（暗色模式下强调按钮就该浅底深字），
  // 所以它不适用「底必须暗」那条通用判据 —— 只看对比度。
  ['主按钮', '.btn.is-primary', 'inverted'],
  ['次按钮', '.btn.is-ghost'],
  ['分页', '.ds-pagination-page'],
];

const READ = (targets) => {
  const out = [];
  for (const [name, sel] of targets) {
    const el = document.querySelector(sel);
    if (!el) { out.push({ name, sel, missing: true }); continue; }
    const cs = getComputedStyle(el);
    out.push({ name, sel, bg: cs.backgroundColor, color: cs.color });
  }
  const t = document.querySelector('.community-card-thumbnail');
  out.push({ name: '皮肤预览区 --bg', sel: '.community-card-thumbnail',
    bg: t ? getComputedStyle(t).getPropertyValue('--bg').trim() : '(本页没有)', color: '—' });
  return out;
};

const browser = await chromium.launch({
  executablePath: process.env.BT_HEADLESS_SHELL,
  args: ['--no-sandbox', '--disable-gpu'],
});
const ctx = await browser.newContext({
  userAgent: MAC_UA, locale: 'zh-CN',
  extraHTTPHeaders: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
});
const page = await ctx.newPage();

await page.goto('https://dreamskin.cc/gallery', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('article.community-card', { timeout: 30000 });
await page.waitForTimeout(3000);

const before = await page.evaluate(READ, TARGETS);
await page.evaluate((css) => {
  let n = document.getElementById('__bt_embed_dynamic_css');
  if (!n) { n = document.createElement('style'); n.id = '__bt_embed_dynamic_css'; (document.head||document.documentElement).appendChild(n); }
  n.textContent = css;
}, CSS);
await page.waitForTimeout(800);
const after = await page.evaluate(READ, TARGETS);

console.log('\n元素                 │ 注入前底色 L │ 注入后底色 L │ 注入后文字 L │ 判定');
console.log('─────────────────────┼──────────────┼──────────────┼──────────────┼──────');
let bad = 0, checked = 0;
for (let i = 0; i < before.length; i++) {
  const b = before[i], a = after[i];
  if (b.missing) { console.log(`${b.name.padEnd(20)} │ (本页没有这个元素)`); continue; }
  const lb = L(b.bg), la = L(a.bg), lc = L(a.color);
  const f = (v) => v === null ? '  —   ' : v.toFixed(3).padStart(6);
  let verdict = '';
  if (la !== null && lc !== null) {
    checked++;
    const gap = Math.abs(la - lc);
    // 底色必须真的暗下来（L<0.5），且与文字拉开足够差距
    const inverted = TARGETS[i] && TARGETS[i][2] === 'inverted';
    if (!inverted && la >= 0.5) { verdict = '❌ 底没暗'; bad++; }
    else if (gap < 0.35) { verdict = `❌ 对比 ${gap.toFixed(2)}`; bad++; }
    else verdict = `✅ 对比 ${gap.toFixed(2)}`;
  } else if (a.name && a.name.startsWith('皮肤预览区')) {
    // 这一条相反：**必须**还是浅色
    const lp = L(a.bg);
    checked++;
    if (lp !== null && lp > 0.9) verdict = '✅ 保持原样';
    else { verdict = '❌ 被染了'; bad++; }
  } else {
    verdict = '（非 oklch，见下）';
  }
  console.log(`${b.name.padEnd(20)} │ ${f(lb)}       │ ${f(la)}       │ ${f(lc)}       │ ${verdict}`);
  if (la === null || lc === null) console.log(`${''.padEnd(20)} │   原值 bg=${a.bg}  color=${a.color}`);
}

// 主按钮单独全量核（不止第一个）
const btns = await page.evaluate(() => [...document.querySelectorAll('.btn.is-primary')].map((a) => {
  const cs = getComputedStyle(a);
  return { t: (a.textContent||'').trim().slice(0,8), bg: cs.backgroundColor, c: cs.color };
}));
console.log(`\n主按钮共 ${btns.length} 个：`);
for (const b of btns.slice(0, 8)) {
  const lb = L(b.bg), lc = L(b.c);
  const ok = lb !== null && lc !== null && Math.abs(lb - lc) > 0.35;
  console.log(`   「${b.t}」 底 L=${lb === null ? b.bg : lb.toFixed(3)}  字 L=${lc === null ? b.c : lc.toFixed(3)}  ${ok ? '✅' : '❌'}`);
  if (!ok) bad++;
}

// 可逆
await page.evaluate(() => { const n = document.getElementById('__bt_embed_dynamic_css'); if (n) n.textContent = ''; });
await page.waitForTimeout(400);
const rev = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const revOk = rev === before[0].bg;
console.log(`\n撤掉覆盖：body bg=${rev}（原 ${before[0].bg}）→ ${revOk ? '✅ 可逆' : '❌ 没回去'}`);
if (!revOk) bad++;

console.log(`\n═══ 判定：检查 ${checked} 项 + ${btns.length} 个主按钮 + 可逆，失败 ${bad} 项 ═══`);
await browser.close();
process.exit(bad ? 1 : 0);
