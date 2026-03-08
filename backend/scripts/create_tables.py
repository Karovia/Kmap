#!/usr/bin/env python3
"""创建数据库表脚本"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.models import Base


async def create_tables():
    """创建所有数据库表"""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        # 删除现有表（开发环境使用，生产环境请使用迁移工具）
        # await conn.run_sync(Base.metadata.drop_all)
        # 创建所有表
        await conn.run_sync(Base.metadata.create_all)

    print("数据库表创建完成！")


if __name__ == "__main__":
    asyncio.run(create_tables())
