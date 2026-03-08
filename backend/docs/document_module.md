# 文档上传与处理模块说明

## 功能概述

本模块实现了文档的上传、解析、分片、向量化和存储功能，支持多种文档格式，提供完整的API接口和异步处理能力。

## 主要特性

- **多格式支持**: 支持txt、pdf、doc、docx、xls、xlsx、ppt、pptx、md、json、csv等格式
- **异步处理**: 基于RabbitMQ实现异步任务队列，不阻塞用户请求
- **智能解析**: 使用Unstructured.IO进行文档内容解析，保留结构信息
- **语义分片**: 按标题和语义进行智能分片，提高检索准确性
- **向量化存储**: 生成向量嵌入，同时存储到PostgreSQL和Qdrant向量数据库
- **状态跟踪**: 实时更新处理状态，支持错误信息记录和查询

## 技术栈

- **FastAPI**: API框架
- **PostgreSQL**: 关系型数据库，存储文档和分片元数据
- **RabbitMQ**: 消息队列，实现异步任务处理
- **Unstructured.IO**: 文档内容解析
- **LangChain**: LLM和Embedding封装
- **OpenAI Embedding**: 向量生成
- **Qdrant**: 向量数据库，用于相似度检索

## API接口

### 1. 文档上传
```
POST /api/v1/documents/upload
```
- 功能: 上传文档并加入处理队列
- 参数: `file` (上传的文件)
- 返回: 文档信息和处理状态

### 2. 获取文档列表
```
GET /api/v1/documents?skip=0&limit=100
```
- 功能: 获取所有文档列表
- 参数: `skip` (跳过数量), `limit` (返回数量上限)
- 返回: 文档列表和总数

### 3. 获取文档详情
```
GET /api/v1/documents/{id}?include_chunks=false
```
- 功能: 获取指定文档的详细信息
- 参数: `include_chunks` (是否包含分片内容)
- 返回: 文档详情

### 4. 删除文档
```
DELETE /api/v1/documents/{id}
```
- 功能: 删除指定文档及其关联的分片和向量数据
- 返回: 删除结果

### 5. 获取处理状态
```
GET /api/v1/documents/{id}/status
```
- 功能: 查询文档的处理状态
- 返回: 当前状态和错误信息（如果有）

## 处理流程

1. **文件上传**: 用户上传文件，系统验证文件类型和大小，保存到本地
2. **创建记录**: 在数据库中创建文档记录，状态为`pending`
3. **队列发送**: 将处理任务发送到RabbitMQ队列
4. **异步处理**: 消费者进程接收任务，开始处理：
   - 状态更新为`splitting`，使用Unstructured.IO解析文档内容
   - 按语义分片，生成多个文本块
   - 状态更新为`embedding`，调用Embedding模型生成向量
   - 分片和向量存储到PostgreSQL和Qdrant
   - 状态更新为`indexed`，处理完成
5. **错误处理**: 任何步骤出错时，状态更新为`error`并记录错误信息

## 状态说明

- `pending`: 待处理，已上传等待加入队列
- `splitting`: 分片中，正在解析和拆分文档
- `embedding`: 向量化中，正在生成向量嵌入
- `indexed`: 已完成，处理成功
- `error`: 处理失败，查看`error_message`获取详细信息

## 使用说明

### 1. 环境依赖
确保以下服务已启动并正确配置：
- PostgreSQL
- RabbitMQ
- Qdrant
- （可选）OpenAI API密钥或其他LLM服务商配置

### 2. 启动服务

#### 启动API服务
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 启动文档处理消费者
```bash
python start_consumer.py
```

### 3. 数据库迁移
首次运行需要创建数据库表：
```bash
python scripts/create_tables.py
```

### 4. 配置说明
相关配置在`app/core/config.py`中：
- `UPLOAD_DIR`: 文件上传存储目录
- `MAX_UPLOAD_SIZE`: 最大文件大小（默认100MB）
- `ALLOWED_EXTENSIONS`: 允许的文件类型
- `QDRANT_VECTOR_SIZE`: 向量维度（默认1536，对应OpenAI embedding）
- `RABBITMQ_QUEUE_PREFIX`: 队列名称前缀

## 测试
运行API测试脚本：
```bash
python test_documents_api.py
```

## 注意事项

1. 处理大文件时建议增加消费者进程数量
2. 不同文档类型的解析效果可能有差异，复杂格式建议预处理
3. Embedding模型需要与向量维度配置一致
4. 生产环境建议使用对象存储代替本地文件存储
5. 定期清理已处理完成的源文件以节省存储空间
