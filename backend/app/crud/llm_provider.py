from typing import List, Optional

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.llm_provider import LLMProvider
from app.schemas.llm_provider import ProviderCreate, ProviderUpdate


class CRUDLLMProvider:
    """LLM服务商CRUD操作"""

    async def get(self, db: AsyncSession, provider_id: int) -> Optional[LLMProvider]:
        """根据ID获取服务商"""
        result = await db.execute(select(LLMProvider).where(LLMProvider.id == provider_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, db: AsyncSession, name: str, provider_scope: Optional[str] = None) -> Optional[LLMProvider]:
        """根据名称获取服务商"""
        stmt = select(LLMProvider).where(LLMProvider.name == name)
        if provider_scope:
            stmt = stmt.where(LLMProvider.provider_scope == provider_scope)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_default(self, db: AsyncSession, provider_scope: str = "chat") -> Optional[LLMProvider]:
        """获取默认服务商"""
        result = await db.execute(
            select(LLMProvider).where(LLMProvider.is_default == True).where(LLMProvider.provider_scope == provider_scope)
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, skip: int = 0, limit: int = 100, provider_scope: Optional[str] = None
    ) -> List[LLMProvider]:
        """获取服务商列表"""
        stmt = select(LLMProvider)
        if provider_scope:
            stmt = stmt.where(LLMProvider.provider_scope == provider_scope)
        result = await db.execute(stmt.offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, obj_in: ProviderCreate) -> LLMProvider:
        """创建服务商"""
        # 如果设置为默认，先取消其他默认
        if obj_in.is_default:
            await db.execute(
                update(LLMProvider)
                .where(LLMProvider.is_default == True)
                .where(LLMProvider.provider_scope == obj_in.provider_scope)
                .values(is_default=False)
            )

        db_obj = LLMProvider(
            name=obj_in.name,
            type=obj_in.type,
            provider_scope=obj_in.provider_scope,
            api_key=obj_in.api_key,
            base_url=str(obj_in.base_url) if obj_in.base_url else None,
            model_name=obj_in.model_name,
            is_default=obj_in.is_default,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: LLMProvider, obj_in: ProviderUpdate) -> LLMProvider:
        """更新服务商"""
        update_data = obj_in.model_dump(exclude_unset=True)

        # 如果设置为默认，先取消其他默认
        target_scope = update_data.get("provider_scope", db_obj.provider_scope)

        if update_data.get("is_default"):
            await db.execute(
                update(LLMProvider)
                .where(LLMProvider.is_default == True)
                .where(LLMProvider.provider_scope == target_scope)
                .where(LLMProvider.id != db_obj.id)
                .values(is_default=False)
            )

        # 转换base_url为字符串
        if "base_url" in update_data and update_data["base_url"] is not None:
            update_data["base_url"] = str(update_data["base_url"])

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, provider_id: int) -> Optional[LLMProvider]:
        """删除服务商"""
        result = await db.execute(delete(LLMProvider).where(LLMProvider.id == provider_id).returning(LLMProvider))
        await db.commit()
        return result.scalar_one_or_none()


# 实例化CRUD对象
llm_provider = CRUDLLMProvider()
