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
