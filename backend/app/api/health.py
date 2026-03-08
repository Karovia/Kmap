from typing import Dict
from fastapi import APIRouter, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db_session
from app.db.redis import get_redis_client
from app.db.qdrant import get_qdrant_client
from app.db.nebula import get_nebula_client
from app.db.rabbitmq import get_rabbitmq_connection

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict:
    """基础健康检查接口"""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0"
    }


@router.get("/health/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check() -> Dict:
    """详细健康检查，检查所有依赖服务状态"""
    checks = {}
    overall_status = "ok"

    # 检查 PostgreSQL
    try:
        async with get_db_session() as session:
            result = await session.execute(text("SELECT 1"))
            await session.commit()
            checks["postgresql"] = "ok"
    except Exception as e:
        checks["postgresql"] = f"error: {str(e)}"
        overall_status = "error"

    # 检查 Redis
    try:
        redis = get_redis_client()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
        overall_status = "error"

    # 检查 Qdrant
    try:
        qdrant = get_qdrant_client()
        qdrant_health = qdrant.health()
        checks["qdrant"] = "ok" if qdrant_health.status == "ok" else "error"
    except Exception as e:
        checks["qdrant"] = f"error: {str(e)}"
        overall_status = "error"

    # 检查 Nebula Graph
    try:
        nebula_client = get_nebula_client()
        if nebula_client.is_connected():
            checks["nebula_graph"] = "ok"
        else:
            checks["nebula_graph"] = "error: not connected"
            overall_status = "error"
    except Exception as e:
        checks["nebula_graph"] = f"error: {str(e)}"
        overall_status = "error"

    # 检查 RabbitMQ
    try:
        rabbitmq_conn = await get_rabbitmq_connection()
        if rabbitmq_conn.is_closed:
            checks["rabbitmq"] = "error: connection closed"
            overall_status = "error"
        else:
            checks["rabbitmq"] = "ok"
            await rabbitmq_conn.close()
    except Exception as e:
        checks["rabbitmq"] = f"error: {str(e)}"
        overall_status = "error"

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
        "checks": checks
    }
