from typing import Optional

import redis.asyncio as redis

from app.core.config import settings

redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
    """获取Redis客户端"""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            decode_responses=True,
        )
    return redis_client


async def close_redis_connection():
    """关闭Redis连接"""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
