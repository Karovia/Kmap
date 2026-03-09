from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import llm_provider
from app.db.session import get_db_session
from app.schemas.llm_provider import (
    ProviderCreate,
    ProviderResponse,
    ProviderTestRequest,
    ProviderTestResponse,
    ProviderUpdate,
)

router = APIRouter()


@router.get("", response_model=List[ProviderResponse], summary="获取所有LLM服务商")
async def get_providers(
    skip: int = 0,
    limit: int = 100,
    provider_scope: Optional[str] = Query(None, description="按用途筛选：chat/embedding"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    获取所有LLM服务商列表
    - **skip**: 跳过数量
    - **limit**: 返回数量上限
    """
    providers = await llm_provider.get_multi(db, skip=skip, limit=limit, provider_scope=provider_scope)
    return providers


@router.get("/{provider_id}", response_model=ProviderResponse, summary="获取指定LLM服务商")
async def get_provider(provider_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    根据ID获取指定LLM服务商
    - **provider_id**: 服务商ID
    """
    provider = await llm_provider.get(db, provider_id=provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {provider_id} 的服务商不存在")
    return provider


@router.post("", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED, summary="创建LLM服务商")
async def create_provider(provider_in: ProviderCreate, db: AsyncSession = Depends(get_db_session)):
    """
    创建新的LLM服务商
    - **name**: 服务商名称（唯一）
        - **type**: 服务商类型：gemini/openai/claude/custom
        - **provider_scope**: 服务商用途：chat/embedding
    - **api_key**: API密钥
    - **base_url**: API基础地址（可选）
    - **model_name**: 模型名称
    - **is_default**: 是否为默认服务商（可选）
    """
    # 检查名称是否已存在
    existing_provider = await llm_provider.get_by_name(db, name=provider_in.name, provider_scope=provider_in.provider_scope)
    if existing_provider:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"名称为 {provider_in.name} 的服务商已存在")

    provider = await llm_provider.create(db, obj_in=provider_in)
    return provider


@router.put("/{provider_id}", response_model=ProviderResponse, summary="更新LLM服务商")
async def update_provider(provider_id: int, provider_in: ProviderUpdate, db: AsyncSession = Depends(get_db_session)):
    """
    更新指定LLM服务商
    - **provider_id**: 服务商ID
    - **provider_in**: 更新的字段
    """
    provider = await llm_provider.get(db, provider_id=provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {provider_id} 的服务商不存在")

    # 如果更新名称，检查是否已存在
    if provider_in.name and provider_in.name != provider.name:
        existing_provider = await llm_provider.get_by_name(
            db, name=provider_in.name, provider_scope=provider_in.provider_scope or provider.provider_scope
        )
        if existing_provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"名称为 {provider_in.name} 的服务商已存在"
            )

    provider = await llm_provider.update(db, db_obj=provider, obj_in=provider_in)
    return provider


@router.delete("/{provider_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除LLM服务商")
async def delete_provider(provider_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    删除指定LLM服务商
    - **provider_id**: 服务商ID
    """
    provider = await llm_provider.get(db, provider_id=provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {provider_id} 的服务商不存在")

    await llm_provider.remove(db, provider_id=provider_id)


@router.post("/{provider_id}/test", response_model=ProviderTestResponse, summary="测试LLM服务商配置")
async def test_provider(
    provider_id: int, test_request: ProviderTestRequest, db: AsyncSession = Depends(get_db_session)
):
    """
    测试LLM服务商配置是否可用
    - **provider_id**: 服务商ID
    - **prompt**: 测试提示词（可选）
    - **max_tokens**: 最大生成token数（可选）
    """
    provider = await llm_provider.get(db, provider_id=provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID为 {provider_id} 的服务商不存在")

    try:
        if provider.provider_scope == "embedding":
            from app.core.llm import EmbeddingService

            embedding_service = EmbeddingService(provider)
            result = await embedding_service.test_connection(text=test_request.prompt)
        else:
            from app.core.llm import LLMService

            llm_service = LLMService(provider)
            result = await llm_service.test_connection(prompt=test_request.prompt, max_tokens=test_request.max_tokens)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"测试过程中发生错误: {str(e)}")
