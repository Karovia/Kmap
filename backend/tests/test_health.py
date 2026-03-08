import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_health_check():
    """测试基础健康检查接口"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == settings.PROJECT_NAME
    assert data["environment"] == settings.ENVIRONMENT
    assert data["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_root_endpoint():
    """测试根路径"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "Welcome to Kmap Backend API" in data["message"]
    assert data["docs"] == "/docs"
    assert data["health"] == f"{settings.API_V1_STR}/health"
