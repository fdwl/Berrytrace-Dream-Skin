# 08 — 构建规范

## ⚡ 快速路径：SDK 内置构建（推荐）

**绝大多数插件不需要写 `bundle.mjs`**。`berrytrace-cli` 内置了完整的 esbuild 构建流程：

```bash
# 零配置构建当前目录的插件，并在构建成功后自动通知宿主热重载
berrytrace-cli build --reload

# 或在指定插件目录下执行
npx berrytrace-plugin-sdk build [path] --reload

# 单独通知宿主热重载 / 解包加载
npx berrytrace-plugin-sdk reload [path|pluginId]
```

**SDK 内置构建已自动处理的 shim**（browser view 层无需任何配置）：

| 包 | 替换为 |
|---|---|
| `react` | `window.React` |
| `react-dom` / `react-dom/client` | `window.ReactDOM` |
| `react/jsx-runtime` | `window.React.createElement` |
| `zustand` | `window.Zustand` |
| `lucide-react` | `window.__lucide`（宿主 v1.0.17+ 已支持） |
| `berrytrace-plugin-sdk` | `window.berrytrace` |
| `@/stores/user` | `window.useUserStore` |
| `@/stores/app` | `window.useAppStore` |
| `@/services/http` | `window.httpService` |

**SDK 内置构建的触发逻辑**：
- `berrytrace-cli build` → 调用 `performSdkBuild()`，完全走 SDK 的 esbuild 流程
- `berrytrace-cli pack` / `publish` → 若插件有 `package.json#scripts.build`，先跑 `npm run build`；否则也走 SDK 自动构建
- **插件有自定义 build script → SDK 自动构建被跳过**（这就是为什么 datahub 需要自己写 bundle.mjs）

> **什么时候才需要写 bundle.mjs？**
> - 插件有复杂的 CSS 处理（如 ProseMirror 多文件 CSS 合并）
> - 使用了 SDK 不支持的特殊 shim（极少见）
> - hybrid 插件需要并行构建 view + main 并控制顺序
> - 其他 95% 的情况：直接用 `berrytrace-cli build`，不写 bundle.mjs

---

## 核心原则

**esbuild 是打包工具**——它把 `import/require` 的依赖全部 bundle 进一个产物文件。遇到动态路径（如 `require(variable)` 或库内部的懒加载），这些依赖会在运行时找不到。

**view（浏览器）层的关键约束**：浏览器 ES module 无法解析 `'react'`、`'lucide-react'` 等 bare specifier——这些包必须通过 esbuild 的 `globalShimPlugin` 替换为从 `window` 全局变量读取，**不可以依赖浏览器去解析 node_modules**。

---

## 宿主全局变量清单（Browser 渲染进程可用）

宿主在 `src/main.tsx` 中初始化时，会将以下变量挂载到 `window`，**插件 view 层可以直接使用**：

| `window.*` 变量 | 内容 | 对应 npm 包 |
|---|---|---|
| `window.React` | React 完整对象（含 hooks） | `react` |
| `window.ReactDOM` | ReactDOM（含 `createRoot`、`createPortal`、`flushSync`） | `react-dom` |
| `window.Zustand` | Zustand（含 `create`、`useStore`） | `zustand` |
| `window.__lucide` | lucide-react 全部图标 | `lucide-react` |

> **注意**：以上仅限渲染进程（view/panel 层）。background/Node.js 进程不能访问 `window`。

---

## 构建模式概览

- **view 构建（browser）**：用 esbuild + `globalShimPlugin`，将 `react`/`react-dom`/`zustand`/`lucide-react` 替换为 `window.*` 全局变量读取；`berrytrace-plugin-sdk` 可直接 bundle（SDK 是 symlink，不含 native 代码）。
- **background 构建（node）**：`berrytrace-plugin-sdk` 和 `electron` external，其余纯 JS 依赖直接 bundle。
- 构建产物 `minify: false`，方便调试。
- JSX 使用 `jsxFactory: 'React.createElement'` / `jsxFragment: 'React.Fragment'`。

---

## 决策树：你的依赖放哪？

