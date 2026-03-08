from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any

from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentCreate, DocumentUpdate


class CRUDDocument:
    """文档CRUD操作"""

    async def get(self, db: AsyncSession, id: int) -> Optional[Document]:
        """根据ID获取文档"""
        result = await db.execute(select(Document).filter(Document.id == id))
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Document]:
        """获取文档列表"""
        result = await db.execute(
            select(Document)
            .order_by(Document.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def count(self, db: AsyncSession) -> int:
        """获取文档总数"""
        result = await db.execute(select(func.count(Document.id)))
        return result.scalar_one()

    async def create(self, db: AsyncSession, *, obj_in: DocumentCreate) -> Document:
        """创建文档"""
        db_obj = Document(
            name=obj_in.name,
            file_type=obj_in.file_type,
            file_size=obj_in.file_size,
            metadata=obj_in.metadata,
            status="pending"
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: Document, obj_in: DocumentUpdate | Dict[str, Any]
    ) -> Document:
        """更新文档"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> Document | None:
        """删除文档"""
        obj = await self.get(db, id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

    async def update_status(
        self, db: AsyncSession, *, document_id: int, status: str, error_message: Optional[str] = None
    ) -> Optional[Document]:
        """更新文档状态"""
        document = await self.get(db, id=document_id)
        if not document:
            return None

        update_data = {"status": status}
        if error_message is not None:
            update_data["error_message"] = error_message

        return await self.update(db, db_obj=document, obj_in=update_data)


class CRUDDocumentChunk:
    """文档分片CRUD操作"""

    async def get(self, db: AsyncSession, id: int) -> Optional[DocumentChunk]:
        """根据ID获取分片"""
        result = await db.execute(select(DocumentChunk).filter(DocumentChunk.id == id))
        return result.scalar_one_or_none()

    async def get_by_document_id(
        self, db: AsyncSession, *, document_id: int, skip: int = 0, limit: int = 1000
    ) -> List[DocumentChunk]:
        """根据文档ID获取分片列表"""
        result = await db.execute(
            select(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.page_number, DocumentChunk.id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(
        self, db: AsyncSession, *, document_id: int, content: str,
        embedding: Optional[List[float]] = None, page_number: Optional[int] = None
    ) -> DocumentChunk:
        """创建文档分片"""
        db_obj = DocumentChunk(
            document_id=document_id,
            content=content,
            embedding=embedding,
            page_number=page_number
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def create_multi(
        self, db: AsyncSession, *, document_id: int, chunks: List[Dict[str, Any]]
    ) -> List[DocumentChunk]:
        """批量创建文档分片"""
        db_chunks = []
        for chunk in chunks:
            db_chunk = DocumentChunk(
                document_id=document_id,
                content=chunk["content"],
                embedding=chunk.get("embedding"),
                page_number=chunk.get("page_number")
            )
            db.add(db_chunk)
            db_chunks.append(db_chunk)

        await db.commit()
        for chunk in db_chunks:
            await db.refresh(chunk)

        return db_chunks

    async def update_embedding(
        self, db: AsyncSession, *, chunk_id: int, embedding: List[float]
    ) -> Optional[DocumentChunk]:
        """更新分片的向量嵌入"""
        chunk = await self.get(db, id=chunk_id)
        if not chunk:
            return None

        chunk.embedding = embedding
        await db.commit()
        await db.refresh(chunk)
        return chunk


# 实例化CRUD对象
crud_document = CRUDDocument()
crud_document_chunk = CRUDDocumentChunk()
