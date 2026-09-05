#!/usr/bin/env node
/**
 * 浮层可读性判据自检。
 *
 * 两半：
 *  A. 源码判据 —— glassCss 里那条浮层规则的底色和字色必须都走 var()，不许是常量。
 *  B. 纯函数判据 —— inferAppearanceFromColors 用合成输入喂全分支。
 *
 * 跑法：node plugin/scripts/verify-popover-contrast.mjs
 * 失效条件：theme-adapter.ts 不再注入 has-wallpaper 浮层规则时，A 半可以删。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src', 'adapter', 'theme-adapter.ts');
const src = fs.readFileSync(SRC, 'utf8');

let failed = 0;
const ok = (name) => console.log(`  ✅ ${name}`);
const bad = (name, detail) => { failed++; console.log(`  ❌ ${name}\n     ${detail}`); };

console.log('\nA. 源码判据：浮层规则不许用常量色');
// 抠出第 5 条规则体
const m = src.match(/html\.has-wallpaper \.bg-popover,[\s\S]*?\{([\s\S]*?)\}/);
if (!m) {
  bad('找得到浮层规则', '没匹配到 html.has-wallpaper .bg-popover 那条规则 —— 规则被删或改名了');
} else {
  const body = m[1];
  const bg = (body.match(/background-color:\s*([^;]+);/) || [])[1]?.trim();
  const fg = (body.match(/(?:^|\s)color:\s*([^;]+);/) || [])[1]?.trim();

  if (!bg) bad('规则里有 background-color', '一条都没有');
  else if (/rgba?\(\s*\d/.test(bg)) bad('底色不是写死的常量', `实际是 ${bg} —— 常量与皮肤无关，换壁纸不会变`);
  else if (!/var\(--/.test(bg)) bad('底色走 var()', `实际是 ${bg}`);
  else ok(`底色走 var()：${bg}`);

  if (!fg) bad('规则里有 color（字色）', '只设了底色不设字色 —— 这正是 1.06:1 那个 bug 的形状');
  else if (!/var\(--/.test(fg)) bad('字色走 var()', `实际是 ${fg}`);
  else ok(`字色走 var()：${fg}`);

  if (bg && fg && /var\(--popover\)/.test(bg) && /var\(--popover-foreground\)/.test(fg)) {
    ok('底色与字色同源（--popover / --popover-foreground 成对）');
  } else if (bg && fg) {
    bad('底色与字色同源', `bg=${bg} fg=${fg} —— 两者必须来自同一族 token，否则可以任意错配`);
  }
}

console.log('\nB. 纯函数判据：inferAppearanceFromColors 全分支');
// 从源码里抠出三个纯函数直接跑（这个仓没有测试框架，也不给它加一套）
const grab = (name) => {
  const re = new RegExp(`export function ${name}\\(([\\s\\S]*?)\\n\\}`, 'm');
  const g = src.match(re);
  if (!g) throw new Error(`抠不到 ${name}`);
  return `function ${name}(${g[1]}\n}`;
};
const mod = [grab('parseColorToRgb'), grab('relativeLuminance'), grab('inferAppearanceFromColors')]
  .join('\n')
  // 抠出来的代码依赖 hexToRgbTriple，用等价实现顶上
  .replace(/const triple = hexToRgbTriple\(colorStr \|\| undefined\);/,
    `const _m = String(colorStr||'').trim().match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
     let triple = null;
     if (_m) { let h=_m[1]; if(h.length===3||h.length===4) h=h.split('').map(x=>x+x).join('');
       triple = parseInt(h.slice(0,2),16)+' '+parseInt(h.slice(2,4),16)+' '+parseInt(h.slice(4,6),16); }`)
  // 去掉 TS 类型标注
  .replace(/: \[number, number, number\] \| null/g, '').replace(/: \[number, number, number\]/g, '')
  .replace(/: string \| undefined \| null/g, '').replace(/: number/g, '')
  .replace(/: DreamSkinColors \| undefined \| null/g, '').replace(/: 'light' \| 'dark' \| null/g, '');
const fns = new Function(`${mod}; return { parseColorToRgb, relativeLuminance, inferAppearanceFromColors };`)();

const cases = [
  // [名字, colors, 期望]
  ['暮色温柔（实机取的真值）', { text: '#f0f0ef', background: '#141313', panel: '#1e1d1d' }, 'dark'],
  ['明日香 二号机（实机取的真值）', { text: '#ffffff', background: '#5b3333', panel: '#4d4242' }, 'dark'],
  ['浅色皮肤', { text: '#2d1719', background: '#fcebed', panel: '#fcebed' }, 'light'],
  ['background 缺失时退到 panel', { text: '#ffffff', panel: '#1e1d1d' }, 'dark'],
  ['rgb() 形式也认', { text: 'rgb(255,255,255)', background: 'rgb(20,19,19)' }, 'dark'],
  ['三位简写', { text: '#fff', background: '#111' }, 'dark'],
  ['text 缺失 → 不猜', { background: '#141313' }, null],
  ['底色字色一样亮 → 不猜', { text: '#808080', background: '#808080' }, null],
  ['颜色认不出来 → 不猜', { text: 'chartreuse', background: 'rebeccapurple' }, null],
  ['colors 为空 → 不猜', null, null],
];
for (const [name, colors, want] of cases) {
  const got = fns.inferAppearanceFromColors(colors);
  if (got === want) ok(`${name} → ${got}`);
  else bad(name, `期望 ${want}，实际 ${got}`);
}

console.log(failed === 0 ? '\n全部通过\n' : `\n${failed} 条不通过\n`);
process.exit(failed === 0 ? 0 : 1);
