# 17 — npm 依赖与代码复用

## 写代码前必问（杜绝重复造轮子）

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use Node.js 内置模块
3. Native platform feature?   → use Electron / OS 原生能力
4. Installed dependency?      → 检查 package.json 已有的依赖
5. NPM registry has it?       → npm_search 搜索 npm 包
6. One line?                  → 直接写一行，不要引库
7. Only then: write the minimum that works
```

## 搜索优先

写代码前先搜，BerryTrace 提供两种搜索：

```
# 搜 npm CLI 工具（npm registry 上的可执行包）
npm_search { query: "image resize" }
npm_search { query: "pdf parser" }

# 搜已安装的 Agent 能力（Skill + MCP 工具）
capability_search { query: "文件处理" }
capability_search { query: "视频转码" }
```

| 工具 | 搜索范围 | 用途 |
|------|---------|------|
| `npm_search` | npm registry（全量） | 找可安装的 CLI 工具 |
| `capability_search` | 已安装的 Skill + MCP 工具 | 查已有能力 |

**原则**：能直接用的绝不重写，npm 上有几百万个包。

## npm 安装

插件目录中直接安装依赖：

```bash
cd plugins-dev/my-plugin
npm install xlsx
npm install sharp
```

- 开发模式：生成 `node_modules/`，Node.js 正常解析
- 生产模式：打包时自动排除 `node_modules/`，依赖需通过 esbuild bundle 内联

## 沙箱环境

宿主内置了隔离的 Node.js/NPM 环境：

| 特性 | 说明 |
|------|------|
| 无需用户安装 Node | Electron 内置 Node.js 运行时 |
| 隔离缓存 | 所有 npm 包缓存到 `userData/npx-tools-sandbox/` |
| 高速镜像 | 自动使用 `registry.npmmirror.com` |
| 不污染系统 | 安装完全隔离于系统全局 npm |

## esbuild 打包第三方依赖

生产发布时必须 bundle 第三方依赖：

```bash
# package.json
{
  "scripts": {
    "build": "node scripts/bundle.mjs"
  },
  "dependencies": {
    "xlsx": "^0.18.5"
  }
}
```

`bundle.mjs` 中不需要 `external` 第三方包，esbuild 会自动内联：

```javascript
// background 构建 — 第三方包自动 bundle 进产物
await esbuild.build({
  entryPoints: ['src/background.ts'],
  bundle: true,
  outfile: 'dist/background.js',
  platform: 'node',
  format: 'esm',
  external: ['berrytrace-plugin-sdk'],  // ← 只有这一个！其他包全部 bundle
});
```

## 常用 Node.js 内置模块（无需安装）

```
fs / fs/promises    ← 文件操作（通过 sdk.filesystem 间接使用）
path                ← 路径处理
crypto              ← 哈希、加密
child_process       ← 子进程（通过 sdk.system.execCommand）
url                 ← URL 解析
stream              ← 流处理
util                ← 工具函数
```

## 禁止引入的依赖

| 类型 | 原因 |
|------|------|
| 原生 C++ 模块（node-gyp） | 需要编译环境，用户机器可能没有 |
| 巨大的 UI 框架 | 增加包体积，宿主已有 React |
| 与 Electron 版本不兼容的 Node API | 可能运行时崩溃 |

---

## 自动包装为 BerryTrace 插件的规范 (Dynamic Tool Packaging SOP)

如果你被主 Agent 通过子代理（Task: "将 npm 包 xxx 封装为 BerryTrace 本地插件..."）唤起，你必须严格遵循以下四步封装规范：

### 1. CLI 参数与 Schema 自动提取 (Schema Extraction)
在编写 `plugin.json` 之前，不要盲目凭空捏造 `inputSchema`。
1. 在终端临时执行该包以提取其命令行参数：
   ```bash
   npx <package_name> --help
   # 或者
   npx <package_name> -h
   ```
2. 分析输出信息，提取出：
   - 必备参数（如输入/输出文件路径、输入文本、动作类型等）。
   - 可选选项（如选项开关、输出格式等）。
3. 将提取出的参数严格声明在 `plugin.json` 的 `contributes.mcp.tools` 的 `inputSchema` 中。

### 2. 利用脚手架生成插件 (Scaffolding)
运行 `berrytrace-cli.js` 脚手架创建空模板项目，不要手动创建所有文件：
```bash
node plugins-dev/npx-tools/skills/plugin-creator/scripts/berrytrace-cli.js create <name> --id com.berrytrace.plugin.<name>-<uuid>
```

### 3. 编写命令封装代码 (TS Wrapper)
在 `src/index.ts` 中引入 `berrytrace-plugin-sdk`，利用 `sdk.system.execCommand` 封装底层命令行执行：
- 映射参数：将传入的 JSON 参数转换为命令行的选项数组。
- 输入校验：对于关键输入（如文件路径），在 TS 中先校验其存在性。
- 示例：
```typescript
import { createPluginSDK } from 'berrytrace-plugin-sdk';

const sdk = createPluginSDK('com.berrytrace.plugin.mytool');

sdk.mcp.registerToolHandler('run_mytool', async (args: { inputPath: string; format?: string }) => {
  const cliArgs = [args.inputPath];
  if (args.format) {
    cliArgs.push('--format', args.format);
  }
  const result = await sdk.system.execCommand('npx', ['-y', 'mytool', ...cliArgs]);
  return {
    content: [{ type: 'text', text: result.stdout || result.stderr || 'Success' }]
  };
});
```

### 4. 契约验证（Vitest 测试）
为了保证生成的插件 100% 运行可靠且返回格式契合 MCP 规范，你**必须**编写并运行 Vitest 测试用例：
1. 在 `src/index.test.ts` 中编写一个基本的运行契约测试，模拟传入 args 执行 Tool Handler。
2. 运行测试命令确保通过：
   ```bash
   npx vitest run src/index.test.ts
   ```
3. 测试通过且编译成功后，调用 `plugin_manager_load_unpacked` 加载至宿主，完成闭环。
