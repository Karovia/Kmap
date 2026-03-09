import time
from typing import Any, Dict, List, Optional

import httpx
from langchain.schema import HumanMessage, SystemMessage
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings
from app.models.llm_provider import LLMProvider


class LLMFactory:
    """LLM工厂类，创建不同类型的LLM实例"""

    @staticmethod
    def create_llm(provider: LLMProvider, **kwargs):
        common_params = {
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2000),
            "model": provider.model_name,
        }

        if provider.type == "openai":
            from langchain_community.chat_models import ChatOpenAI

            return ChatOpenAI(api_key=provider.api_key, base_url=provider.base_url, **common_params)
        if provider.type == "claude":
            from langchain_community.chat_models import ChatAnthropic

            return ChatAnthropic(anthropic_api_key=provider.api_key, anthropic_api_url=provider.base_url, **common_params)
        if provider.type == "gemini":
            raise ValueError("当前后端尚未接入 Gemini 对话模型，请先使用 OpenAI、Claude 或自定义 OpenAI 兼容服务")
        if provider.type == "custom":
            from langchain_community.chat_models import ChatOpenAI

            return ChatOpenAI(api_key=provider.api_key, base_url=provider.base_url, **common_params)
        raise ValueError(f"不支持的服务商类型: {provider.type}")


class VolcengineEmbeddings:
    """火山引擎多模态 Embedding"""

    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model

    def embed_query(self, text: str) -> List[float]:
        """嵌入单个文本"""
        # 如果 base_url 已经包含 /embeddings/multimodal，直接使用
        if self.base_url.endswith("/embeddings/multimodal"):
            url = self.base_url
        else:
            url = f"{self.base_url}/embeddings/multimodal"

        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"}
        data = {"model": self.model, "input": [{"type": "text", "text": text}]}

        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            return result["data"]["embedding"]


class EmbeddingFactory:
    """Embedding工厂类，创建不同类型的向量模型实例"""

    @staticmethod
    def create_embeddings(provider: LLMProvider):
        # 检查是否是火山引擎（通过 base_url 判断）
        if provider.base_url and "volces.com" in provider.base_url:
            return VolcengineEmbeddings(api_key=provider.api_key, base_url=provider.base_url, model=provider.model_name)
        if provider.type == "openai":
            return OpenAIEmbeddings(api_key=provider.api_key, base_url=provider.base_url, model=provider.model_name)
        if provider.type == "custom":
            return OpenAIEmbeddings(api_key=provider.api_key, base_url=provider.base_url, model=provider.model_name)
        if provider.type == "gemini":
            raise ValueError("当前后端尚未接入 Gemini Embedding，请先使用 OpenAI 或自定义 OpenAI 兼容向量服务")
        raise ValueError(f"当前 Embedding 不支持服务商类型: {provider.type}")


class LLMService:
    """LLM服务类，提供统一的调用接口"""

    def __init__(self, provider: LLMProvider):
        self.provider = provider
        self.llm = LLMFactory.create_llm(provider)

    async def agenerate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = await self.llm.ainvoke(messages, **kwargs)
        return response.content

    def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = self.llm.invoke(messages, **kwargs)
        return response.content

    async def test_connection(self, prompt: str = "Hello, this is a test message.", max_tokens: int = 100) -> Dict[str, Any]:
        start_time = time.time()
        try:
            test_llm = LLMFactory.create_llm(self.provider, temperature=0.1, max_tokens=max_tokens)
            messages = [HumanMessage(content=prompt)]
            response = await test_llm.ainvoke(messages)
            latency = time.time() - start_time

            return {
                "success": True,
                "message": "连接测试成功",
                "response": response.content,
                "latency": round(latency, 3),
            }
        except Exception as e:
            latency = time.time() - start_time
            return {
                "success": False,
                "message": f"连接测试失败: {str(e)}",
                "response": None,
                "latency": round(latency, 3),
            }


class EmbeddingService:
    """Embedding 服务类"""

    def __init__(self, provider: LLMProvider):
        self.provider = provider
        self.embeddings = EmbeddingFactory.create_embeddings(provider)

    async def test_connection(self, text: str = "embedding test") -> Dict[str, Any]:
        start_time = time.time()
        try:
            vector = self.embeddings.embed_query(text)
            latency = time.time() - start_time
            return {
                "success": True,
                "message": f"Embedding 连接测试成功，向量维度 {len(vector)}",
                "response": f"vector_length={len(vector)}",
                "latency": round(latency, 3),
            }
        except Exception as e:
            latency = time.time() - start_time
            return {
                "success": False,
                "message": f"Embedding 连接测试失败: {str(e)}",
                "response": None,
                "latency": round(latency, 3),
            }


async def get_default_llm_service(db_session) -> Optional[LLMService]:
    from app.crud import llm_provider

    default_provider = await llm_provider.get_default(db_session, provider_scope="chat")
    if not default_provider:
        if settings.OPENAI_API_KEY:
            fallback_provider = LLMProvider(
                name="Fallback OpenAI Chat",
                type="openai",
                provider_scope="chat",
                api_key=settings.OPENAI_API_KEY,
                base_url=None,
                model_name=settings.OPENAI_MODEL,
                is_default=True,
            )
            return LLMService(fallback_provider)
        return None

    return LLMService(default_provider)


async def get_default_embedding_service(db_session) -> Optional[EmbeddingService]:
    from app.crud import llm_provider

    default_provider = await llm_provider.get_default(db_session, provider_scope="embedding")
    if not default_provider:
        if settings.OPENAI_API_KEY:
            fallback_provider = LLMProvider(
                name="Fallback OpenAI Embedding",
                type="openai",
                provider_scope="embedding",
                api_key=settings.OPENAI_API_KEY,
                base_url=None,
                model_name=settings.OPENAI_EMBEDDING_MODEL,
                is_default=True,
            )
            return EmbeddingService(fallback_provider)
        return None

    return EmbeddingService(default_provider)
