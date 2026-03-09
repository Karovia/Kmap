from typing import Dict, Tuple

from fastapi import APIRouter
from fastapi import status as http_status
from sqlalchemy import text

from app.core.config import settings

router = APIRouter()


async def check_postgresql() -> Tuple[str, str]:
    """检查PostgreSQL数据库连接状态"""
    try:
        from app.db.session import get_db_session

        async with get_db_session() as session:
            await session.execute(text("SELECT 1"))
            await session.commit()
            return "postgresql", "ok"
    except Exception as e:
        return "postgresql", f"error: {str(e)}"


async def check_redis() -> Tuple[str, str]:
    """检查Redis连接状态"""
    try:
        from app.db.redis import get_redis_client

        redis = get_redis_client()
        await redis.ping()
        return "redis", "ok"
    except Exception as e:
        return "redis", f"error: {str(e)}"


def check_qdrant() -> Tuple[str, str]:
    """检查Qdrant向量数据库状态"""
    try:
        from app.db.qdrant import get_qdrant_client

        qdrant = get_qdrant_client()
        qdrant_health = qdrant.health()
        status = "ok" if qdrant_health.status == "ok" else "error"
        return "qdrant", status
    except Exception as e:
        return "qdrant", f"error: {str(e)}"


def check_nebula_graph() -> Tuple[str, str]:
    """检查Nebula Graph图数据库状态"""
    try:
        from app.db.nebula import get_nebula_client

        nebula_client = get_nebula_client()
        if nebula_client.is_connected():
            return "nebula_graph", "ok"
        else:
            return "nebula_graph", "error: not connected"
    except Exception as e:
        return "nebula_graph", f"error: {str(e)}"


async def check_rabbitmq() -> Tuple[str, str]:
    """检查RabbitMQ消息队列状态"""
    try:
        from app.db.rabbitmq import get_rabbitmq_connection

        rabbitmq_conn = await get_rabbitmq_connection()
        if rabbitmq_conn.is_closed:
            return "rabbitmq", "error: connection closed"
        else:
            await rabbitmq_conn.close()
            return "rabbitmq", "ok"
    except Exception as e:
        return "rabbitmq", f"error: {str(e)}"


@router.get("/health", status_code=http_status.HTTP_200_OK)
async def health_check() -> Dict:
    """基础健康检查接口"""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
    }


@router.get("/health/detailed", status_code=http_status.HTTP_200_OK)
async def detailed_health_check() -> Dict:
    """详细健康检查，检查所有依赖服务状态"""
    checks = {}
    overall_status = "ok"

    # 依次检查所有服务
    service_checks = [
        await check_postgresql(),
        await check_redis(),
        check_qdrant(),
        check_nebula_graph(),
        await check_rabbitmq(),
    ]

    # 填充检查结果
    for service_name, service_status in service_checks:
        checks[service_name] = service_status
        if service_status != "ok":
            overall_status = "error"

    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
        "checks": checks,
    }
