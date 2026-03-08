import os
import logging
from typing import List, Dict, Any, Optional
import uuid
from unstructured.partition.auto import partition
from unstructured.chunking.title import chunk_by_title
from langchain.embeddings.openai import OpenAIEmbeddings
from qdrant_client.models import PointStruct, VectorParams, Distance

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.db.qdrant import get_qdrant_client
from app.crud.document import crud_document, crud_document_chunk
from app.core.llm import get_default_llm_service

logger = logging.getLogger(__name__)

# Qdrant集合名称
DOCUMENTS_COLLECTION = f"{settings.QDRANT_COLLECTION_PREFIX}documents"


class DocumentProcessor:
    """文档处理服务类"""

    def __init__(self):
        self.qdrant_client = get_qdrant_client()
        self._ensure_collection_exists()

    def _ensure_collection_exists(self) -> None:
        """确保Qdrant集合存在"""
        try:
            if not self.qdrant_client.collection_exists(DOCUMENTS_COLLECTION):
                self.qdrant_client.create_collection(
                    collection_name=DOCUMENTS_COLLECTION,
                    vectors_config=VectorParams(
                        size=settings.QDRANT_VECTOR_SIZE,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Qdrant集合 {DOCUMENTS_COLLECTION} 创建成功")
        except Exception as e:
            logger.error(f"检查/创建Qdrant集合失败: {str(e)}")
            raise

    async def _get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        获取文本的向量嵌入
        :param texts: 文本列表
        :return: 向量列表
        """
        # 优先使用配置的LLM服务商的Embedding
        async with AsyncSessionLocal() as db:
            llm_service = await get_default_llm_service(db)
            if llm_service and llm_service.provider.type == "openai":
                # 使用OpenAI Embedding
                embeddings = OpenAIEmbeddings(
                    api_key=llm_service.provider.api_key,
                    base_url=llm_service.provider.base_url,
                    model=settings.OPENAI_EMBEDDING_MODEL
                )
                return embeddings.embed_documents(texts)
            elif settings.OPENAI_API_KEY:
                #  fallback到配置文件中的OpenAI
                embeddings = OpenAIEmbeddings(
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.OPENAI_EMBEDDING_MODEL
                )
                return embeddings.embed_documents(texts)
            else:
                raise ValueError("没有可用的Embedding模型，请配置LLM服务商或OpenAI API密钥")

    def _parse_document(self, file_path: str) -> List[Any]:
        """
        使用Unstructured.IO解析文档内容
        :param file_path: 文件路径
        :return: 解析后的元素列表
        """
        try:
            elements = partition(
                filename=file_path,
                strategy="auto",
                include_page_breaks=True
            )
            logger.info(f"文档解析完成，共 {len(elements)} 个元素")
            return elements
        except Exception as e:
            logger.error(f"文档解析失败: {str(e)}")
            raise

    def _split_into_chunks(self, elements: List[Any]) -> List[Dict[str, Any]]:
        """
        将解析后的元素按语义分片
        :param elements: 解析后的元素列表
        :return: 分片列表
        """
        try:
            chunks = chunk_by_title(
                elements,
                max_characters=1000,
                new_after_n_chars=800,
                combine_text_under_n_chars=200,
                multipage_sections=True
            )

            processed_chunks = []
            for i, chunk in enumerate(chunks):
                page_number = chunk.metadata.page_number if hasattr(chunk.metadata, 'page_number') else None
                processed_chunks.append({
                    "content": chunk.text,
                    "page_number": page_number,
                    "index": i
                })

            logger.info(f"文档分片完成，共 {len(processed_chunks)} 个分片")
            return processed_chunks
        except Exception as e:
            logger.error(f"文档分片失败: {str(e)}")
            raise

    async def _process_chunks(
        self,
        document_id: int,
        chunks: List[Dict[str, Any]]
    ) -> None:
        """
        处理分片：生成向量并存储到PostgreSQL和Qdrant
        :param document_id: 文档ID
        :param chunks: 分片列表
        """
        try:
            # 提取所有分片内容
            texts = [chunk["content"] for chunk in chunks]

            # 生成向量
            embeddings = await self._get_embeddings(texts)

            # 准备数据库和Qdrant数据
            db_chunks = []
            qdrant_points = []

            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                # 数据库记录
                db_chunks.append({
                    "content": chunk["content"],
                    "embedding": embedding,
                    "page_number": chunk["page_number"]
                })

                # Qdrant点
                point_id = str(uuid.uuid4())
                qdrant_points.append(
                    PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload={
                            "document_id": document_id,
                            "content": chunk["content"],
                            "page_number": chunk["page_number"],
                            "chunk_index": i
                        }
                    )
                )

            # 批量存储到PostgreSQL
            async with AsyncSessionLocal() as db:
                await crud_document_chunk.create_multi(
                    db,
                    document_id=document_id,
                    chunks=db_chunks
                )

            # 批量存储到Qdrant
            self.qdrant_client.upsert(
                collection_name=DOCUMENTS_COLLECTION,
                points=qdrant_points
            )

            logger.info(f"分片处理完成，共 {len(chunks)} 个分片已存储")

        except Exception as e:
            logger.error(f"分片处理失败: {str(e)}")
            raise

    async def process_document(self, document_id: int, file_path: str) -> None:
        """
        完整的文档处理流程
        :param document_id: 文档ID
        :param file_path: 文件路径
        """
        try:
            # 1. 解析文档
            logger.info(f"开始解析文档 {document_id}")
            elements = self._parse_document(file_path)

            # 2. 更新状态为分片中
            async with AsyncSessionLocal() as db:
                await crud_document.update_status(
                    db,
                    document_id=document_id,
                    status="splitting"
                )

            # 3. 语义分片
            logger.info(f"开始分片文档 {document_id}")
            chunks = self._split_into_chunks(elements)

            # 4. 更新状态为向量化中
            async with AsyncSessionLocal() as db:
                await crud_document.update_status(
                    db,
                    document_id=document_id,
                    status="embedding"
                )

            # 5. 处理分片（生成向量并存储）
            logger.info(f"开始向量化文档 {document_id}")
            await self._process_chunks(document_id, chunks)

            # 6. 更新状态为已完成
            async with AsyncSessionLocal() as db:
                await crud_document.update_status(
                    db,
                    document_id=document_id,
                    status="indexed"
                )

            # 7. 可选：删除源文件
            # if os.path.exists(file_path):
            #     os.remove(file_path)
            # logger.info(f"源文件 {file_path} 已删除")

            logger.info(f"文档 {document_id} 处理完成，状态已更新为 indexed")

        except Exception as e:
            logger.error(f"文档 {document_id} 处理失败: {str(e)}", exc_info=True)
            # 更新状态为错误
            async with AsyncSessionLocal() as db:
                await crud_document.update_status(
                    db,
                    document_id=document_id,
                    status="error",
                    error_message=f"处理失败: {str(e)}"
                )
            raise
