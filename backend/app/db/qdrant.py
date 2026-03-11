from typing import Optional

from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.core.config import settings

qdrant_client: Optional[QdrantClient] = None
DOCUMENTS_COLLECTION = f"{settings.QDRANT_COLLECTION_PREFIX}documents"


def get_qdrant_client() -> QdrantClient:
    """获取Qdrant客户端"""
    global qdrant_client
    if qdrant_client is None:
        qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY, timeout=30)
    return qdrant_client


def delete_document_vectors(document_id: int) -> bool:
    """
    删除指定文档的所有向量数据
    :param document_id: 文档ID
    :return: 是否已执行删除请求
    """
    client = get_qdrant_client()

    if not client.collection_exists(DOCUMENTS_COLLECTION):
        return False

    # 构建过滤条件
    filter_condition = Filter(
        must=[
            FieldCondition(
                key="document_id",
                match=MatchValue(value=document_id)
            )
        ]
    )

    # 执行删除
    client.delete(
        collection_name=DOCUMENTS_COLLECTION,
        points_selector=filter_condition,
        wait=True,
    )

    return True


def close_qdrant_connection():
    """关闭Qdrant连接"""
    global qdrant_client
    if qdrant_client:
        qdrant_client.close()
        qdrant_client = None
