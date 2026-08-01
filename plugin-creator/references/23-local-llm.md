# 本地小型 LLM (Qwen2.5-1.5B) 的调试与调用接口

为了帮助插件开发者在不依赖云端 API 的情况下进行插件开发调试，或通过低成本本地推理降低运行时的 Token 费用，BerryTrace 的 `cline-agent` 插件在后台实现并暴露了一个标准 OpenAI 兼容的 HTTP Completions 接口。

---

## 1. 接口基本信息

* **服务端口**：`19531`
* **API 端点**：`http://127.0.0.1:19531/v1`
* **支持的模型名称 (`model`)**：`qwen2.5-1.5b-instruct`
* **支持的方法**：`POST /v1/chat/completions`

---

## 2. 运行时生命周期（自动加载与释放）

为防止本地大模型常驻显存/内存导致电脑卡顿，接口内置了**智能生命周期管理器**：
1. **自动拉起**：当接收到外部 POST 请求时，如果模型未载入内存，服务器会自动拦截并动态加载模型文件（需在宿主设置中启用开关并完成约 1GB 文件的下载），加载完成后自动处理并返回结果。
2. **自动释放**：如果连续 **10 分钟**没有收到任何新的推理请求，服务器会自动释放 Transformer 推理 Pipeline，并将内存完全还给系统。

---

## 3. 调试与调用方法

### ① 命令行 `curl` 调试示例

开发者可以直接通过命令行对本地模型进行测试：

```bash
curl http://127.0.0.1:19531/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-1.5b-instruct",
    "messages": [
      {"role": "user", "content": "你好，请用三个词形容你自己。"}
    ],
    "temperature": 0.3
  }'
```

**正确响应格式**：
```json
{
  "id": "chatcmpl-xxxxxx",
  "object": "chat.completion",
  "created": 1718228800,
  "model": "qwen2.5-1.5b-instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "本地、高效、智能。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

### ② 在其他插件中调用示例 (TypeScript)

在其他插件的 `background.ts` 或前端 View 中，可以直接使用 `fetch` 或 `createOpenAI` 进行调用以节约云端 token：

```typescript
// 纯 fetch 调用示例
async function askLocalLLM(question: string): Promise<string> {
  try {
    const response = await fetch('http://127.0.0.1:19531/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5-1.5b-instruct',
        messages: [{ role: 'user', content: question }],
        temperature: 0.2
      })
    });
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('本地模型未启动或未启用:', err);
    throw err;
  }
}
```

---

## 4. 推荐使用场景（Token 降本）

1.5B 级别的小模型非常适合以下高频、短文本的辅助性生成任务，推荐插件开发者优先使用本地模型：
* **结构化意图分类**：通过 Few-Shot 将用户提问分类到不同的执行分支（如 `[TERM, FILE, BROWSER]`）。
* **超长日志/文本摘要**：在上传云端前对大量无用数据进行过滤提炼。
* **数据清理/JSON提取**：从一段杂乱的命令行输出中用 Prompt 结构化提取特定的关键字段或数值。
* **代码格式/拼写简单校验**：在提交前确认生成的代码是否包含明显的语法漏洞。
