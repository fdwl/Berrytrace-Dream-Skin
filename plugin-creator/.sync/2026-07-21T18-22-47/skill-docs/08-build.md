# 08 — 构建规范

## 核心原则

**esbuild 是静态分析工具**——它只能处理静态的 `import/require`。遇到动态路径（如 `require(variable)` 或库内部的懒加载），这些依赖会在运行时找不到。

## 构建模式概览

BerryTrace SDK 现在通过**全局 shim** 注入，不再需要 `external: ['berrytrace-plugin-sdk']`：

- **view 构建（browser）**：`berrytrace-plugin-sdk`、`react`、`react-dom`、`zustand` 均从 `window` 全局变量读取，不打包进产物
- **background 构建（node）**：`berrytrace-plugin-sdk` 和 `electron` external，`package.json` 的 `dependencies` 自动 external
- 构建产物 `minify: false`，方便调试
- JSX 使用 `React.createElement` / `React.Fragment` 作为 factory

---

## 决策树：你的依赖放哪？

```
依赖分类
│
├── 1. 纯 JS 包（axios、zod、ws、dayjs、sharp 等）
│        ↓
│   → 不加 external，esbuild 直接 bundle 进 dist/index.js
│   → package.json: dependencies
│   → 无需 node_modules
│
├── 2. 有动态 require 的大型包（playwright-core、puppeteer 等）
│        ↓
│   → 加 external（避免 esbuild 解析报错）
│   → plugin.json 加 "files" 字段，包含 node_modules
│   → berrytrace pack 会把整个 node_modules 打进 .btp
│
└── 3. 原生 .node 二进制包（better-sqlite3、canvas、node-gyp 系）
         ↓
    → 加 external（esbuild 无法处理 C++ 二进制）
    → bundle.mjs 里 copyFileSync .node 文件到 dist/bin/
    → 代码里用相对路径 require('../bin/module-darwin-arm64.node')
```

**如何判断一个包是否属于第 2 类（动态 require）**：
- 包里没有 `dependencies` 字段，但体积很大（> 3MB）
- `npm install` 后，被 hoist 到顶层的包有几十个（说明间接依赖很多）
- 包的 `lib/` 内有 `require(变量)` 或 `require(模板字符串)`

---

## 标准 bundle.mjs（第 1 类：纯 JS 包）

**95% 的插件用这个**：esbuild 全量 bundle，view 层用全局 shim 注入 SDK/React。

```javascript
import * as esbuild from 'esbuild';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'dist');
mkdirSync(outDir, { recursive: true });

async function build() {

  // ── panel 插件：浏览器渲染层 ──────────────────────────────────
  await esbuild.build({
    entryPoints: [resolve(root, 'src/index.ts')],
    bundle: true,
    outfile: resolve(outDir, 'index.js'),
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    minify: false,
    plugins: [cssPlugin, globalSdkPlugin, globalReactPlugin],
    external: [],  // SDK/React/zustand 通过全局 shim 注入，无需 external
  });

  // ── background / hybrid 插件：Node.js 后台进程 ─────────────────
  // await esbuild.build({
  //   entryPoints: [resolve(root, 'src/background.ts')],
  //   bundle: true,
  //   outfile: resolve(outDir, 'background.js'),
  //   format: 'esm',
  //   platform: 'node',
  //   target: ['node20'],
  //   external: ['berrytrace-plugin-sdk', 'electron'],  // 只 external 这两个！
  //   banner: {
  //     js: `import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);`,
  //   },
  // });
}

build();
```

> **view 构建不再需要 `external: ['berrytrace-plugin-sdk']`**——esbuild 插件会自动将 `berrytrace-plugin-sdk`、`react`、`react-dom`、`zustand` 替换为全局变量引用。

---

## 特殊 bundle.mjs（第 2 类：有动态 require 的大型包）

适用于 `playwright-core`、`puppeteer` 等内部有大量懒加载的包。

> **注意**：background 构建现在会自动将 `package.json` 的 `dependencies` 加入 external，无需手动列举。

