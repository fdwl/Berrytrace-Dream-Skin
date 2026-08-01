# 05 — SDK 导入方案

SDK 通过 `createPluginSDK` 创建实例：

```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';
const sdk = createPluginSDK('com.berrytrace.plugin.xxx');
```

---

## 渲染进程（Panel / Hybrid 视图）— 全局 shim

**推荐方案**：BerryTrace 现在通过 esbuild 插件自动将 `berrytrace-plugin-sdk`、`react`、`react-dom`、`zustand` 替换为全局变量引用。

```typescript
// src/renderer.tsx — 直接 import，构建时自动处理
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

function App() {
  return <div>Hello</div>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

构建时使用 `berrytrace build` 命令（内置全局 shim 插件），或在自定义 bundle.mjs 中包含 `globalSdkPlugin` 和 `globalReactPlugin`（参考 [08-build.md](./08-build.md)）。

**不再需要**：
- ~~`external: ['berrytrace-plugin-sdk']`~~（view 构建）
- ~~sdkShimPlugin~~
- ~~Import Maps~~

---

## 后台进程（Background / Hybrid main）— external

后台进程在 Node.js 环境，SDK 通过 npm 依赖解析：

```typescript
// src/background.ts
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');
```

esbuild 配置需要 external SDK：
```javascript
external: ['berrytrace-plugin-sdk', 'electron']
```

---

## 方案对比

| 方案 | 适用场景 | 说明 |
|------|:---:|:---|
| **全局 shim（推荐）** | Panel / Hybrid 视图 | `berrytrace build` 内置，SDK/React/zustand 从 window 全局变量读取 |
| **external** | Background / Hybrid main | Node.js 环境，通过 npm 依赖解析 |