```
依赖分类
│
├── 1. 纯 JS 包（axios、zod、ws、dayjs 等）
│        ↓
│   → 不加 external，esbuild 直接 bundle 进产物
│   → package.json: dependencies
│
├── 2. 宿主已全局暴露的包（react、react-dom、zustand、lucide-react）
│        ↓
│   → 用 globalShimPlugin 替换为 window.* 读取（见下方完整实现）
│   → 不打包、不 external——由 shim 在编译时替换
│
├── 3. 有动态 require 的大型包（playwright-core、puppeteer 等）
│        ↓
│   → 加 external（避免 esbuild 解析报错）
│   → plugin.json 加 "files" 字段，包含 node_modules
│   → berrytrace pack 会把整个 node_modules 打进 .btp
│
└── 4. 原生 .node 二进制包（better-sqlite3、canvas 等）
         ↓
     → 加 external（esbuild 无法处理 C++ 二进制）
     → bundle.mjs 里 copyFileSync .node 文件到 dist/bin/
     → 代码里用相对路径 require('../bin/module-darwin-arm64.node')
```

---

## globalShimPlugin 完整实现

> ⚠️ **这是 view 构建的必备插件**。原始文档只写了名字，这里给出经过实际插件验证的完整代码。

```javascript
/**
 * globalShimPlugin
 *
 * 将浏览器无法解析的 bare specifier 替换为从宿主 window 全局变量读取。
 * 宿主 (src/main.tsx) 已暴露：
 *   window.React       — react
 *   window.ReactDOM    — react-dom
 *   window.Zustand     — zustand
 *   window.__lucide    — lucide-react（全部图标）
 */
const globalShimPlugin = {
  name: 'global-shim',
  setup(build) {

    // ── react ──────────────────────────────────────────────────────────
    build.onResolve({ filter: /^react$/ }, () =>
      ({ path: 'react', namespace: 'shim' }));
    build.onLoad({ filter: /^react$/, namespace: 'shim' }, () => ({
      contents: `
const R = window.React;
export default R;
export const useState      = R.useState;
export const useEffect     = R.useEffect;
export const useCallback   = R.useCallback;
export const useMemo       = R.useMemo;
export const useRef        = R.useRef;
export const useContext    = R.useContext;
export const createContext = R.createContext;
export const forwardRef    = R.forwardRef;
export const memo          = R.memo;
export const createElement = R.createElement;
export const Fragment      = R.Fragment;
export const Children      = R.Children;
export const cloneElement  = R.cloneElement;
export const isValidElement = R.isValidElement;
      `.trim(),
      loader: 'js',
    }));

    // ── react/jsx-runtime（esbuild 自动生成的 JSX 转换层）─────────────
    build.onResolve({ filter: /^react\/jsx-runtime$/ }, () =>
      ({ path: 'react/jsx-runtime', namespace: 'shim' }));
    build.onLoad({ filter: /^react\/jsx-runtime$/, namespace: 'shim' }, () => ({
      contents: `
const R = window.React;
export const jsx      = R.createElement;
export const jsxs     = R.createElement;
export const Fragment = R.Fragment;
      `.trim(),
      loader: 'js',
    }));

    // ── react-dom ──────────────────────────────────────────────────────
    build.onResolve({ filter: /^react-dom(\/.*)?$/ }, () =>
      ({ path: 'react-dom', namespace: 'shim' }));
    build.onLoad({ filter: /^react-dom$/, namespace: 'shim' }, () => ({
      contents: `
const RD = window.ReactDOM || {};
export default RD;
export const createPortal = RD.createPortal;
export const createRoot   = RD.createRoot;
export const render       = RD.render;
export const flushSync    = RD.flushSync;
      `.trim(),
      loader: 'js',
    }));

    // ── lucide-react（按需导出常用图标，未列举的图标在运行时动态读取）──
    build.onResolve({ filter: /^lucide-react$/ }, () =>
      ({ path: 'lucide-react', namespace: 'shim' }));
    build.onLoad({ filter: /^lucide-react$/, namespace: 'shim' }, () => ({
      contents: `
