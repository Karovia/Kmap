#!/usr/bin/env python3
import httpx

url = "http://localhost:8000/api/v1/providers/2/test"
data = {"prompt": "测试", "max_tokens": 100}

response = httpx.post(url, json=data, timeout=30.0)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
