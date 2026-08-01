# 04 — 插件类型与入口规范

## 四种类型

| type | 运行环境 | 入口 | 典型场景 |
|------|---------|------|---------|
| `panel` | 渲染进程（浏览器） | `view` 文件 | 纯 UI 插件：编辑器、时钟、天气 |
| `background` | utilityProcess（Node.js） | `main` 文件 | 纯后台：数据同步、定时任务、MCP |
| `hybrid` | utilityProcess + 渲染进程 | `main` + `view` | UI + 后台：HTTP Server + 前端面板 |
| `main` | 主进程 | `main` 文件 | 系统级：全局快捷键、托盘 |

## 默认选择规则

当用户需求不明确时：

| 用户描述 | 选择 |
|---------|------|
| 涉及"看""显示""界面""窗口" | `panel` |
| 涉及"后台""服务""监听""同步" | `background` |
| 涉及"后台 + 界面""服务 + 面板" | `hybrid` |
| 涉及"快捷键""全局""系统" | `main` |
| 不确定 | **默认 `panel`** |

---

## `panel` — 纯 UI 插件

```json
{
  "type": "panel",
  "view": "dist/renderer.js"
}
```

```typescript
// src/renderer.tsx — 唯一入口
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

function App() {
  // ... UI 逻辑
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

- **不需要** `main` 字段
- **不需要** `activate()` / `deactivate()`
- UI 贡献通过 `plugin.json` 的 `contributes` 声明
- SDK 通过 Import Maps 或 esbuild shim 注入

---

## `background` — 纯后台插件

```json
{
  "type": "background",
  "main": "dist/background.js"
}
```

```typescript
// src/background.ts
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  sdk.log.info('后台服务启动');

  // 注册 MCP 工具
  sdk.mcp.registerToolHandler('my_tool', async (args) => {
    return { content: [{ type: 'text', text: `处理: ${args.input}` }] };
  });

  // 注册事件监听
  sdk.events.on('clipboard-change', (data) => {
    sdk.log.info('剪贴板变化:', data);
  });
}

export async function deactivate() {
  sdk.log.info('后台服务停止');
}

// utilityProcess 必须自激活
activate().catch(err => {
  console.error('[Plugin] 激活失败:', err);
});
```

- 必须有自激活调用 `activate().catch(...)`
- 不需要 `view` 字段
- 不需要 `contributes`（无 UI）

---

## `hybrid` — UI + 后台插件

```json
{
  "type": "hybrid",
  "main": "dist/background.js",
  "view": "dist/renderer.js"
}
```

### 后台入口 (`src/background.ts`)

```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  // 启动后台服务
  // 注册 MCP 工具、事件监听等
  sdk.mcp.registerToolHandler('my_tool', async (args) => {
    return { content: [{ type: 'text', text: 'OK' }] };
  });
}

export async function deactivate() {
  // 清理资源
}

activate().catch(err => console.error(err));
```

### UI 入口 (`src/renderer.tsx`)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

function App() {
  // ... UI 逻辑，可以用 sdk 进行数据操作
  return <div>Hybrid Plugin UI</div>;
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

**关键规则**：
- `main` 和 `view` 是两个**完全独立**的文件
- `main` 不可引用浏览器 API（DOM、React）
- `view` 不可引用 Node.js API（fs、path）
- UI 贡献（Ribbon、View 等）在 `plugin.json` 的 `contributes` 声明

---

## `main` — 主进程插件

```json
{
  "type": "main",
  "main": "dist/index.js"
}
```

```typescript
// src/index.ts
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.xxx');

export async function activate() {
  sdk.log.info('主进程插件启动');
  // 注册全局快捷键、系统托盘等
}
```

- 运行在主进程上下文，有完整 Electron 权限
- 谨慎使用，权限最大

---

## 入口文件对比

| type | 入口文件 | 导出什么 | 如何激活 |
|------|---------|---------|---------|
| `panel` | `view` 文件 | React 组件（默认） | `plugin.json` 的 `contributes` |
| `background` | `main` 文件 | `activate()` / `deactivate()` | `activate().catch(...)` 自激活 |
| `hybrid` | `main` + `view` 两个文件 | 后台: `activate()` / `deactivate()`<br>UI: React 组件 | 后台自激活，UI 由 contributes 触发 |
| `main` | `main` 文件 | `activate()` | 主进程自动调用 |
