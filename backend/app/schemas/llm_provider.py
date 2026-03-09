from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class ProviderBase(BaseModel):
    """服务商基础Schema"""

    name: str = Field(..., min_length=1, max_length=50, description="服务商名称")
    type: str = Field(..., description="服务商类型：gemini/openai/claude/custom")
    provider_scope: str = Field(..., description="服务商用途：chat/embedding")
    api_key: str = Field(..., min_length=1, max_length=255, description="API密钥")
    base_url: Optional[HttpUrl] = Field(None, description="API基础地址")
    model_name: str = Field(..., min_length=1, max_length=100, description="模型名称")
    is_default: Optional[bool] = Field(False, description="是否为当前用途默认服务商")

    @field_validator("type")
    def validate_provider_type(cls, v):
        allowed_types = ["gemini", "openai", "claude", "custom"]
        if v not in allowed_types:
            raise ValueError(f"服务商类型必须是以下之一: {', '.join(allowed_types)}")
        return v

    @field_validator("provider_scope")
    def validate_provider_scope(cls, v):
        allowed_scopes = ["chat", "embedding"]
        if v not in allowed_scopes:
            raise ValueError(f"服务商用途必须是以下之一: {', '.join(allowed_scopes)}")
        return v


class ProviderCreate(ProviderBase):
    """创建服务商Schema"""


class ProviderUpdate(BaseModel):
    """更新服务商Schema"""

    name: Optional[str] = Field(None, min_length=1, max_length=50, description="服务商名称")
    type: Optional[str] = Field(None, description="服务商类型：gemini/openai/claude/custom")
    provider_scope: Optional[str] = Field(None, description="服务商用途：chat/embedding")
    api_key: Optional[str] = Field(None, min_length=1, max_length=255, description="API密钥")
    base_url: Optional[HttpUrl] = Field(None, description="API基础地址")
    model_name: Optional[str] = Field(None, min_length=1, max_length=100, description="模型名称")
    is_default: Optional[bool] = Field(None, description="是否为默认服务商")

    @field_validator("type")
    def validate_provider_type(cls, v):
        if v is None:
            return v
        allowed_types = ["gemini", "openai", "claude", "custom"]
        if v not in allowed_types:
            raise ValueError(f"服务商类型必须是以下之一: {', '.join(allowed_types)}")
        return v

    @field_validator("provider_scope")
    def validate_provider_scope(cls, v):
        if v is None:
            return v
        allowed_scopes = ["chat", "embedding"]
        if v not in allowed_scopes:
            raise ValueError(f"服务商用途必须是以下之一: {', '.join(allowed_scopes)}")
        return v


class ProviderResponse(ProviderBase):
    """服务商响应Schema"""

    id: int = Field(..., description="主键ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ProviderTestRequest(BaseModel):
    """服务商测试请求Schema"""

    prompt: str = Field("Hello, this is a test message.", description="测试提示词")
    max_tokens: int = Field(100, ge=1, le=1000, description="最大生成token数")


class ProviderTestResponse(BaseModel):
    """服务商测试响应Schema"""

    success: bool = Field(..., description="测试是否成功")
    message: str = Field(..., description="测试结果消息")
    response: Optional[str] = Field(None, description="模型返回内容或测试说明")
    latency: float = Field(..., description="请求耗时（秒）")