```javascript
import * as esbuild from 'esbuild';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'dist');
mkdirSync(outDir, { recursive: true });

const nodeBuiltins = [
  'fs', 'path', 'os', 'child_process', 'http', 'https', 'url', 'events',
  'crypto', 'stream', 'util', 'net', 'tls', 'zlib', 'dns', 'readline',
  'module', 'buffer', 'assert', 'constants', 'vm', 'async_hooks', 'tty',
];

const external = [
  'berrytrace-plugin-sdk',
  'electron',
  ...nodeBuiltins,
  ...nodeBuiltins.map(b => `node:${b}`),
];

// 拦截 .node 原生二进制（esbuild 解析阶段遇到时不报错）
const nativeStubPlugin = {
  name: 'native-stub',
  setup(build) {
    build.onResolve({ filter: /\.node$/ }, args => ({ path: args.path, namespace: 'native-stub' }));
    build.onLoad({ filter: /.*/, namespace: 'native-stub' }, () => ({ contents: `module.exports = {};`, loader: 'js' }));
  },
};

await esbuild.build({
  entryPoints: [resolve(root, 'src/index.ts')],
  bundle: true,
  outfile: resolve(outDir, 'index.js'),
  format: 'esm',
  platform: 'node',
  target: ['node18'],
  external,
  plugins: [nativeStubPlugin],
  banner: {
    js: [
      `import { createRequire as _cr } from 'module';`,
      `import { fileURLToPath as _furl } from 'url';`,
      `import { dirname as _dname } from 'path';`,
      `const require = _cr(import.meta.url);`,
      `const __filename = _furl(import.meta.url);`,
      `const __dirname = _dname(__filename);`,
    ].join(' '),
  },
});

console.log('✅ dist/index.js built');
console.log('ℹ️  node_modules 未内联，发布时用 berrytrace pack（含 files 字段）');
```

**对应的 plugin.json 必须加 `files` 字段**：

```json
{
  "id": "com.berrytrace.plugin.xxx",
  "files": [
    "dist",
    "node_modules",
    "plugin.json",
    "package.json"
  ]
}
```

> **为什么加 `files`？**
> SDK `berrytrace pack` 默认只打包 `package.json` 直接 `dependencies` 里的包。
> `playwright-core` 自身没有 `dependencies`，其懒加载的包（`bplist-creator` 等）靠 npm hoist 到上层，不在直接依赖列表里，会被漏掉。
> 加了 `files` 字段后，SDK 直接按列表打包，跳过依赖过滤，整个 `node_modules` 全部包含。

---

## 特殊处理（第 3 类：原生 .node 二进制）

```javascript
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// 1. esbuild 中声明 external
external: ['berrytrace-plugin-sdk', 'better-sqlite3']

// 2. 构建后复制 .node 文件
const platform = process.platform;
const arch = process.arch;
const srcNode = `node_modules/better-sqlite3/build/Release/better_sqlite3.node`;
const binDir = resolve(root, 'dist/bin');
mkdirSync(binDir, { recursive: true });
if (existsSync(srcNode)) {
  copyFileSync(srcNode, `${binDir}/better_sqlite3-${platform}-${arch}.node`);
}
```

```typescript
// 3. 代码里用相对路径加载
const __dirname = dirname(fileURLToPath(import.meta.url));
const nodePath = join(__dirname, 'bin', `better_sqlite3-${process.platform}-${process.arch}.node`);
const Database = require(nodePath);
```

---

## 按插件类型的构建需求

| 插件类型 | 构建 index.js (browser) | 构建 background.js / index.js (node) |
|:---:|:---:|:---:|
| `panel` | ✅ `platform: 'browser'` | ✗ |
| `background` | ✗ | ✅ `platform: 'node'` |
| `hybrid` | ✅ | ✅ |
| `main` | ✗ | ✅（不分离） |

---

## 常见错误

| 错误信息 | 原因 | 修复 |
|------|------|------|
| `Cannot find package 'xxx'` | 该包有动态 require，esbuild 没有 bundle 进去 | 参考第 2 类方案：external + files 字段 |
| `.node file not found` | native 模块没 copyFile | `copyFileSync` 到 `dist/bin/` |
| `electron is not defined` | background 里误用了 electron API | 改用 SDK 对应方法 |
| `ReferenceError: require is not defined` | ESM 格式用了 CJS require | 加 banner shim（见上方模板）|
