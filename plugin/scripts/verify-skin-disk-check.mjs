/**
 * 「哪些已存皮肤缺图 / 哪些能重新下载」的纯判定验证。
 * 跑法：node plugin/scripts/verify-skin-disk-check.mjs
 *
 * 用 esbuild 把 src/adapter/skin-disk-check.ts 打成内存里的 ESM 再 import，
 * 不需要测试框架。判定是纯函数，输入全是合成数据。
 *
 * 失效条件：skin-disk-check.ts 被删，或仓库引入正式测试框架后本脚本并入其中。
 */
import { build } from 'esbuild';
import assert from 'node:assert/strict';

const out = await build({
  entryPoints: [new URL('../src/adapter/skin-disk-check.ts', import.meta.url).pathname],
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'node',
});
const code = out.outputFiles[0].text;
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const { imageRelPath, partitionByDisk, redownloadVersionId, splitRedownloadable } = mod;

const ver = 'ver_abcdefgh12';
const skins = [
  { id: 'a', skinDir: ver, imageFile: 'background.png' },            // 在
  { id: 'b', skinDir: 'ver_zzzzzzzz99', imageFile: 'bg.png' },       // 缺，目录名即版本号
  { id: 'c', skinDir: 'my_import', imageFile: 'pack/bg.webp' },      // 缺，手动导入
  { id: 'd' },                                                       // 纯色，没有图
  { id: 'e', skinDir: 'my_import', imageFile: 'x.png', versionId: 'ver_qqqqqqqq11' }, // 缺，显式版本号
];

assert.equal(imageRelPath(skins[2]), 'my_import/pack/bg.webp');
assert.equal(imageRelPath(skins[3]), null);

const present = new Set([`${ver}/background.png`]);
const { ok, missing } = partitionByDisk(skins, present);
assert.deepEqual(ok.map((s) => s.id), ['a', 'd']);
assert.deepEqual(missing.map((s) => s.id), ['b', 'c', 'e']);

// 对照组：磁盘全空时，只有纯色皮肤能留下 —— 证明上面的 'a' 是因为文件在才留下的。
const none = partitionByDisk(skins, new Set());
assert.deepEqual(none.ok.map((s) => s.id), ['d']);

assert.equal(redownloadVersionId(skins[1]), 'ver_zzzzzzzz99');
assert.equal(redownloadVersionId(skins[2]), null);
assert.equal(redownloadVersionId(skins[4]), 'ver_qqqqqqqq11');

const { redownloadable, manualOnly } = splitRedownloadable(missing);
assert.deepEqual(redownloadable.map((r) => r.skin.id), ['b', 'e']);
assert.deepEqual(manualOnly.map((s) => s.id), ['c']);

console.log('skin-disk-check: all assertions passed');
