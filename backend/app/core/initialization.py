import logging
from app.core.config import settings
from app.core.local_inference import local_inference
from app.core.local_graph import local_graph

logger = logging.getLogger(__name__)


def initialize_local_services() -> None:
    """初始化所有本地服务"""
    logger.info("开始初始化本地服务...")

    # 初始化本地推理引擎
    if settings.LOCAL_INFERENCE_ENABLED:
        try:
            local_inference.initialize(
                llm_model_path=settings.LOCAL_LLM_MODEL_PATH,
                llm_tokenizer_path=settings.LOCAL_LLM_TOKENIZER_PATH,
                embedding_model_path=settings.LOCAL_EMBEDDING_MODEL_PATH,
                embedding_tokenizer_path=settings.LOCAL_EMBEDDING_TOKENIZER_PATH,
                use_gpu=settings.LOCAL_USE_GPU
            )
            logger.info("本地推理引擎初始化成功")
        except Exception as e:
            logger.error(f"本地推理引擎初始化失败: {str(e)}", exc_info=True)
            if settings.RUN_MODE == "local":
                raise RuntimeError("纯本地模式下本地推理引擎初始化失败，无法启动服务") from e

    # 初始化本地图数据库
    if settings.RUN_MODE in ["local", "hybrid"]:
        try:
            local_graph.initialize(
                db_path=settings.LOCAL_GRAPH_DB_PATH,
                db_type=settings.LOCAL_GRAPH_DB_TYPE
            )
            logger.info("本地图数据库初始化成功")
        except Exception as e:
            logger.error(f"本地图数据库初始化失败: {str(e)}", exc_info=True)
            if settings.RUN_MODE == "local":
                raise RuntimeError("纯本地模式下本地图数据库初始化失败，无法启动服务") from e

    logger.info("本地服务初始化完成")
