from typing import Optional, Dict, Any
import time
from langchain.chat_models import (
    ChatOpenAI,
    ChatAnthropic,
    ChatGoogleGenerativeAI
)
from langchain.schema import BaseChatModel, HumanMessage, SystemMessage
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from app.models.llm_provider import LLMProvider
from app.core.config import settings


class LLMFactory:
    """LLM工厂类，创建不同类型的LLM实例"""

    @staticmethod
    def create_llm(provider: LLMProvider, **kwargs) -> BaseChatModel:
        """
        根据服务商类型创建对应的LLM实例

        Args:
            provider: LLM服务商配置
            **kwargs: 额外参数，如temperature, max_tokens等

        Returns:
            BaseChatModel: LLM实例
        """
        common_params = {
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2000),
            "model": provider.model_name,
        }

        if provider.type == "openai":
            return ChatOpenAI(
                api_key=provider.api_key,
                base_url=provider.base_url,
                **common_params
            )
        elif provider.type == "claude":
            return ChatAnthropic(
                anthropic_api_key=provider.api_key,
                anthropic_api_url=provider.base_url,
                **common_params
            )
        elif provider.type == "gemini":
            return ChatGoogleGenerativeAI(
                google_api_key=provider.api_key,
                base_url=provider.base_url,
                **common_params
            )
        elif provider.type == "custom":
            # 自定义服务商默认使用OpenAI兼容接口
            return ChatOpenAI(
                api_key=provider.api_key,
                base_url=provider.base_url,
                **common_params
            )
        else:
            raise ValueError(f"不支持的服务商类型: {provider.type}")


class LLMService:
    """LLM服务类，提供统一的调用接口"""

    def __init__(self, provider: LLMProvider):
        self.provider = provider
        self.llm = LLMFactory.create_llm(provider)

    async def agenerate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """
        异步生成文本

        Args:
            prompt: 用户提示词
            system_prompt: 系统提示词
            **kwargs: 额外参数

        Returns:
            str: 生成的文本
        """
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = await self.llm.ainvoke(messages, **kwargs)
        return response.content

    def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """
        同步生成文本

        Args:
            prompt: 用户提示词
            system_prompt: 系统提示词
            **kwargs: 额外参数

        Returns:
            str: 生成的文本
        """
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = self.llm.invoke(messages, **kwargs)
        return response.content

    async def test_connection(self, prompt: str = "Hello, this is a test message.", max_tokens: int = 100) -> Dict[str, Any]:
        """
        测试服务商连接

        Args:
            prompt: 测试提示词
            max_tokens: 最大生成token数

        Returns:
            Dict: 测试结果，包含success, message, response, latency
        """
        start_time = time.time()
        try:
            # 创建临时LLM实例，使用测试参数
            test_llm = LLMFactory.create_llm(
                self.provider,
                temperature=0.1,
                max_tokens=max_tokens
            )

            messages = [HumanMessage(content=prompt)]
            response = await test_llm.ainvoke(messages)
            latency = time.time() - start_time

            return {
                "success": True,
                "message": "连接测试成功",
                "response": response.content,
                "latency": round(latency, 3)
            }
        except Exception as e:
            latency = time.time() - start_time
            return {
                "success": False,
                "message": f"连接测试失败: {str(e)}",
                "response": None,
                "latency": round(latency, 3)
            }


async def get_default_llm_service(db_session) -> Optional[LLMService]:
    """获取默认LLM服务实例"""
    from app.crud import llm_provider

    default_provider = await llm_provider.get_default(db_session)
    if not default_provider:
        # 如果没有默认服务商，尝试使用配置文件中的OpenAI配置
        if settings.OPENAI_API_KEY:
            from app.models.llm_provider import LLMProvider
            fallback_provider = LLMProvider(
                name="Fallback OpenAI",
                type="openai",
                api_key=settings.OPENAI_API_KEY,
                base_url=None,
                model_name=settings.OPENAI_MODEL,
                is_default=True
            )
            return LLMService(fallback_provider)
        return None

    return LLMService(default_provider)
