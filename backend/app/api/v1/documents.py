import os
import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.crud.document import crud_document
from app.db.qdrant import delete_document_vectors
from app.db.session import get_db_session
from app.schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentStatusResponse,
    DocumentUploadResponse,
)

router = APIRouter()

# 确保上传目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def serialize_document(document) -> Dict[str, Any]:
    return {
        "id": document.id,
        "name": document.name,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "metadata": document.doc_metadata,
        "status": document.status,
        "error_message": document.error_message,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "chunks": [],
    }


def serialize_document_status(document) -> Dict[str, Any]:
    return {
        "id": document.id,
        "status": document.status,
        "error_message": document.error_message,
        "updated_at": document.updated_at,
    }


@router.post("/upload", response_model=DocumentUploadResponse, summary="上传文档")
async def upload_document(
    file: UploadFile = File(..., description="上传的文件"), db: AsyncSession = Depends(get_db_session)
):
    """
    上传文档并加入处理队列
    - **file**: 上传的文件，支持txt、pdf、doc、docx、xls、xlsx、ppt、pptx、md、json、csv格式
    """
    # 验证文件扩展名
    file_extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型。支持的类型: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # 验证文件大小
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制。最大允许: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # 保存文件
    with open(file_path, "wb") as f:
        f.write(file_content)

    # 创建文档记录
    document_in = DocumentCreate(
        name=file.filename,
        file_type=file_extension,
        file_size=file_size,
        metadata={
            "original_filename": file.filename,
            "stored_filename": unique_filename,
            "file_path": file_path,
            "content_type": file.content_type,
        },
    )

    document = await crud_document.create(db, obj_in=document_in)

    try:
        from app.worker.document_processor import process_document_task

        await process_document_task(document.id, file_path)
        message = "文件上传成功，已加入处理队列"
    except Exception as exc:
        message = f"文件已上传，但后台处理链路暂不可用: {str(exc)}"

    return {"success": True, "message": message, "document": serialize_document(document)}


@router.get("", response_model=DocumentListResponse, summary="获取文档列表")
async def get_documents(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(100, ge=1, le=1000, description="返回数量上限"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    获取所有文档列表
    - **skip**: 跳过数量
    - **limit**: 返回数量上限
    """
    documents = await crud_document.get_multi(db, skip=skip, limit=limit)
    total = await crud_document.count(db)

    return {"total": total, "items": [serialize_document(document) for document in documents]}


@router.get("/{document_id}", response_model=DocumentResponse, summary="获取文档详情")
async def get_document(
    document_id: int,
    include_chunks: bool = Query(False, description="是否包含分片内容"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    根据ID获取文档详情
    - **document_id**: 文档ID
    - **include_chunks**: 是否包含分片内容
    """
    document = await crud_document.get(db, id=document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {document_id} 的文档不存在")

    # 如果需要包含分片，手动加载关联对象
    if include_chunks:
        from app.crud.document import crud_document_chunk

        chunks = await crud_document_chunk.get_by_document_id(db, document_id=document_id)
        document.chunks = chunks

    response = serialize_document(document)
    if include_chunks:
        response["chunks"] = [
            {
                "id": chunk.id,
                "document_id": chunk.document_id,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "created_at": chunk.created_at,
            }
            for chunk in document.chunks
        ]

    return response


@router.delete("/{document_id}", response_model=dict, summary="删除文档")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    删除指定文档
    - **document_id**: 文档ID
    """
    document = await crud_document.get(db, id=document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {document_id} 的文档不存在")

    # 删除物理文件
    if document.doc_metadata and "file_path" in document.doc_metadata:
        file_path = document.doc_metadata["file_path"]
        if os.path.exists(file_path):
            os.remove(file_path)

    # 删除数据库记录（关联的分片会级联删除）
    await crud_document.remove(db, id=document_id)

    # 删除Qdrant中的向量数据
    try:
        delete_document_vectors(document_id)
    except Exception as e:
        # 向量删除失败不影响主流程，记录日志即可
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"删除文档 {document_id} 的向量数据失败: {str(e)}")

    return {"success": True, "message": "文档删除成功"}


@router.get("/{document_id}/status", response_model=DocumentStatusResponse, summary="获取文档处理状态")
async def get_document_status(document_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    获取文档处理状态
    - **document_id**: 文档ID
    """
    document = await crud_document.get(db, id=document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {document_id} 的文档不存在")

    return serialize_document_status(document)
