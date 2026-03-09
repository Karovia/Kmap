#!/usr/bin/env python3
"""测试火山引擎 Embedding API"""
import asyncio
import os

from langchain_openai import OpenAIEmbeddings


async def test_volcengine_embedding():
    """测试火山引擎 embedding"""

    # 配置参数 - 请在这里填入你的真实 API Key
    api_key = os.environ.get("ARK_API_KEY", "")

    if not api_key:
        print("请设置环境变量 ARK_API_KEY 或在代码中填入 API Key")
        return

    base_url = "https://ark.cn-beijing.volces.com/api/v3"
    # 请替换为你在火山引擎控制台创建的 endpoint ID
    model_name = "ep-20241227xxxxx-xxxxx"  # 替换为你的实际 endpoint ID

    print("=== Test Volcengine Embedding API ===")
    print(f"Base URL: {base_url}")
    print(f"Model: {model_name}")
    print(f"API Key: {api_key[:10]}..." if len(api_key) > 10 else "Not set")

    try:
        # 创建 OpenAIEmbeddings 实例
        embeddings = OpenAIEmbeddings(
            api_key=api_key,
            base_url=base_url,
            model=model_name
        )

        # 测试文本
        test_text = "这是一个测试文本"

        print(f"\nTesting text: {test_text}")

        # 调用 embed_query
        vector = embeddings.embed_query(test_text)

        print(f"Success! Vector dimension: {len(vector)}")
        print(f"First 10 dimensions: {vector[:10]}")

    except Exception as e:
        print(f"Failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_volcengine_embedding())
