# 异步互斥锁防护 (AsyncLock & KeyedAsyncLock)

> **导出的 SDK 模块**: `berrytrace-plugin-sdk`  
> **使用场景**: 拦截重复触发、多异步请求串行化、Session/资源隔离排他锁

---

## 为什么需要异步锁

在插件开发中，常见以下并发与重复触发问题：
1. **重复点击 / 重发 API**：用户快速点击 UI 按钮或触发快捷键，导致异步任务重复启动。
2. **异步队列乱序**：多个并发的异步 Promise 同时修改插件内部状态或发送 PCM 音频流。
3. **Session 资源竞争**：不同 Session 或文件 ID 的更新逻辑重叠交织。

`berrytrace-plugin-sdk` 导出了两个开箱即用的物理锁工具类：**`AsyncLock`** 与 **`KeyedAsyncLock`**。

---

## 1. AsyncLock（单操作排他锁）

适用于插件内部单一临界区（无需 Key 标识）的串行化。

```typescript
import { AsyncLock } from 'berrytrace-plugin-sdk';

export class VoiceHandler {
  // 实例化插件私有锁
  private audioLock = new AsyncLock();

  async onAudioChunkReceived(chunk: ArrayBuffer) {
    // 使用 runExclusive 保证所有 PCM 块按顺序串行处理
    return this.audioLock.runExclusive(async () => {
      await this.sendToASR(chunk);
    });
  }
}
```

---

## 2. KeyedAsyncLock（按 Key 分组排他锁）

适用于根据动态 ID（如 `sessionId`、`fileId`、`commandId`）进行多组并发隔离调度。

```typescript
import { KeyedAsyncLock } from 'berrytrace-plugin-sdk';

export class DocumentPlugin {
  // 实例化插件独立的按 Key 分组锁
  private fileLock = new KeyedAsyncLock();

  async saveFile(fileId: string, content: string) {
    // 针对同一个 fileId 进行排队；不同 fileId 之间并行不受影响
    return this.fileLock.runExclusive(`file:${fileId}`, async () => {
      await this.writeToStorage(fileId, content);
    });
  }

  async syncConfig(configId: string) {
    // runOrSkip：如果当前 configId 正在同步中，直接丢弃并发的第二次触发
    const result = await this.fileLock.runOrSkip(`config:${configId}`, async () => {
      await this.doSync(configId);
    });
    
    if (result === null) {
      console.log(`[Plugin] Sync for "${configId}" skipped due to concurrent lock.`);
    }
  }
}
```

---

## 最佳实践与注意规范

1. **实例隔离**：在插件中使用 `new AsyncLock()` 或 `new KeyedAsyncLock()` 建立**插件私有锁**，锁随着插件实例销毁自动 GC 释放。
2. **超时控制**：在长耗时临界区中，确保函数内存在 `try...finally` 结构，避免未捕获异常抛错导致锁队列阻塞。
