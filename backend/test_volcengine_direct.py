#!/usr/bin/env python3
"""直接测试 VolcengineEmbeddings 类"""
import sys
sys.path.insert(0, "D:/Kmap/backend")

from app.core.llm import VolcengineEmbeddings

# 配置
api_key = "db1a74a5-0068-42da-9a54-b1ea94330e9f"
base_url = "https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal"
model = "ep-20260309221615-mfzdl"

print("Testing VolcengineEmbeddings...")
print(f"API Key: {api_key[:10]}...")
print(f"Base URL: {base_url}")
print(f"Model: {model}")

try:
    embeddings = VolcengineEmbeddings(api_key=api_key, base_url=base_url, model=model)
    vector = embeddings.embed_query("测试文本")
    print(f"Success! Vector dimension: {len(vector)}")
    print(f"First 5 values: {vector[:5]}")
except Exception as e:
    print(f"Failed: {e}")
    import traceback
    traceback.print_exc()
