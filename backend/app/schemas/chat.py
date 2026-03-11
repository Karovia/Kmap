from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


ChatRole = Literal["system", "user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole = Field(..., description="消息角色")
    content: str = Field(..., min_length=1, description="消息内容")

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("消息内容不能为空")
        return content


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, description="对话消息列表")
    max_tokens: int = Field(1000, ge=1, le=4000, description="最大输出 token 数")
    temperature: float = Field(0.7, ge=0, le=2, description="采样温度")


class ChatResponse(BaseModel):
    success: bool = Field(..., description="是否请求成功")
    message: str = Field(..., description="接口结果描述")
    reply: str = Field(..., description="模型回复内容")
    provider_name: Optional[str] = Field(None, description="本次使用的服务商名称")
