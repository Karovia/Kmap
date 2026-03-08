# Kmap 后端服务

## 项目概述

Kmap项目后端服务，基于FastAPI构建，提供知识图谱管理、文档处理、AI问答等功能。

## 技术栈

- **Web框架**: FastAPI 0.109.2
- **数据库**: PostgreSQL 16 + SQLAlchemy 2.0
- **缓存**: Redis 7
- **向量数据库**: Qdrant
- **图数据库**: Nebula Graph v3.6
- **消息队列**: RabbitMQ 3.12
- **AI框架**: LangChain
- **依赖管理**: Poetry

## 快速开始

### 环境要求

- Docker & Docker Compose
- Python 3.11+ (本地开发时)
- Poetry (本地开发时)

### 1. 克隆项目

```bash
cd backend
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动所有服务

```bash
docker-compose up -d
```

这将启动以下服务：
- FastAPI 后端服务: http://localhost:8000
- PostgreSQL 数据库: localhost:5432
- Redis 缓存: localhost:6379
- Qdrant 向量数据库: http://localhost:6333
- Nebula Graph 图数据库: localhost:9669
- RabbitMQ 消息队列: http://localhost:15672 (管理界面)

### 4. 验证服务

访问API文档: http://localhost:8000/docs

健康检查:
```bash
curl http://localhost:8000/api/v1/health
```

详细健康检查（检查所有依赖服务）:
```bash
curl http://localhost:8000/api/v1/health/detailed
```

## 服务访问信息

| 服务 | 地址 | 用户名 | 密码 | 说明 |
|------|------|--------|------|------|
| FastAPI | http://localhost:8000 | - | - | 后端API服务 |
| Swagger文档 | http://localhost:8000/docs | - | - | API文档界面 |
| PostgreSQL | localhost:5432 | kmap | kmap123 | 关系型数据库 |
| Redis | localhost:6379 | - | - | 缓存服务 |
| Qdrant | http://localhost:6333 | - | qdrant123 | 向量数据库 |
| Nebula Graph | localhost:9669 | root | nebula | 图数据库 |
| RabbitMQ | localhost:5672 | kmap | kmap123 | 消息队列 |
| RabbitMQ管理界面 | http://localhost:15672 | kmap | kmap123 | RabbitMQ管理界面 |

## 本地开发

### 安装依赖

```bash
poetry install
```

### 激活虚拟环境

```bash
poetry shell
```

### 启动开发服务器

```bash
python -m app.main
```

或使用uvicorn直接启动:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 代码质量检查

```bash
# 格式化代码
black .
isort .

# 代码检查
flake8 .
mypy .

# 运行测试
pytest
```

## 项目结构

```
backend/
├── app/                          # 主应用目录
│   ├── __init__.py
│   ├── main.py                   # FastAPI入口文件
│   ├── api/                      # API路由层
│   │   ├── __init__.py
│   │   └── health.py             # 健康检查接口
│   ├── core/                     # 核心配置
│   │   ├── __init__.py
│   │   └── config.py             # 配置文件
│   ├── db/                       # 数据库连接
│   │   ├── __init__.py
│   │   ├── session.py            # PostgreSQL连接
│   │   ├── redis.py              # Redis连接
│   │   ├── qdrant.py             # Qdrant连接
│   │   ├── nebula.py             # Nebula Graph连接
│   │   └── rabbitmq.py           # RabbitMQ连接
│   ├── models/                   # SQLAlchemy模型
│   │   └── __init__.py
│   ├── schemas/                  # Pydantic模式
│   │   └── __init__.py
│   ├── crud/                     # CRUD操作
│   │   └── __init__.py
│   └── utils/                    # 工具函数
│       └── __init__.py
├── tests/                        # 测试目录
│   ├── __init__.py
│   └── test_health.py            # 健康检查测试
├── docs/                         # 文档目录
├── scripts/                      # 脚本目录
│   └── init-db.sql               # 数据库初始化脚本
├── pyproject.toml                # 项目依赖配置
├── docker-compose.yml            # Docker Compose配置
├── Dockerfile                    # FastAPI服务Dockerfile
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git忽略配置
└── README.md                     # 项目说明文档
```

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [服务名]

# 停止所有服务
docker-compose down

# 停止并删除数据卷（慎用！会删除所有数据）
docker-compose down -v

# 重启某个服务
docker-compose restart [服务名]

# 重新构建并启动服务
docker-compose up -d --build [服务名]
```

## 开发规范

1. 遵循PEP8编码规范
2. 使用Black和isort进行代码格式化
3. 使用Flake8进行代码检查
4. 使用Mypy进行类型检查
5. 为所有公共函数和方法编写类型注解
6. 编写单元测试，确保测试覆盖率不低于80%

## 环境变量说明

主要环境变量配置请参考 `.env.example` 文件。

## 注意事项

1. 生产环境中请务必修改所有默认密码
2. 确保 `.env` 文件不被提交到版本控制系统
3. 首次启动Nebula Graph后需要手动创建图空间
4. Qdrant的API密钥在生产环境中必须配置
5. RabbitMQ管理界面在生产环境中建议关闭
