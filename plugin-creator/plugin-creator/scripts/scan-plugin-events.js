/**
 * 扫描所有插件的 plugin.json，收集 contributes.events 声明。
 *
 * 用法：
 *   # 方式1：扫描 plugins-dev/ 目录（开发模式）
 *   node scripts/scan-plugin-events.js
 *
 *   # 方式2：从宿主导出的 JSON 读取（生产模式）
 *   open 'berrytrace://export-plugins?to=/tmp/plugins.json'
 *   node scripts/scan-plugin-events.js --json /tmp/plugins.json
 *
 *   # 方式3：指定自定义扫描目录
 *   node scripts/scan-plugin-events.js --dir /path/to/plugins
 *
 *   # 指定输出
 *   node scripts/scan-plugin-events.js --out /path/to/output.md
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

// ─── 解析参数 ───
let jsonFile = null;
let scanDir = null;
let outputFile = path.resolve(__dirname, '../references/22-plugin-events.md');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json' && args[i + 1]) { jsonFile = args[++i]; }
  else if (args[i] === '--dir' && args[i + 1]) { scanDir = args[++i]; }
  else if (args[i] === '--out' && args[i + 1]) { outputFile = path.resolve(args[++i]); }
}

// ─── 收集插件列表 ───
let pluginDirs = [];

if (jsonFile) {
  // 从宿主导出的 JSON 读取
  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ JSON 文件不存在: ${jsonFile}`);
    console.error(`   先运行: open 'berrytrace://export-plugins?to=${jsonFile}'`);
    process.exit(1);
  }
  const plugins = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  pluginDirs = plugins.filter(p => p.path).map(p => p.path);
  console.log(`📋 从宿主导出: ${pluginDirs.length} 个插件`);
} else {
  // 扫描多个目录：plugins-dev/ + ~/.berrytrace/plugins/
  const dirsToScan = [];
  
  // 开发目录
  const devDir = path.resolve(__dirname, '../../../../');
  if (fs.existsSync(devDir)) dirsToScan.push(devDir);
  
  // 用户插件目录
  const userPluginDir = path.join(os.homedir(), '.berrytrace', 'plugins');
  if (fs.existsSync(userPluginDir)) dirsToScan.push(userPluginDir);
  
  if (scanDir) dirsToScan.push(scanDir);
  
  for (const d of dirsToScan) {
    try {
      const items = fs.readdirSync(d, { withFileTypes: true });
      const dirs = items.filter(i => i.isDirectory()).map(i => path.join(d, i.name));
      pluginDirs.push(...dirs);
    } catch (e) {
      console.log(`⚠️  跳过 ${d}: ${e.message}`);
    }
  }
  console.log(`📋 扫描找到: ${pluginDirs.length} 个插件目录`);
}

// ─── 收集 events 声明 ───
const plugins = [];
let pluginCount = 0;

for (const dir of pluginDirs) {
  const pluginJsonPath = path.join(dir, 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) continue;

  try {
    const raw = fs.readFileSync(pluginJsonPath, 'utf-8');
    const manifest = JSON.parse(raw);
    const events = manifest?.contributes?.events;
    if (!events) continue;

    pluginCount++;
    plugins.push({
      id: manifest.id || path.basename(dir),
      name: manifest.name || path.basename(dir),
      emits: events.emits || [],
      listens: events.listens || [],
    });
  } catch (e) {
    console.error(`⚠️  跳过 ${path.basename(dir)}/plugin.json: ${e.message}`);
  }
}

// ─── 按事件维度重新组织 ───
const emitsByEvent = {};
const listensByEvent = {};

for (const p of plugins) {
  for (const e of p.emits) {
    if (!emitsByEvent[e.name]) emitsByEvent[e.name] = [];
    emitsByEvent[e.name].push({ plugin: p.id, desc: e.description || '' });
  }
  for (const l of p.listens) {
    if (!listensByEvent[l.name]) listensByEvent[l.name] = [];
    listensByEvent[l.name].push({ plugin: p.id, desc: l.description || '' });
  }
}

// ─── 生成 Markdown ───
const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
let md = `# 22 — 插件事件总览\n\n`;
md += `> 自动扫描于 ${timestamp}\n`;
md += jsonFile ? `> 来源: \`${jsonFile}\` (berrytrace://export-plugins)\n\n` : `> 来源: \`${scanDir || 'plugins-dev/'}\`\n\n`;

if (pluginCount === 0) {
  md += `⚠️ 未找到任何声明了 \`contributes.events\` 的插件。\n\n`;
  md += `在 \`plugin.json\` 中添加：\n`;
  md += `\`\`\`json\n{ "contributes": { "events": { "emits": [...], "listens": [...] } } }\n\`\`\`\n`;
} else {
  md += `## 交叉索引（按事件）\n\n`;
  md += `| 事件名 | 发射方 | 监听方 |\n`;
  md += `|--------|--------|--------|\n`;
  const allEventNames = new Set([...Object.keys(emitsByEvent), ...Object.keys(listensByEvent)]);
  for (const ev of [...allEventNames].sort()) {
    const emitters = (emitsByEvent[ev] || []).map(e => `\`${e.plugin}\``).join(', ') || '—';
    const listeners = (listensByEvent[ev] || []).map(l => `\`${l.plugin}\``).join(', ') || '—';
    md += `| \`${ev}\` | ${emitters} | ${listeners} |\n`;
  }
  md += '\n';

  md += `## 按插件\n\n`;
  for (const p of plugins) {
    md += `### ${p.name || p.id}\n\n`;
    if (p.emits.length > 0) {
      md += `**发射**：\n`;
      for (const e of p.emits) md += `- \`${e.name}\`${e.description ? ' — ' + e.description : ''}\n`;
    }
    if (p.listens.length > 0) {
      md += `**监听**：\n`;
      for (const l of p.listens) md += `- \`${l.name}\`${l.description ? ' — ' + l.description : ''}\n`;
    }
    md += '\n';
  }
}

md += `> 声明 events 后在 \`plugin.json\` 中维护，运行 \`node scripts/scan-plugin-events.js\` 更新。\n`;
md += `> 宿主导出插件列表：\`open 'berrytrace://export-plugins?to=/tmp/plugins.json'\`\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, md, 'utf-8');

// ─── 控制台输出 ───
console.log(`✅ ${outputFile}`);
console.log(`   ${pluginCount} 个插件声明了 contributes.events`);

if (pluginCount > 0) {
  console.log('');
  console.log('发射方 → 监听方：');
  for (const ev of [...new Set([...Object.keys(emitsByEvent), ...Object.keys(listensByEvent)])].sort()) {
    const e = emitsByEvent[ev] || [];
    const l = listensByEvent[ev] || [];
    const eNames = e.map(x => x.plugin.replace('com.berrytrace.plugin.', '')).join(', ') || '—';
    const lNames = l.map(x => x.plugin.replace('com.berrytrace.plugin.', '')).join(', ') || '—';
    console.log(`  ${ev.padEnd(30)} ${eNames.padEnd(20)} → ${lNames}`);
  }
}
