# LLM服务商配置模块说明

## 功能概述

本模块提供了多LLM服务商的统一配置和管理功能，支持OpenAI、Anthropic Claude、Google Gemini以及兼容OpenAI接口的自定义服务商。

## 数据库模型

表名：`llm_provider`

字段说明：
- `id`: 主键ID
- `name`: 服务商名称（唯一）
- `type`: 服务商类型，可选值：gemini/openai/claude/custom
- `api_key`: API密钥
- `base_url`: API基础地址（可选）
- `model_name`: 模型名称
- `is_default`: 是否为默认服务商
- `created_at`: 创建时间
- `updated_at`: 更新时间

## API接口

### 1. 获取所有服务商
```
GET /api/v1/providers?skip=0&limit=100
```

### 2. 获取指定服务商
```
GET /api/v1/providers/{id}
```

### 3. 创建服务商
```
POST /api/v1/providers
Content-Type: application/json

{
  "name": "OpenAI",
  "type": "openai",
  "api_key": "sk-xxx",
  "base_url": "https://api.openai.com/v1",
  "model_name": "gpt-3.5-turbo",
  "is_default": true
}
```

### 4. 更新服务商
```
PUT /api/v1/providers/{id}
Content-Type: application/json

{
  "model_name": "gpt-4",
  "is_default": false
}
```

### 5. 删除服务商
```
DELETE /api/v1/providers/{id}
```

### 6. 测试服务商配置
```
POST /api/v1/providers/{id}/test
Content-Type: application/json

{
  "prompt": "Hello, this is a test.",
  "max_tokens": 100
}
```

## 使用示例

### 初始化数据库表
```bash
cd backend
python scripts/create_tables.py
```

### 在代码中使用LLM服务
```python
from app.core.llm import LLMService, get_default_llm_service
from app.crud import llm_provider

# 获取指定服务商
provider = await llm_provider.get(db, provider_id=1)
llm_service = LLMService(provider)

# 调用LLM
response = await llm_service.agenerate("你好，请介绍一下自己")
print(response)

# 获取默认服务商
default_llm = await get_default_llm_service(db)
if default_llm:
    response = await default_llm.agenerate("Hello, world!")
```

## 支持的服务商类型

1. **OpenAI**: 支持所有OpenAI兼容的模型
2. **Claude**: 支持Anthropic Claude系列模型
3. **Gemini**: 支持Google Gemini系列模型
4. **Custom**: 支持任何兼容OpenAI接口的自定义服务商

## 环境依赖

需要安装以下额外依赖：
```bash
poetry add anthropic google-generativeai
```

## 注意事项

1. API密钥会明文存储在数据库中，生产环境建议加密存储
2. 测试接口会实际调用LLM服务，会产生费用
3. 只能有一个默认服务商，设置新的默认服务商时会自动取消原有默认
4. 自定义服务商必须兼容OpenAI的API接口格式
