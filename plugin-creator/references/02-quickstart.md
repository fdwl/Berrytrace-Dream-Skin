# 02 — 快速上手：从零到 Hello World

## Step 1：创建插件

```bash
node plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js create hello-world
```

CLI 自动在 `plugins-dev/hello-world/` 下生成完整项目：

```
hello-world/
├── package.json          # 项目配置（含 build 脚本）
├── plugin.json           # 插件元数据
├── src/
│   └── index.tsx         # React 面板入口
├── scripts/
│   └── bundle.mjs        # esbuild 构建配置
└── tests/
    └── index.test.js     # 测试模板
```

---

## Step 2：安装依赖并构建

```bash
cd plugins-dev/hello-world
npm install
npm run build
```

---

## Step 3：加载到宿主

```
plugin_manager_load_unpacked
参数: { "path": "plugins-dev/hello-world" }
```

---

## Step 4：验证

```
plugin_manager_get_logs
参数: { "pluginId": "com.berrytrace.plugin.hello-world-xxxxx", "limit": 30 }
```

确认日志无报错。

---

## Step 5：热重载

修改代码后：

```bash
npm run build
```

```
plugin_manager_reload
参数: { "pluginId": "com.berrytrace.plugin.hello-world-xxxxx" }
```

---

## 生成的代码说明

**src/index.tsx**（面板入口）：

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.hello-world-xxxxx');

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Hello World</h1>
      <p>Plugin loaded successfully.</p>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

SDK、React、react-dom 通过全局 shim 注入，无需手动 external。
