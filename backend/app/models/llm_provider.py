from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from app.models.base import Base


class LLMProvider(Base):
    """LLM服务商模型"""

    __tablename__ = "llm_provider"

    id = Column(Integer, primary_key=True, index=True, comment="主键ID")
    name = Column(String(50), unique=True, nullable=False, comment="服务商名称")
    type = Column(String(20), nullable=False, comment="服务商类型：gemini/openai/claude/custom")
    provider_scope = Column(String(20), nullable=False, default="chat", comment="服务商用途：chat/embedding")
    api_key = Column(String(255), nullable=False, comment="API密钥")
    base_url = Column(String(255), comment="API基础地址")
    model_name = Column(String(100), nullable=False, comment="模型名称")
    is_default = Column(Boolean, default=False, comment="是否为默认服务商")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")

    def __repr__(self):
        return f"<LLMProvider(name='{self.name}', scope='{self.provider_scope}', type='{self.type}', model='{self.model_name}')>"
