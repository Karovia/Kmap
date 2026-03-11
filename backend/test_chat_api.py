#!/usr/bin/env python3
import httpx

url = "http://localhost:8000/api/v1/providers/5/test"
data = {"prompt": "你好", "max_tokens": 100}

try:
    response = httpx.post(url, json=data, timeout=30.0)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
