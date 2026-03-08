# LLM服务商模块快速启动指南

## 1. 安装依赖

```bash
cd backend
poetry install
```

## 2. 配置环境变量

复制`.env.example`为`.env`并配置数据库连接：

```env
DATABASE_URL=postgresql://kmap:kmap123@localhost:5432/kmap
```

## 3. 启动数据库服务

使用docker-compose启动PostgreSQL等服务：

```bash
docker-compose up -d postgres
```

## 4. 创建数据库表

```bash
python scripts/create_tables.py
```

## 5. 启动后端服务

```bash
python -m app.main
```

或者使用uvicorn：

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 6. 访问API文档

打开浏览器访问：http://localhost:8000/docs

你可以在Swagger UI中测试所有LLM服务商相关的API接口。

## 7. 运行测试脚本

在另一个终端运行测试脚本：

```bash
python test_providers_api.py
```

## 8. 示例使用

### 创建OpenAI服务商
```bash
curl -X POST http://localhost:8000/api/v1/providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenAI",
    "type": "openai",
    "api_key": "你的OpenAI密钥",
    "base_url": "https://api.openai.com/v1",
    "model_name": "gpt-3.5-turbo",
    "is_default": true
  }'
```

### 测试服务商连接
```bash
curl -X POST http://localhost:8000/api/v1/providers/1/test \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?",
    "max_tokens": 100
  }'
```

## 常见问题

### 1. 如何添加自定义服务商？
选择type为"custom"，并填写兼容OpenAI接口的base_url和api_key。

### 2. 如何修改默认服务商？
更新任意服务商的is_default为true，系统会自动取消其他默认服务商。

### 3. 支持哪些认证方式？
目前仅支持API密钥认证方式。

### 4. 如何处理API调用错误？
所有LLM调用都会抛出异常，建议在业务代码中进行异常捕获和处理。
