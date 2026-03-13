from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.local_inference import local_inference
from app.core.local_graph import local_graph
from app.db.session import get_db_session
from app.schemas.base import BaseResponse

router = APIRouter()


@router.get("/info", response_model=BaseResponse, summary="获取系统信息")
async def get_system_info(db: AsyncSession = Depends(get_db_session)):
    """获取系统运行信息和配置"""
    return BaseResponse(
        success=True,
        message="获取系统信息成功",
        data={
            "run_mode": settings.RUN_MODE,
            "local_inference_enabled": settings.LOCAL_INFERENCE_ENABLED,
            "local_inference_available": local_inference.is_available(),
            "local_graph_available": local_graph.is_available(),
            "local_embedding_dim": settings.LOCAL_EMBEDDING_DIM,
            "supported_formats": [
                ".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".md", ".json", ".csv"
            ]
        }
    )


@router.post("/mode/switch", response_model=BaseResponse, summary="切换运行模式")
async def switch_run_mode(mode: str, db: AsyncSession = Depends(get_db_session)):
    """切换系统运行模式: local/cloud/hybrid"""
    if mode not in ["local", "cloud", "hybrid"]:
        return BaseResponse(
            success=False,
            message=f"不支持的运行模式: {mode}，可选值: local, cloud, hybrid"
        )

    # 检查纯本地模式的依赖是否满足
    if mode == "local":
        if not settings.LOCAL_INFERENCE_ENABLED:
            return BaseResponse(
                success=False,
                message="纯本地模式需要先启用LOCAL_INFERENCE_ENABLED配置"
            )
        if not local_inference.is_available():
            return BaseResponse(
                success=False,
                message="本地推理引擎不可用，请检查模型文件是否存在且配置正确"
            )
        if not local_graph.is_available():
            return BaseResponse(
                success=False,
                message="本地图数据库不可用，请检查配置"
            )

    # 动态修改配置
    settings.RUN_MODE = mode

    return BaseResponse(
        success=True,
        message=f"运行模式已切换为: {mode}",
        data={"current_mode": mode}
    )


@router.get("/local/models/status", response_model=BaseResponse, summary="获取本地模型状态")
async def get_local_models_status():
    """检查本地模型的加载状态和可用性"""
    inference_status = {
        "available": local_inference.is_available(),
        "llm_model": settings.LOCAL_LLM_MODEL_PATH if local_inference.is_available() else None,
        "embedding_model": settings.LOCAL_EMBEDDING_MODEL_PATH if local_inference.is_available() else None,
        "embedding_dim": settings.LOCAL_EMBEDDING_DIM
    }

    graph_status = {
        "available": local_graph.is_available(),
        "db_type": settings.LOCAL_GRAPH_DB_TYPE,
        "db_path": settings.LOCAL_GRAPH_DB_PATH
    }

    return BaseResponse(
        success=True,
        message="获取本地模型状态成功",
        data={
            "inference": inference_status,
            "graph": graph_status
        }
    )
