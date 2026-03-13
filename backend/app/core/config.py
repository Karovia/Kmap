from typing import List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kmap Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-here-please-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://kmap:kmap123@localhost:5432/kmap"
    DATABASE_SCHEMA: str = "public"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str | None = None
    REDIS_MAX_CONNECTIONS: int = 100

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_PREFIX: str = "kmap_"
    QDRANT_VECTOR_SIZE: int = 1536

    # Nebula Graph
    NEBULA_GRAPH_HOST: str = "localhost"
    NEBULA_GRAPH_PORT: int = 9669
    NEBULA_GRAPH_USER: str = "root"
    NEBULA_GRAPH_PASSWORD: str = "nebula"
    NEBULA_GRAPH_SPACE: str = "kmap"
    NEBULA_GRAPH_TIMEOUT: int = 30000

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://kmap:kmap123@localhost:5672//"
    RABBITMQ_EXCHANGE: str = "kmap_exchange"
    RABBITMQ_QUEUE_PREFIX: str = "kmap_"

    # OpenAI
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-ada-002"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 2000

    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 104857600
    ALLOWED_EXTENSIONS: List[str] = ["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "md", "json", "csv"]

    # Security
    PASSWORD_MIN_LENGTH: int = 8
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]

    # 本地推理配置
    LOCAL_INFERENCE_ENABLED: bool = False
    LOCAL_LLM_MODEL_PATH: str = "./models/qwen2-0.5b-onnx/model.onnx"
    LOCAL_LLM_TOKENIZER_PATH: str = "./models/qwen2-0.5b-onnx"
    LOCAL_EMBEDDING_MODEL_PATH: str = "./models/bge-small-zh-v1.5-onnx/model.onnx"
    LOCAL_EMBEDDING_TOKENIZER_PATH: str = "./models/bge-small-zh-v1.5-onnx"
    LOCAL_USE_GPU: bool = False
    LOCAL_EMBEDDING_DIM: int = 512

    # 运行模式: local(纯本地), cloud(纯云端), hybrid(混合模式，优先本地)
    RUN_MODE: str = "cloud"

    # 本地图数据库配置
    LOCAL_GRAPH_DB_TYPE: str = "litegraph"  # litegraph 或 neo4j-embedded
    LOCAL_GRAPH_DB_PATH: str = "./data/graphdb"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
