# 18 — 代码规范

## 1. UI & Styling (Tailwind First)
- **Tailwind Exclusive**: Always prefer Tailwind utility classes in JSX/TSX `className`. Avoid creating new `.css` files.
- **No New CSS Files**: Do NOT create new `.css` files. Use Tailwind classes or inline `style={{}}` for all styles.
- **Inline Styles for Custom CSS**: If a style cannot be expressed with Tailwind (e.g. complex gradients, animations), use inline `style={{}}` in JSX instead of a CSS file.
- **Migrate Existing CSS**: Gradually migrate existing `.css` to Tailwind. Once a component's CSS is fully converted, delete the CSS file/section.
- **CSS Slimming (Boy Scout Rule)**: Whenever you modify a file/component, take the chance to convert its remaining CSS to Tailwind. Delete the CSS file once empty.
- **Visual Aesthetic**: Keep design clean, responsive, and matching the premium "BerryTrace" aesthetic (e.g. rounded corners, soft colors, glassmorphism).

## 2. DOM & Memory Optimization (Performance First)
- **Conditional Mounting**: Avoid `display: none` or visibility styles for hiding large/complex UI. Use conditional rendering (`{isVisible && <Component />}`) to destroy unused DOM nodes and free memory. Critical for Electron performance.
- **Avoid DOM Bloat**: Minimize deep nesting of wrapper `div`s.

## 3. Modularity & Loading Strategy
- **Modularity**: Break large screens into small, focused, reusable components.
- **Lazy Loading**: Use `React.lazy()` + `Suspense` or dynamic imports for heavy components/routes not immediately visible on startup.
- **State Management**: Use Zustand for lightweight, reactive global states. Avoid excessive React Context prop-drilling.

## 4. TypeScript & Code Quality Guidelines
- **Strict 800-Line Limit**: Keep each file under **800 lines**. If a file exceeds this, immediately split it into smaller sub-components/utils (like the Mastra agent kernel).
- **Prohibit `any` Type**: Do NOT use `any`. It disables type safety and triggers ESLint errors. Use interfaces, type aliases, or `unknown` with type guards.
- **Traceable Logging**: Key logic entry points, state changes, DB actions, and IPC messages must output descriptive logs (prefixed with `[Module:Function] ...`). Prevents "black box" execution and aids debugging in Electron main/renderer.

## 5. Plugin SDK & API Dispatcher Architecture
- **Universal SDK Runtime**: Do NOT write custom IPC bridging code inside utilityProcess tasks. Always use `createPluginSDK(pluginId)` from `berrytrace-plugin-sdk`, which auto-handles communication across Electron main, renderer, iframe, and utilityProcess.
- **Callback Serialization**: Callbacks passed to SDK (e.g. `onChunk` in `chatStream`) are auto-serialized to `{ __callbackId: string }` on client and mapped to host callbacks. Maintain this strategy; avoid raw function sharing over IPC.
- **Controller Pattern**: New SDK API namespaces must NOT be implemented inside the dispatcher. Implement as separate classes in `electron/plugins/controllers/` conforming to `PluginApiController`, and register in `electron/plugins/api-dispatcher.ts`.

## 6. AI-Assisted Development Metadata Mapping
To help AI agents locate API implementations instantly and troubleshoot errors without scanning files:
- **`api-map.json`**: Index mapping every SDK namespace/method to its implementing host controller file. AI agents MUST check this file first.
- **`error-map.json`**: Error definitions with regex patterns, explanations, causes, and troubleshooting. Reference this first on workflow errors.

## 7. Temporary Scripts & Workspace Cleanliness
- **Constrain Temporary Scripts**: All temp scripts (batch moves, restructuring, DB updates, etc.) MUST be written to `.berrytrace/tmp/` in the workspace root. Do NOT clutter root or doc directories.
- **Mandatory Cleanup**: After the script runs and verification completes, the agent MUST immediately delete the temp script.

## 8. 计划任务和写代码之前问自己几个问题

1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use it
3. Native platform feature?   → use it
4. Installed dependency?      → use it
5. One line?                  → one line
6. Only then: the minimum that works

## 9. React View 容器隔离与 `createRoot` SSOT 防线
- **严禁对宿主 `this.container` 直接 `createRoot`**：在 `View` 视图扩展子类中，严禁在 `onOpen` 中直接使用 `createRoot(this.container)`。
- **强制使用内部子 DOM (`subContainer`)**：必须通过 `this.subContainer = document.createElement('div')` 追加到 `this.container` 中作为隔离层再进行 `createRoot`，并在 `onClose` 中显式清空并拔除子元素。避免宿主多次 `onOpen` 或 `onClose` 异步微任务卸载时引发 React 18 重复挂载异常。