from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.llm import get_default_llm_service
from app.db.session import get_db_session
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse, summary="发送聊天消息")
async def create_chat_completion(chat_request: ChatRequest, db: AsyncSession = Depends(get_db_session)):
    llm_service = await get_default_llm_service(db)
    if not llm_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="当前没有可用的默认对话模型，请先在设置中配置默认 chat 服务商",
        )

    try:
        reply = await llm_service.achat(
            messages=[message.model_dump() for message in chat_request.messages],
            max_tokens=chat_request.max_tokens,
            temperature=chat_request.temperature,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"聊天请求失败: {str(error)}",
        )

    return ChatResponse(
        success=True,
        message="聊天请求成功",
        reply=reply,
        provider_name=llm_service.provider.name,
    )
