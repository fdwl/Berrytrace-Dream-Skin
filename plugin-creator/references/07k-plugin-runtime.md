# 插件运行时服务 (Plugin Runtime Service)

> **IPC 前缀**: `plugin:`  
> **宿主服务**: `electron/services/plugin-runtime-service.ts`

插件运行时服务为插件提供在 **Electron 沙箱外部**运行代码的通用能力。
这些能力与 AI 推理无关，可用于启动任意本地后端（TTS、STT、Whisper、ffmpeg server 等）。

---

## 为什么需要这个服务

渲染进程（插件 UI）被 Electron 沙箱限制，无法：
- 直接调用 `child_process.spawn`
- 直接监听 localhost TCP/WS 端口

通过这些 IPC，宿主在 Node.js 主进程中代为执行，并将结果返回给插件。

---

## IPC 一览

| IPC Channel | 功能 | 对应旧名（已废弃） |
|---|---|---|
| `plugin:process-spawn` | 启动一个 Node.js 子进程 | ~~`local-ai:spawn`~~ |
| `plugin:process-status` | 查询子进程是否还在运行 | ~~`local-ai:spawn-status`~~ |
| `plugin:ws-request` | 向 localhost WS 服务发一次请求 | ~~`local-ai:ws-request`~~ |
| `plugin:http-post` | 向 localhost HTTP 服务 POST | ~~`local-ai:http-post`~~ |

---

## plugin:process-spawn

启动一个 Node.js 脚本。脚本路径相对于项目根目录。宿主自动管理进程生命周期（退出时统一 kill）。

```typescript
const result = await window.electronAPI.ipc.invoke('plugin:process-spawn', {
  key: 'my-tts-server',       // 唯一标识，用于后续状态查询
  script: 'plugins-dev/voice-agents/scripts/tts-server.js',  // 相对于项目根
  port: 8765,                  // 可选：附加为 --port 8765 参数
  args: ['--model', 'kokoro'], // 可选：额外命令行参数
})
// result: { ok: true, pid: 12345 }
//      or { ok: false, error: 'Script not found: ...' }
```

**注意**：若 key 对应的进程已在运行，会直接复用（不重复启动）。

---

## plugin:process-status

检查之前 spawn 的进程是否仍在运行。

```typescript
const status = await window.electronAPI.ipc.invoke('plugin:process-status', {
  keys: ['my-tts-server', 'my-stt-server'],
})
// status: { 'my-tts-server': true, 'my-stt-server': false }
```

---

## plugin:ws-request

向 localhost WebSocket 服务发一次请求，等待第一条响应后自动关闭连接。

```typescript
const result = await window.electronAPI.ipc.invoke('plugin:ws-request', {
  url: 'ws://127.0.0.1:8765',
  payload: { text: '你好', speed: 1.0, sid: 0 },
  timeoutMs: 15000,  // 可选，默认 30000ms
})
// result: 服务返回的 JSON 或字符串
```

**典型场景**：TTS 服务（文字→音频路径）。

---

## plugin:http-post

向 localhost HTTP 服务发 POST 请求并返回 JSON。

```typescript
const result = await window.electronAPI.ipc.invoke('plugin:http-post', {
  url: 'http://127.0.0.1:9000/transcribe',
  body: { audioPath: '/tmp/recording.wav' },
})
// result: 服务返回的 JSON
```

**典型场景**：STT 服务（音频→文字）、本地推理服务。

---

## 生命周期

所有通过 `plugin:process-spawn` 启动的进程：
- 由宿主 `PluginRuntimeService` 统一持有引用
- 在 `ShutdownOrchestrator` 的 `plugins` 组中统一 kill（确保退出时无孤儿进程）
- 进程自然退出时自动从 map 中删除（无需手动清理）

---

## 迁移说明（旧代码）

旧版使用 `local-ai:*` 前缀（已废弃，当前 preload 仍保留过渡期白名单）：

```typescript
// ❌ 旧写法（废弃）
await window.electronAPI.ipc.invoke('local-ai:spawn', { ... })
await window.electronAPI.ipc.invoke('local-ai:ws-request', { ... })
await window.electronAPI.ipc.invoke('local-ai:http-post', { ... })

// ✅ 新写法
await window.electronAPI.ipc.invoke('plugin:process-spawn', { ... })
await window.electronAPI.ipc.invoke('plugin:ws-request', { ... })
await window.electronAPI.ipc.invoke('plugin:http-post', { ... })
```

> 旧名将在下个大版本从 preload 白名单中移除。