const _L = window.__lucide || {};
export default _L;
// esbuild 会 tree-shake 未使用的导出，只打包实际用到的图标名引用
export const Loader2         = _L.Loader2;
export const CheckCircle2    = _L.CheckCircle2;
export const AlertCircle     = _L.AlertCircle;
export const Circle          = _L.Circle;
export const X               = _L.X;
export const Terminal        = _L.Terminal;
export const Database        = _L.Database;
export const FileCode        = _L.FileCode;
export const Sparkles        = _L.Sparkles;
export const RefreshCw       = _L.RefreshCw;
export const Upload          = _L.Upload;
export const Server          = _L.Server;
export const HardDrive       = _L.HardDrive;
export const Globe           = _L.Globe;
export const Plus            = _L.Plus;
export const Trash2          = _L.Trash2;
export const Lock            = _L.Lock;
export const Settings2       = _L.Settings2;
export const Zap             = _L.Zap;
export const Eye             = _L.Eye;
export const MoreVertical    = _L.MoreVertical;
export const ArrowLeft       = _L.ArrowLeft;
export const ArrowRight      = _L.ArrowRight;
export const Link2           = _L.Link2;
export const AlertTriangle   = _L.AlertTriangle;
export const Save            = _L.Save;
export const ChevronDown     = _L.ChevronDown;
export const ChevronUp       = _L.ChevronUp;
export const ChevronLeft     = _L.ChevronLeft;
export const ChevronRight    = _L.ChevronRight;
export const Info            = _L.Info;
export const Search          = _L.Search;
export const Copy            = _L.Copy;
export const ExternalLink    = _L.ExternalLink;
export const Check           = _L.Check;
export const Edit3           = _L.Edit3;
export const Folder          = _L.Folder;
export const File            = _L.File;
export const Network         = _L.Network;
export const Shield          = _L.Shield;
export const Key             = _L.Key;
export const Clock           = _L.Clock;
export const Activity        = _L.Activity;
export const Table           = _L.Table;
export const Code            = _L.Code;
export const Filter          = _L.Filter;
export const List            = _L.List;
export const Grid            = _L.Grid;
export const Settings        = _L.Settings;
export const User            = _L.User;
export const Users           = _L.Users;
export const Home            = _L.Home;
export const Bell            = _L.Bell;
export const LogOut          = _L.LogOut;
export const Power           = _L.Power;
export const Download        = _L.Download;
export const Share2          = _L.Share2;
export const Star            = _L.Star;
export const Tag             = _L.Tag;
      `.trim(),
      loader: 'js',
    }));

    // ── zustand ────────────────────────────────────────────────────────
    build.onResolve({ filter: /^zustand(\/.*)?$/ }, () =>
      ({ path: 'zustand', namespace: 'shim' }));
    build.onLoad({ filter: /^zustand$/, namespace: 'shim' }, () => ({
      contents: `
const Z = window.Zustand || {};
export default Z;
export const create   = Z.create;
export const useStore = Z.useStore;
      `.trim(),
      loader: 'js',
    }));
  },
};
```

> **berrytrace-plugin-sdk 不需要 shim**：SDK 是宿主 `node_modules/berrytrace-plugin-sdk` 的 symlink（指向 `plugins-sdk/`），esbuild 可以直接 bundle，无需 external 也无需 shim。

---

## esbuild 寻找路径技巧

若插件自身 `node_modules` 没有安装 esbuild，可从父目录（宿主 berrytrace_app）引用：

```javascript
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// 向上查找 esbuild（优先用插件自身的，找不到则用宿主的）
const _require = createRequire(import.meta.url);
const esbuildEntry = _require.resolve('esbuild', {
  paths: [root, resolve(root, '../..'), resolve(root, '../../..')]
});
const { build } = await import(esbuildEntry);
```

---

## 完整示例：hybrid 插件 bundle.mjs

**适用场景**：插件有 view（浏览器 UI）+ main（Node.js 后台），UI 使用 React + lucide-react。

