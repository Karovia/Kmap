#!/usr/bin/env python3
"""本地推理功能测试脚本"""

import asyncio
import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings
from app.core.local_inference import local_inference
from app.core.local_document_parser import local_parser
from app.core.local_graph import local_graph


def test_local_parser():
    """测试本地文档解析"""
    print("\n=== 测试本地文档解析 ===")

    # 创建测试TXT文件
    test_file = "test_local.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("这是一个测试文档。\n\n")
        f.write("Kmap是一个知识图谱构建和管理工具。\n\n")
        f.write("它支持本地文档处理和云端处理两种模式。\n")

    try:
        elements = local_parser.parse(test_file)
        print(f"解析成功，共 {len(elements)} 个元素")
        for i, elem in enumerate(elements):
            print(f"元素 {i+1}: {elem['content'][:50]}... (页码: {elem['page_number']})")

        # 测试支持的格式
        supported_formats = local_parser.get_supported_formats()
        print(f"\n支持的文件格式: {supported_formats}")

        return True
    except Exception as e:
        print(f"解析失败: {str(e)}")
        return False
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)


def test_local_graph():
    """测试本地图数据库"""
    print("\n=== 测试本地图数据库 ===")

    try:
        # 初始化图数据库
        test_db_path = "./test_graphdb"
        local_graph.initialize(db_path=test_db_path, db_type="litegraph")
        print("图数据库初始化成功")

        # 创建节点
        node1 = local_graph.db.create_node("概念", {"name": "Kmap", "description": "知识图谱工具"})
        node2 = local_graph.db.create_node("功能", {"name": "本地处理", "description": "支持本地文档处理"})
        print(f"创建节点成功: {node1.id}, {node2.id}")

        # 创建关系
        rel = local_graph.db.create_relationship(node1.id, node2.id, "包含功能", {"version": "1.0"})
        print(f"创建关系成功: {rel.id}")

        # 查询节点
        nodes = local_graph.db.find_nodes_by_label("概念")
        print(f"查询'概念'标签节点: {len(nodes)} 个")

        # 查询关系
        rels = local_graph.db.find_relationships(start_node_id=node1.id)
        print(f"查询节点1的关系: {len(rels)} 个")

        # 更新节点
        updated_node = local_graph.db.update_node_properties(node1.id, {"version": "0.1.0"})
        print(f"更新节点属性成功: {updated_node.properties}")

        return True
    except Exception as e:
        print(f"图数据库测试失败: {str(e)}", exc_info=True)
        return False
    finally:
        # 清理测试数据
        import shutil
        if os.path.exists("./test_graphdb"):
            shutil.rmtree("./test_graphdb")


async def test_local_inference():
    """测试本地推理"""
    print("\n=== 测试本地推理 ===")

    if not settings.LOCAL_INFERENCE_ENABLED:
        print("本地推理未启用，跳过测试")
        return True

    try:
        # 初始化本地推理（如果模型存在的话）
        try:
            local_inference.initialize(
                llm_model_path=settings.LOCAL_LLM_MODEL_PATH,
                llm_tokenizer_path=settings.LOCAL_LLM_TOKENIZER_PATH,
                embedding_model_path=settings.LOCAL_EMBEDDING_MODEL_PATH,
                embedding_tokenizer_path=settings.LOCAL_EMBEDDING_TOKENIZER_PATH,
                use_gpu=settings.LOCAL_USE_GPU
            )
            print("本地推理初始化成功")
        except FileNotFoundError as e:
            print(f"模型文件不存在，跳过实际推理测试: {str(e)}")
            return True

        # 测试Embedding
        texts = ["你好，世界", "Kmap是一个知识图谱工具"]
        embeddings = local_inference.embedding.embed_documents(texts)
        print(f"Embedding生成成功，维度: {len(embeddings[0])}")

        # 测试相似度
        import numpy as np
        similarity = np.dot(embeddings[0], embeddings[1])
        print(f"两个文本的余弦相似度: {similarity:.4f}")

        # 测试LLM生成
        prompt = "请介绍一下知识图谱的用途，用简短的话回答："
        response = local_inference.llm.generate(prompt, max_new_tokens=100)
        print(f"LLM生成成功: {response}")

        return True
    except Exception as e:
        print(f"本地推理测试失败: {str(e)}", exc_info=True)
        return False


async def main():
    """主测试函数"""
    print("开始本地功能测试...")

    results = []

    # 测试文档解析
    results.append(("本地文档解析", test_local_parser()))

    # 测试图数据库
    results.append(("本地图数据库", test_local_graph()))

    # 测试本地推理
    results.append(("本地推理", await test_local_inference()))

    print("\n=== 测试结果汇总 ===")
    all_passed = True
    for test_name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False

    if all_passed:
        print("\n🎉 所有测试通过！")
        return 0
    else:
        print("\n❌ 部分测试失败，请检查问题。")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
