#!/usr/bin/env python3
"""测试LLM服务商API接口"""
import asyncio
import httpx
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/v1"


async def test_providers_api():
    """测试所有服务商API接口"""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30) as client:
        print("=== 开始测试LLM服务商API ===")

        # 1. 测试创建服务商
        print("\n1. 测试创建服务商:")
        provider_data = {
            "name": "测试OpenAI",
            "type": "openai",
            "api_key": "sk-test-123456789",
            "base_url": "https://api.openai.com/v1",
            "model_name": "gpt-3.5-turbo",
            "is_default": True
        }
        response = await client.post("/providers", json=provider_data)
        if response.status_code == 201:
            created_provider = response.json()
            provider_id = created_provider["id"]
            print(f"✅ 创建成功，服务商ID: {provider_id}")
            print(f"   服务商信息: {created_provider}")
        else:
            print(f"❌ 创建失败，状态码: {response.status_code}, 错误: {response.text}")
            return

        # 2. 测试获取所有服务商
        print("\n2. 测试获取所有服务商:")
        response = await client.get("/providers")
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ 获取成功，共 {len(providers)} 个服务商")
            for p in providers:
                print(f"   - ID: {p['id']}, 名称: {p['name']}, 类型: {p['type']}, 默认: {p['is_default']}")
        else:
            print(f"❌ 获取失败，状态码: {response.status_code}, 错误: {response.text}")

        # 3. 测试获取单个服务商
        print("\n3. 测试获取单个服务商:")
        response = await client.get(f"/providers/{provider_id}")
        if response.status_code == 200:
            provider = response.json()
            print(f"✅ 获取成功，服务商名称: {provider['name']}")
        else:
            print(f"❌ 获取失败，状态码: {response.status_code}, 错误: {response.text}")

        # 4. 测试更新服务商
        print("\n4. 测试更新服务商:")
        update_data = {
            "model_name": "gpt-4",
            "is_default": False
        }
        response = await client.put(f"/providers/{provider_id}", json=update_data)
        if response.status_code == 200:
            updated_provider = response.json()
            print(f"✅ 更新成功")
            print(f"   新模型名称: {updated_provider['model_name']}")
            print(f"   是否默认: {updated_provider['is_default']}")
        else:
            print(f"❌ 更新失败，状态码: {response.status_code}, 错误: {response.text}")

        # 5. 测试创建第二个服务商
        print("\n5. 测试创建第二个服务商（Claude）:")
        provider_data2 = {
            "name": "测试Claude",
            "type": "claude",
            "api_key": "sk-ant-test-123456789",
            "base_url": "https://api.anthropic.com",
            "model_name": "claude-3-sonnet-20240229",
            "is_default": True
        }
        response = await client.post("/providers", json=provider_data2)
        if response.status_code == 201:
            created_provider2 = response.json()
            provider_id2 = created_provider2["id"]
            print(f"✅ 创建成功，服务商ID: {provider_id2}")
        else:
            print(f"❌ 创建失败，状态码: {response.status_code}, 错误: {response.text}")

        # 6. 测试测试连接接口（会失败，因为使用的是测试密钥）
        print("\n6. 测试服务商连接测试接口:")
        test_data = {
            "prompt": "Hello, this is a test.",
            "max_tokens": 50
        }
        response = await client.post(f"/providers/{provider_id}/test", json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 测试接口调用成功")
            print(f"   测试结果: {'成功' if result['success'] else '失败'}")
            print(f"   消息: {result['message']}")
            print(f"   耗时: {result['latency']}s")
        else:
            print(f"❌ 测试接口调用失败，状态码: {response.status_code}, 错误: {response.text}")

        # 7. 测试删除服务商
        print("\n7. 测试删除服务商:")
        # 删除第一个
        response = await client.delete(f"/providers/{provider_id}")
        if response.status_code == 204:
            print(f"✅ 删除服务商 {provider_id} 成功")
        else:
            print(f"❌ 删除服务商 {provider_id} 失败，状态码: {response.status_code}, 错误: {response.text}")

        # 删除第二个
        response = await client.delete(f"/providers/{provider_id2}")
        if response.status_code == 204:
            print(f"✅ 删除服务商 {provider_id2} 成功")
        else:
            print(f"❌ 删除服务商 {provider_id2} 失败，状态码: {response.status_code}, 错误: {response.text}")

        # 8. 验证删除后列表为空
        print("\n8. 验证删除后服务商列表:")
        response = await client.get("/providers")
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ 获取成功，剩余 {len(providers)} 个服务商")
        else:
            print(f"❌ 获取失败，状态码: {response.status_code}, 错误: {response.text}")

        print("\n=== 测试完成 ===")


if __name__ == "__main__":
    asyncio.run(test_providers_api())