```javascript
// scripts/bundle.mjs  (hybrid plugin example)
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');
const outDir    = resolve(root, 'dist');

// 解析 esbuild（支持从宿主 node_modules 引用）
const _require = createRequire(import.meta.url);
const esbuildEntry = _require.resolve('esbuild', {
  paths: [root, resolve(root, '../..'), resolve(root, '../../..')]
});
const { build } = await import(esbuildEntry);

mkdirSync(outDir, { recursive: true });

// ── globalShimPlugin（见上方完整实现，粘贴到此处）──────────────────
// const globalShimPlugin = { ... };

// ── View 构建（浏览器渲染进程）─────────────────────────────────────
async function buildView() {
  await build({
    entryPoints: [resolve(root, 'src/view.ts')],
    bundle:      true,
    outfile:     resolve(outDir, 'view.js'),
    format:      'esm',
    platform:    'browser',
    target:      ['es2022', 'chrome110'],
    jsxFactory:  'React.createElement',
    jsxFragment: 'React.Fragment',
    minify:      false,
    logLevel:    'info',
    plugins:     [globalShimPlugin],
    // berrytrace-plugin-sdk 直接 bundle（symlink，无 native 代码）
    // react / lucide-react 等由 globalShimPlugin 替换为 window.*
    external:    [],
  });
  console.log('[plugin] ✅ dist/view.js');
}

// ── Main 构建（Node.js 后台进程）──────────────────────────────────
async function buildMain() {
  await build({
    entryPoints: [resolve(root, 'src/index.ts')],
    bundle:      true,
    outfile:     resolve(outDir, 'index.js'),
    format:      'esm',
    platform:    'node',
    target:      ['node20'],
    minify:      false,
    logLevel:    'info',
    external:    ['electron', 'berrytrace-plugin-sdk'],
    banner: {
      js: `import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);`,
    },
  });
  console.log('[plugin] ✅ dist/index.js');
}

// ── panel 插件只需 buildView；background 插件只需 buildMain ────────
async function main() {
  try {
    await Promise.all([buildView(), buildMain()]);
    console.log('[plugin] ✅ All builds complete');
  } catch (err) {
    console.error('[plugin] ❌ Build failed:', err);
    process.exit(1);
  }
}

main();
```

---

## 标准 bundle.mjs（panel 插件，第 1 类：纯 JS 包）

**95% 的 panel/view-only 插件用这个**：

```javascript
import * as esbuild from 'esbuild';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'dist');
mkdirSync(outDir, { recursive: true });

// 粘贴 globalShimPlugin 到这里...

await esbuild.build({
  entryPoints: [resolve(root, 'src/index.ts')],
  bundle:      true,
  outfile:     resolve(outDir, 'index.js'),
  format:      'esm',
  platform:    'browser',
  target:      ['es2022'],
  jsxFactory:  'React.createElement',
  jsxFragment: 'React.Fragment',
  minify:      false,
  plugins:     [globalShimPlugin],
  external:    [],  // react/zustand/lucide 由 shim 处理，无需 external
});
```

---

## 特殊 bundle.mjs（第 3 类：有动态 require 的大型包）

适用于 `playwright-core`、`puppeteer` 等内部有大量懒加载的包。

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

---

## 特殊处理（第 4 类：原生 .node 二进制）

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

| 插件类型 | 构建 view.js / index.js (browser) | 构建 index.js (node) |
|:---:|:---:|:---:|
| `panel` | ✅ `platform: 'browser'` + globalShimPlugin | ✗ |
| `background` | ✗ | ✅ `platform: 'node'` |
| `hybrid` | ✅ | ✅ |
| `main` | ✗ | ✅（不分离） |

---

## 常见错误

| 错误信息 | 原因 | 修复 |
|------|------|------|
| `Failed to resolve module specifier 'react'` | view 层直接用了 bare import，没有 shim | 加 `globalShimPlugin`，或用 `window.React` |
| `Failed to resolve module specifier 'lucide-react'` | 同上 | `globalShimPlugin` 里加 lucide-react shim |
| `Cannot find package 'xxx'` | 该包有动态 require，esbuild 没有 bundle 进去 | 参考第 3 类方案：external + files 字段 |
| `.node file not found` | native 模块没 copyFile | `copyFileSync` 到 `dist/bin/` |
| `electron is not defined` | background 里误用了 electron API | 改用 SDK 对应方法 |
| `ReferenceError: require is not defined` | ESM 格式用了 CJS require | 加 banner shim（见上方模板）|
| `No matching export in "shim:xxx" for import "Yyy"` | globalShimPlugin 对应包的 shim 缺少该 export | 在 shim 的 contents 里补全对应 export |
| `Cannot find module 'esbuild'` | 插件自身没装 esbuild，路径查找失败 | 用 createRequire + paths 向上查找宿主的 esbuild |
