from fastapi import APIRouter

from app.api.v1.chat import router as chat_router
from app.api.v1.documents import router as documents_router
from app.api.v1.graph import router as graph_router
from app.api.v1.providers import router as providers_router

api_v1_router = APIRouter()
api_v1_router.include_router(chat_router, prefix="/chat", tags=["智能对话"])
api_v1_router.include_router(providers_router, prefix="/providers", tags=["LLM服务商"])
api_v1_router.include_router(graph_router, prefix="/graph", tags=["知识图谱"])
api_v1_router.include_router(documents_router, prefix="/documents", tags=["文档管理"])
