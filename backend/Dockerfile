FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV POETRY_VERSION=1.8.1

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安装 Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - --version ${POETRY_VERSION}
ENV PATH="/root/.local/bin:$PATH"

# 配置 Poetry
RUN poetry config virtualenvs.create false

# 复制依赖文件
COPY pyproject.toml poetry.lock* ./

# 安装依赖
RUN poetry install --no-root --no-interaction --no-ansi

# 复制项目代码
COPY . .

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
