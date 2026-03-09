#!/usr/bin/env python3
"""直接测试火山引擎 API"""
import httpx

api_key = "db1a74a5-0068-42da-9a54-b1ea94330e9f"
url = "https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal"
model = "ep-20260309221615-mfzdl"

print("Testing Volcengine API...")
print(f"URL: {url}")
print(f"Model: {model}")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "model": model,
    "input": [{"type": "text", "text": "测试文本"}]
}

try:
    with httpx.Client(timeout=30.0) as client:
        response = client.post(url, json=data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            result = response.json()
            vector = result["data"][0]["embedding"]
            print(f"Success! Vector dimension: {len(vector)}")
        else:
            print("Failed!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
