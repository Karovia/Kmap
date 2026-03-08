from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class DocumentBase(BaseModel):
    """文档基础Schema"""
    name: str = Field(..., min_length=1, max_length=255, description="文档名称")
    file_type: str = Field(..., description="文件类型")
    file_size: int = Field(..., ge=0, description="文件大小（字节）")
    metadata: Optional[Dict[str, Any]] = Field(None, description="元数据信息")

    @field_validator('file_type')
    def validate_file_type(cls, v):
        allowed_types = ["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "md", "json", "csv"]
        if v.lower() not in allowed_types:
            raise ValueError(f"不支持的文件类型。支持的类型: {', '.join(allowed_types)}")
        return v.lower()


class DocumentCreate(DocumentBase):
    """创建文档Schema"""
    pass


class DocumentUpdate(BaseModel):
    """更新文档Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="文档名称")
    status: Optional[str] = Field(None, description="处理状态")
    error_message: Optional[str] = Field(None, description="错误信息")
    metadata: Optional[Dict[str, Any]] = Field(None, description="元数据信息")

    @field_validator('status')
    def validate_status(cls, v):
        if v is None:
            return v
        allowed_status = ["pending", "splitting", "embedding", "indexed", "error"]
        if v not in allowed_status:
            raise ValueError(f"无效的状态。允许的状态: {', '.join(allowed_status)}")
        return v


class DocumentChunkResponse(BaseModel):
    """文档分片响应Schema"""
    id: int = Field(..., description="分片ID")
    document_id: int = Field(..., description="所属文档ID")
    content: str = Field(..., description="分片内容")
    page_number: Optional[int] = Field(None, description="页码")
    created_at: datetime = Field(..., description="创建时间")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DocumentResponse(DocumentBase):
    """文档响应Schema"""
    id: int = Field(..., description="文档ID")
    status: str = Field(..., description="处理状态")
    error_message: Optional[str] = Field(None, description="错误信息")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    chunks: Optional[List[DocumentChunkResponse]] = Field(None, description="文档分片列表")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DocumentStatusResponse(BaseModel):
    """文档状态响应Schema"""
    id: int = Field(..., description="文档ID")
    status: str = Field(..., description="处理状态")
    error_message: Optional[str] = Field(None, description="错误信息")
    updated_at: datetime = Field(..., description="状态更新时间")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DocumentListResponse(BaseModel):
    """文档列表响应Schema"""
    total: int = Field(..., description="总数量")
    items: List[DocumentResponse] = Field(..., description="文档列表")


class DocumentUploadResponse(BaseModel):
    """文档上传响应Schema"""
    success: bool = Field(..., description="是否上传成功")
    message: str = Field(..., description="消息")
    document: DocumentResponse = Field(..., description="文档信息")
