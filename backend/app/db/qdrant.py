from qdrant_client import QdrantClient
from typing import Optional

from app.core.config import settings

qdrant_client: Optional[QdrantClient] = None


def get_qdrant_client() -> QdrantClient:
    """获取Qdrant客户端"""
    global qdrant_client
    if qdrant_client is None:
        qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            timeout=30
        )
    return qdrant_client


def close_qdrant_connection():
    """关闭Qdrant连接"""
    global qdrant_client
    if qdrant_client:
        qdrant_client.close()
        qdrant_client = None
