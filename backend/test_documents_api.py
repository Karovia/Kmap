#!/usr/bin/env python3
"""测试文档API接口"""
import asyncio
import os
import tempfile
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.document import Document, DocumentChunk
from app.models import Base
from app.db.session import engine


async def init_test_db():
    """初始化测试数据库"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def cleanup_test_db():
    """清理测试数据库"""
    # 注意：开发环境使用，生产环境不要执行
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)
    pass


async def test_document_apis():
    """测试文档相关API"""
    await init_test_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. 测试上传文档
        print("1. 测试文档上传接口...")
        # 创建一个临时测试文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write("""这是一个测试文档。
第一部分内容：人工智能（Artificial Intelligence，简称AI）是指由人制造出来的机器所表现出来的智能。通常人工智能是指通过普通计算机程序的手段实现的类人智能技术。

第二部分内容：机器学习是人工智能的一个分支，它让计算机系统能够从数据中自动学习和改进。深度学习是机器学习的一个子领域，基于人工神经网络结构，可以处理复杂的模式识别任务。

第三部分内容：自然语言处理是人工智能的重要应用方向，它使计算机能够理解和处理人类语言。常见的应用包括机器翻译、语音识别、文本分类、问答系统等。

第四部分内容：计算机视觉让计算机能够"看"和理解图像和视频内容，应用场景包括人脸识别、自动驾驶、医学影像分析等。

第五部分内容：大语言模型近年来取得了突破性进展，能够生成流畅自然的文本，完成各种复杂的语言任务，正在深刻改变人们的工作和生活方式。
""")
            temp_file_path = f.name

        try:
            with open(temp_file_path, 'rb') as f:
                response = await client.post(
                    f"{settings.API_V1_STR}/documents/upload",
                    files={"file": ("test_document.txt", f, "text/plain")}
                )

            assert response.status_code == 200, f"上传失败: {response.text}"
            result = response.json()
            assert result["success"] == True
            document_id = result["document"]["id"]
            print(f"✅ 文档上传成功，ID: {document_id}")
            print(f"   文档名称: {result['document']['name']}")
            print(f"   初始状态: {result['document']['status']}")

            # 2. 测试获取文档列表
            print("\n2. 测试获取文档列表接口...")
            response = await client.get(f"{settings.API_V1_STR}/documents")
            assert response.status_code == 200, f"获取列表失败: {response.text}"
            result = response.json()
            assert "total" in result
            assert "items" in result
            assert len(result["items"]) > 0
            print(f"✅ 获取文档列表成功，总数量: {result['total']}")

            # 3. 测试获取文档详情
            print("\n3. 测试获取文档详情接口...")
            response = await client.get(f"{settings.API_V1_STR}/documents/{document_id}")
            assert response.status_code == 200, f"获取详情失败: {response.text}"
            result = response.json()
            assert result["id"] == document_id
            print(f"✅ 获取文档详情成功")
            print(f"   文档名称: {result['name']}")
            print(f"   文档类型: {result['file_type']}")
            print(f"   文件大小: {result['file_size']} 字节")

            # 4. 测试获取文档状态
            print("\n4. 测试获取文档状态接口...")
            response = await client.get(f"{settings.API_V1_STR}/documents/{document_id}/status")
            assert response.status_code == 200, f"获取状态失败: {response.text}"
            result = response.json()
            assert result["id"] == document_id
            assert "status" in result
            print(f"✅ 获取文档状态成功")
            print(f"   当前状态: {result['status']}")
            print(f"   最后更新: {result['updated_at']}")

            # 注意：实际处理需要RabbitMQ消费者运行，这里只测试接口连通性
            print("\n⚠️  提示：文档的分片和向量化处理需要启动RabbitMQ消费者才能完成")
            print("   可以使用命令: python -m app.worker.document_processor 启动消费者")

            # 5. 测试删除文档（可选，注释掉以保留测试数据）
            # print("\n5. 测试删除文档接口...")
            # response = await client.delete(f"{settings.API_V1_STR}/documents/{document_id}")
            # assert response.status_code == 200, f"删除失败: {response.text}"
            # result = response.json()
            # assert result["success"] == True
            # print("✅ 文档删除成功")

            # # 验证文档已删除
            # response = await client.get(f"{settings.API_V1_STR}/documents/{document_id}")
            # assert response.status_code == 404, "文档应该已被删除"
            # print("✅ 验证删除成功")

        finally:
            # 清理临时文件
            os.unlink(temp_file_path)

    await cleanup_test_db()
    print("\n🎉 所有API接口测试通过！")


if __name__ == "__main__":
    asyncio.run(test_document_apis())
