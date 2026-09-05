import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalShimPlugin = {
  name: 'global-shim',
  setup(build) {
    // react
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'shim' }));
    build.onLoad({ filter: /^react$/, namespace: 'shim' }, () => ({
      contents: `
const R = window.React || {};
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
// 下面这几个是 0905 补的。少一个的后果不是「用不了」，而是**构建直接失败**：
//   ERROR: No matching export in "shim:react" for import "useLayoutEffect"
// 而 tsc --noEmit **完全看不见**这类问题 —— 它查的是真实 react 的类型声明，
// 不是这份 shim。所以「tsc 0 error」不代表构建得过，两个都要跑。
// 注意：这段注释在一个模板字符串里面，**不许出现反引号**（会提前结束模板）。
export const useLayoutEffect = R.useLayoutEffect;
export const useReducer      = R.useReducer;
export const useId           = R.useId;
export const useSyncExternalStore = R.useSyncExternalStore;
export const useImperativeHandle  = R.useImperativeHandle;
export const useDeferredValue     = R.useDeferredValue;
export const useTransition        = R.useTransition;
export const StrictMode      = R.StrictMode;
export const Suspense        = R.Suspense;
      `.trim(),
      loader: 'js',
    }));

    // react/jsx-runtime
    build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: 'react/jsx-runtime', namespace: 'shim' }));
    build.onLoad({ filter: /^react\/jsx-runtime$/, namespace: 'shim' }, () => ({
      contents: `
const R = window.React || {};
export const Fragment = R.Fragment;
export function jsx(type, props, key) {
  if (!props) props = {};
  const { children, ...restProps } = props;
  if (key !== undefined) restProps.key = key;
  if (children === undefined) {
    return R.createElement(type, restProps);
  }
  return Array.isArray(children)
    ? R.createElement(type, restProps, ...children)
    : R.createElement(type, restProps, children);
}
export function jsxs(type, props, key) {
  return jsx(type, props, key);
}
export function jsxDEV(type, props, key) {
  return jsx(type, props, key);
}
      `.trim(),
      loader: 'js',
    }));

    // react-dom
    build.onResolve({ filter: /^react-dom(\/.*)?$/ }, () => ({ path: 'react-dom', namespace: 'shim' }));
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


    // zustand
    build.onResolve({ filter: /^zustand(\/.*)?$/ }, () => ({ path: 'zustand', namespace: 'shim' }));
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

async function build() {
  console.log('📦 构建 BerryTrace DreamSkin 插件...');

  // 1. 构建 Background Main 脚本 (Node.js 环境)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/main/index.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist/main.js'),
    platform: 'node',
    target: 'node20',
    format: 'esm',
    sourcemap: false,
    external: ['electron', 'fs', 'path'],
  });

  // 2. 构建 View 视图脚本 (Renderer 浏览器环境，使用 globalShimPlugin)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/view/index.tsx')],
    bundle: true,
    outfile: path.join(__dirname, 'dist/view.js'),
    platform: 'browser',
    target: 'chrome120',
    format: 'esm',
    sourcemap: false,
    plugins: [globalShimPlugin],
    external: [],
  });

  console.log('✅ BerryTrace DreamSkin 插件构建完成！产物存放在 plugin/dist/');
}

build().catch((err) => {
  console.error('🚨 构建失败:', err);
  process.exit(1);
});
