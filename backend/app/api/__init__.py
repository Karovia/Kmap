from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.v1 import api_v1_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(api_v1_router)
