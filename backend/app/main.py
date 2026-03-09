from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api import api_router
from app.core.config import settings
# from app.db import close_nebula_connection, close_qdrant_connection, close_rabbitmq_connection, close_redis_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    yield
    # 关闭时清理资源
    # await close_redis_connection()
    # close_qdrant_connection()
    # close_nebula_connection()
    # await close_rabbitmq_connection()


# 创建FastAPI应用实例
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Kmap项目后端API服务",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# 配置CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 配置受信任主机
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# 注册API路由
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """根路径"""
    return {"message": "Welcome to Kmap Backend API", "docs": "/docs", "health": f"{settings.API_V1_STR}/health"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG, workers=settings.WORKERS)
