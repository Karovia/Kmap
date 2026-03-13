import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import httpx
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings
from app.models.llm_provider import LLMProvider
from app.core.local_inference import local_inference

try:
    import google.generativeai as genai
except ImportError:
    genai = None


@dataclass
class ChatResponse:
    content: str


class GeminiChat:
    """Google Gemini 对话接口"""

    def __init__(self, api_key: str, model: str, max_tokens: int = 2000, temperature: float = 0.7):
        if genai is None:
            raise ValueError("当前环境未安装 google-generativeai，暂时无法使用 Gemini 对话模型")
        genai.configure(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.client = genai.GenerativeModel(model_name=model)

    @staticmethod
    def _convert_messages(messages: List[Any]) -> List[Dict[str, str]]:
        converted: List[Dict[str, str]] = []
        for message in messages:
            role = "model"
            if isinstance(message, SystemMessage):
                # Gemini不支持system role，合并到第一条user消息
                continue
            elif isinstance(message, HumanMessage):
                role = "user"

            converted.append({"role": role, "parts": [str(message.content)]})
        return converted

    def _get_system_message(self, messages: List[Any]) -> Optional[str]:
        """提取系统消息"""
        for message in messages:
            if isinstance(message, SystemMessage):
                return str(message.content)
        return None

    async def ainvoke(self, messages: List[Any], **kwargs) -> ChatResponse:
        system_prompt = self._get_system_message(messages)
        converted_messages = self._convert_messages(messages)

        generation_config = {
            "temperature": kwargs.get("temperature", self.temperature),
            "max_output_tokens": kwargs.get("max_tokens", self.max_tokens),
        }

        response = await self.client.generate_content_async(
            converted_messages,
            generation_config=generation_config,
            stream=False
        )
        response.resolve()

        return ChatResponse(content=response.text)

    def invoke(self, messages: List[Any], **kwargs) -> ChatResponse:
        system_prompt = self._get_system_message(messages)
        converted_messages = self._convert_messages(messages)

        generation_config = {
            "temperature": kwargs.get("temperature", self.temperature),
            "max_output_tokens": kwargs.get("max_tokens", self.max_tokens),
        }

        response = self.client.generate_content(
            converted_messages,
            generation_config=generation_config,
            stream=False
        )
        response.resolve()

        return ChatResponse(content=response.text)


class ArkAnthropicCompatibleChat:
    """火山方舟 Anthropic 兼容对话接口。"""

    def __init__(self, api_key: str, base_url: str, model: str, max_tokens: int = 2000, temperature: float = 0.7):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature

    def _build_messages_url(self) -> str:
        if self.base_url.endswith("/messages"):
            return self.base_url
        if self.base_url.endswith("/v1"):
            return f"{self.base_url}/messages"
        return f"{self.base_url}/v1/messages"

    @staticmethod
    def _convert_messages(messages: List[Any]) -> List[Dict[str, str]]:
        converted: List[Dict[str, str]] = []
        for message in messages:
            role = "assistant"
            if isinstance(message, SystemMessage):
                role = "system"
            elif isinstance(message, HumanMessage):
                role = "user"

            converted.append({"role": role, "content": str(message.content)})
        return converted

    async def ainvoke(self, messages: List[Any], **kwargs) -> ChatResponse:
        payload = {
            "model": kwargs.get("model", self.model),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "temperature": kwargs.get("temperature", self.temperature),
            "messages": self._convert_messages(messages),
        }
        headers = {
            "content-type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "anthropic-version": "2023-06-01",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self._build_messages_url(), json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        text_parts = []
        for item in data.get("content", []):
            if item.get("type") == "text":
                text_parts.append(item.get("text", ""))

        return ChatResponse(content="\n".join(part for part in text_parts if part))

    def invoke(self, messages: List[Any], **kwargs) -> ChatResponse:
        payload = {
            "model": kwargs.get("model", self.model),
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "temperature": kwargs.get("temperature", self.temperature),
            "messages": self._convert_messages(messages),
        }
        headers = {
            "content-type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "anthropic-version": "2023-06-01",
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(self._build_messages_url(), json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        text_parts = []
        for item in data.get("content", []):
            if item.get("type") == "text":
                text_parts.append(item.get("text", ""))

        return ChatResponse(content="\n".join(part for part in text_parts if part))


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
            if provider.base_url and "volces.com" in provider.base_url:
                return ArkAnthropicCompatibleChat(
                    api_key=provider.api_key,
                    base_url=provider.base_url,
                    model=provider.model_name,
                    max_tokens=common_params["max_tokens"],
                    temperature=common_params["temperature"],
                )

            from langchain_community.chat_models import ChatAnthropic

            return ChatAnthropic(anthropic_api_key=provider.api_key, anthropic_api_url=provider.base_url, **common_params)
        if provider.type == "gemini":
            return GeminiChat(
                api_key=provider.api_key,
                model=provider.model_name,
                max_tokens=common_params["max_tokens"],
                temperature=common_params["temperature"],
            )
        if provider.type == "custom":
            from langchain_community.chat_models import ChatOpenAI

            return ChatOpenAI(api_key=provider.api_key, base_url=provider.base_url, **common_params)
        if provider.type == "local":
            # 本地模型不需要API密钥等参数，直接返回本地LLM实例
            return local_inference.llm
        raise ValueError(f"不支持的服务商类型: {provider.type}")


class GeminiEmbeddings:
    """Google Gemini Embedding 接口"""

    def __init__(self, api_key: str, model: str):
        if genai is None:
            raise ValueError("当前环境未安装 google-generativeai，暂时无法使用 Gemini Embedding 模型")
        genai.configure(api_key=api_key)
        self.model = model

    def embed_query(self, text: str) -> List[float]:
        """嵌入单个文本"""
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document"
        )
        return result["embedding"]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """批量嵌入文本"""
        results = []
        for text in texts:
            result = genai.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_document"
            )
            results.append(result["embedding"])
        return results


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
            return GeminiEmbeddings(api_key=provider.api_key, model=provider.model_name)
        if provider.type == "local":
            # 本地Embedding模型
            return local_inference.embedding
        raise ValueError(f"当前 Embedding 不支持服务商类型: {provider.type}")


class LLMService:
    """LLM服务类，提供统一的调用接口"""

    def __init__(self, provider: LLMProvider):
        self.provider = provider
        self.llm = LLMFactory.create_llm(provider)

    def _is_ark_claude_compatible(self) -> bool:
        return bool(self.provider.type == "claude" and self.provider.base_url and "volces.com" in self.provider.base_url)

    def _create_ark_chat(self, max_tokens: int = 2000, temperature: float = 0.7) -> ArkAnthropicCompatibleChat:
        return ArkAnthropicCompatibleChat(
            api_key=self.provider.api_key,
            base_url=self.provider.base_url,
            model=self.provider.model_name,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    @staticmethod
    def _convert_chat_messages(messages: List[Dict[str, str]]) -> List[Any]:
        converted_messages: List[Any] = []
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "").strip()
            if not content:
                continue

            if role == "system":
                converted_messages.append(SystemMessage(content=content))
            elif role == "assistant":
                converted_messages.append(AIMessage(content=content))
            else:
                converted_messages.append(HumanMessage(content=content))

        return converted_messages

    async def agenerate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        if self._is_ark_claude_compatible():
            response = await self._create_ark_chat(
                max_tokens=kwargs.get("max_tokens", 2000),
                temperature=kwargs.get("temperature", 0.7),
            ).ainvoke(messages, **kwargs)
            return response.content

        response = await self.llm.ainvoke(messages, **kwargs)
        return response.content

    async def achat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        langchain_messages = self._convert_chat_messages(messages)
        if not langchain_messages:
            raise ValueError("对话消息不能为空")

        if self._is_ark_claude_compatible():
            response = await self._create_ark_chat(
                max_tokens=kwargs.get("max_tokens", 2000),
                temperature=kwargs.get("temperature", 0.7),
            ).ainvoke(langchain_messages, **kwargs)
            return response.content

        response = await self.llm.ainvoke(langchain_messages, **kwargs)
        return response.content

    def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        if self._is_ark_claude_compatible():
            response = self._create_ark_chat(
                max_tokens=kwargs.get("max_tokens", 2000),
                temperature=kwargs.get("temperature", 0.7),
            ).invoke(messages, **kwargs)
            return response.content

        response = self.llm.invoke(messages, **kwargs)
        return response.content

    async def test_connection(self, prompt: str = "Hello, this is a test message.", max_tokens: int = 100) -> Dict[str, Any]:
        start_time = time.time()
        try:
            messages = [HumanMessage(content=prompt)]
            if self._is_ark_claude_compatible():
                response = await self._create_ark_chat(max_tokens=max_tokens, temperature=0.1).ainvoke(messages)
            else:
                test_llm = LLMFactory.create_llm(self.provider, temperature=0.1, max_tokens=max_tokens)
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

    # 纯本地模式，直接返回本地LLM服务
    if settings.RUN_MODE == "local" and settings.LOCAL_INFERENCE_ENABLED and local_inference.is_available():
        local_provider = LLMProvider(
            name="Local LLM",
            type="local",
            provider_scope="chat",
            api_key="",
            base_url=None,
            model_name="qwen2-0.5b",
            is_default=True,
        )
        return LLMService(local_provider)

    default_provider = await llm_provider.get_default(db_session, provider_scope="chat")

    # 混合模式，如果云端不可用且本地可用，回退到本地
    if not default_provider and settings.RUN_MODE == "hybrid" and settings.LOCAL_INFERENCE_ENABLED and local_inference.is_available():
        local_provider = LLMProvider(
            name="Local LLM",
            type="local",
            provider_scope="chat",
            api_key="",
            base_url=None,
            model_name="qwen2-0.5b",
            is_default=True,
        )
        return LLMService(local_provider)

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

    # 纯本地模式，直接返回本地Embedding服务
    if settings.RUN_MODE == "local" and settings.LOCAL_INFERENCE_ENABLED and local_inference.is_available():
        local_provider = LLMProvider(
            name="Local Embedding",
            type="local",
            provider_scope="embedding",
            api_key="",
            base_url=None,
            model_name="bge-small-zh-v1.5",
            is_default=True,
        )
        return EmbeddingService(local_provider)

    default_provider = await llm_provider.get_default(db_session, provider_scope="embedding")

    # 混合模式，如果云端不可用且本地可用，回退到本地
    if not default_provider and settings.RUN_MODE == "hybrid" and settings.LOCAL_INFERENCE_ENABLED and local_inference.is_available():
        local_provider = LLMProvider(
            name="Local Embedding",
            type="local",
            provider_scope="embedding",
            api_key="",
            base_url=None,
            model_name="bge-small-zh-v1.5",
            is_default=True,
        )
        return EmbeddingService(local_provider)

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
