from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT

from app.models import Base


class Document(Base):
    """文档模型"""
    __tablename__ = "document"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    name = Column(String(255), nullable=False, comment="文档名称")
    file_type = Column(String(20), nullable=False, comment="文件类型：txt/pdf/doc/docx/xls/xlsx/ppt/pptx/md/json/csv")
    file_size = Column(Integer, nullable=False, comment="文件大小（字节）")
    status = Column(String(20), nullable=False, default="pending", comment="处理状态：pending/splitting/embedding/indexed/error")
    error_message = Column(Text, comment="错误信息")
    metadata = Column(JSON, comment="元数据信息")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    # 关联文档分片
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(name='{self.name}', type='{self.file_type}', status='{self.status}')>"


class DocumentChunk(Base):
    """文档分片模型"""
    __tablename__ = "document_chunk"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    document_id = Column(Integer, ForeignKey("document.id", ondelete="CASCADE"), nullable=False, comment="所属文档ID")
    content = Column(Text, nullable=False, comment="分片内容")
    embedding = Column(ARRAY(FLOAT), comment="向量嵌入")
    page_number = Column(Integer, comment="页码")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 关联所属文档
    document = relationship("Document", back_populates="chunks")

    def __repr__(self):
        return f"<DocumentChunk(document_id={self.document_id}, page={self.page_number}, length={len(self.content)})>"
