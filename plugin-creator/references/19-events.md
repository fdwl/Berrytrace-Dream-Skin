# 19 — 事件系统

## 架构

事件根据优先级与类型采用不同的分流通道：

1. **P2P 点对点直连通道（MessagePort 旁路直通）**：
   * 适用场景：插件间高频流式通信（如 `voice-agents` 音频/频谱数据到 `voice-ui-jarvis` 浮球，30~60Hz 传输）。
   * 建立方法：由消费者/请求方主动调用 `const port = await sdk.connectPlugin(targetPluginId, channelName)`；提供者/服务端通过 `sdk.onPluginConnected((port, peerPluginId) => { ... })` 接收。
   * 优势：100% 绕过主进程与全局 Event Bus，主进程开销为 0，零 JSON 序列化抖动。

2. **普通系统通道（主进程中转）**：
   * 适用场景：离散控制事件和低频通知。
   * 通信路径：
     ```
     渲染进程                      主进程                       后台进程 (utilityProcess)
     sdk.events.emit('xxx', data)
         → IPC                     → PluginLauncher
                                     → postMessage({ type: 'sdk:events:on', eventName, payload })
                                                                 → sdk.events.on('xxx') 触发
     ```

## 事件驱动与 `autoWake` 被动唤醒防线

**核心机制**：插件在 `plugin.json` 的 `contributes.events.listens` 中声明关心的事件。支持通过 `"autoWake": false` 防范盲目唤醒。

```json
{
  "contributes": {
    "events": {
      "listens": [
        { 
          "name": "voice:state-broadcast", 
          "description": "监听语音状态广播",
          "autoWake": false
        },
        { 
          "name": "voice:activate-ui", 
          "description": "监听 UI 激活指令",
          "autoWake": true 
        }
      ]
    }
  }
}
```

* **`autoWake: false` (默认)**：当插件处于休眠/未加载状态时，事件触发**不会盲目启动插件子进程**。仅在插件处于活跃运行状态时才会推送接收消息。
* **`autoWake: true`**：事件触发时，若插件未运行，主进程会强制唤醒该插件并重放触发事件。
```

**关键规则**：
- `listens` 声明的事件：插件未运行时收到该事件 → **自动唤醒** 并重放
- `emits` 声明的事件：仅声明意图，不影响运行时行为
- **未声明的事件不会推送给该插件**（减少 ~70% IPC 冗余）
- 平台事件和自定义事件都可以声明

## 订阅/发布

```typescript
// 订阅（任何进程）
const unsubscribe = sdk.events.on(eventName: string, handler: (data: unknown) => void);

// 仅一次
sdk.events.once(eventName: string, handler: (data: unknown) => void);

// 发布（任何进程）
sdk.events.emit(eventName: string, data: unknown);

// 取消
unsubscribe();
```

## 系统事件

以下事件由宿主在主进程自动触发，插件可在任何进程订阅：

| 事件名 | 触发时机 | payload | 后台广播 | 渲染广播 |
|--------|---------|---------|:---:|:---:|
| `commands:execute` | 命令被执行 | `{ commandId: string, args?: Record<string, unknown> }` | ✅ | ✅ |
| `auth:changed` | 用户登录/登出状态变更 | `{ source: string }` | — | ✅ |
| `agent:process-started` | execCommand 子进程启动 | `{ sessionId: string }` | ✅ | ✅ |
| `agent:process-exited` | execCommand 子进程退出 | `{ sessionId: string }` | ✅ | ✅ |
| `agent:process-resolved-early` | execCommand 提前终止 | `{ sessionId: string }` | ✅ | ✅ |
| `agent:kernel_ready` | Agent 内核就绪 | `{ kernelPluginId: string }` | — | ✅ |
| `agent:step_update` | Agent 步骤状态更新 | `AgentStepUpdatePayload` | ✅ | ✅ |
| `workspace:file-changed` | 工作区文件变更 | `{ path: string }` | — | ✅ |
| `workspace:context-changed` | 工作区上下文变更 | `WorkspaceContextChangedPayload` | ✅ | ✅ |
| `system:user-idle` | 用户空闲超过阈值 | `null` | ✅ | ✅ |
| `system:user-active` | 用户重新活跃 | `null` | ✅ | ✅ |
| `plugins:changed` | 插件列表变更 | `null` | — | ✅ |
| `plugins:lifecycle` | 插件生命周期状态变更 | `PluginsLifecyclePayload` | — | ✅ |
| `plugins:on-demand-loaded` | 插件按需加载完成 | `PluginsOnDemandLoadedPayload` | — | ✅ |

## 插件自定义事件

命名规范：`{pluginId}:{eventName}`

```typescript
// 插件 A 发布
sdk.events.emit('my-plugin:dataUpdated', { id: 123 });

// 插件 B 订阅
sdk.events.on('my-plugin:dataUpdated', (data) => {
  console.log(data.id); // 123
});
```

自定义事件也需要在 `plugin.json` 的 `contributes.events` 中声明：

```json
{
  "contributes": {
    "events": {
      "listens": [
        { "name": "other-plugin:dataUpdated", "description": "监听其他插件的数据更新" }
      ],
      "emits": [
        { "name": "my-plugin:dataUpdated", "description": "通知其他插件数据已更新" }
      ]
    }
  }
}
```

## 典型用法

### hybrid 插件：main ↔ view 通信

```typescript
// background.ts（后台进程）
sdk.events.on('my-plugin:search', async (data) => {
  const result = await doSearch(data.query);
  sdk.events.emit('my-plugin:searchResult', { result });
});

// renderer.tsx（渲染进程）
useEffect(() => {
  const unsub = sdk.events.on('my-plugin:searchResult', (data) => {
    setResults(data.result);
  });
  return () => unsub();
}, []);

function handleSearch(query: string) {
  sdk.events.emit('my-plugin:search', { query });
}
```

### 事件驱动的后台插件

```json
// plugin.json — 声明事件订阅
{
  "type": "background",
  "contributes": {
    "events": {
      "listens": [
        { "name": "workspace:file-changed", "description": "文件变更时触发索引更新" }
      ]
    }
  }
}
```

```typescript
// background.ts — 插件未运行时也会被自动唤醒
sdk.events.on('workspace:file-changed', async (data) => {
  await updateIndex(data.path);
});
```

### 监听系统事件

```typescript
// 监听命令执行
sdk.events.on('commands:execute', (data) => {
  if (data.commandId === 'myPlugin.reload') {
    reloadData();
  }
});

// 监听登录状态
sdk.events.on('auth:changed', () => {
  refreshAuthDependentData();
});
```

## 注意事项

- 事件是 fire-and-forget，不保证接收方一定收到
- 需要响应的场景用 `callApi` 或 `hooks.call`
- 避免在 handler 中执行耗时操作，会阻塞事件分发
- 组件卸载时必须取消订阅（`useEffect` return）
- 声明 `listens` 的插件会被事件自动唤醒，注意控制声明范围避免不必要的加载
- `emits` 声明仅用于文档和工具链分析，不影响运行时行为
- 事件自动唤醒只对 background 插件有效；panel 插件在渲染进程，由 UI 触发加载
