# 15 — 测试

## 测试要求

| 维度 | 标准 |
|------|------|
| 覆盖率 | **≥ 90%** |
| 关键路径 | 必须先跑测试，通过后才能 reload |
| 测试框架 | vitest（推荐）或 jest |
| 测试类型 | 单元测试 + MCP 工具集成测试 |

## 测试流程

```
写代码 → 写测试 → npm test → 通过 → npm run build → reload → 验证
                                    ↑
                                    └── 不过 → 修复 → 重新测试
```

**任何代码修改后，必须先跑测试，通过后再 build/reload。**

## vitest 配置

在插件目录创建 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
```

`package.json` 添加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0"
  }
}
```

## 关键路径测试模板

### 1. 核心业务逻辑（`src/logic.test.ts`）

```typescript
import { describe, it, expect } from 'vitest';
// 纯函数、纯逻辑 — 不依赖 SDK

describe('core logic', () => {
  it('should format timestamp correctly', () => {
    expect(formatTimestamp('2026-01-01')).toBe('2026年1月1日');
  });

  it('should handle empty input', () => {
    expect(processData(null)).toEqual([]);
  });

  it('should handle edge cases', () => {
    expect(validateInput('')).toBe(false);
    expect(validateInput(undefined)).toBe(false);
  });
});
```

### 2. MCP 工具 handler（`src/background.test.ts`）

```typescript
import { describe, it, expect } from 'vitest';

// 直接测试 handler 函数（导出为纯函数，不依赖 SDK）
describe('MCP tool: my_tool', () => {
  it('should return correct result', async () => {
    const result = await myToolHandler({ input: 'test' });
    expect(result).toEqual({
      content: [{ type: 'text', text: '处理: test' }],
    });
  });

  it('should reject invalid input', async () => {
    const result = await myToolHandler({});
    expect(result.isError).toBe(true);
  });
});
```

### 3. 数据转换（`src/utils.test.ts`）

```typescript
import { describe, it, expect } from 'vitest';

describe('data transformation', () => {
  it('should convert raw data to display format', () => {
    const raw = [{ id: 1, name: 'test' }];
    expect(toDisplayFormat(raw)).toEqual([{ label: 'test', value: 1 }]);
  });
});
```

## 集成测试（MCP 工具）

```typescript
import { describe, it, expect } from 'vitest';

describe('MCP tool integration', () => {
  it('tool schema matches implementation', () => {
    // 验证 plugin.json 声明的 schema 与 handler 参数一致
    const schema = toolSchema.properties;
    expect(Object.keys(schema)).toContain('input');
  });

  it('all declared tools have handlers', () => {
    const declaredTools = ['my_tool', 'another_tool'];
    const registeredHandlers = getRegisteredToolNames();
    for (const tool of declaredTools) {
      expect(registeredHandlers).toContain(tool);
    }
  });
});
```

## 运行测试

```bash
# 单次运行
npm test

# 带覆盖率
npm run test:coverage

# 覆盖率必须 ≥ 90%
# 如果未达标，补充测试后再继续
```

## 测试检查清单

| # | 检查项 |
|---|--------|
| 1 | `npm test` 全部通过 |
| 2 | 覆盖率 ≥ 90%（lines / functions / statements） |
| 3 | 所有 MCP 工具 handler 有测试 |
| 4 | 边界情况（null / undefined / 空数组）有测试 |
| 5 | 测试不依赖 SDK（纯函数测试） |
