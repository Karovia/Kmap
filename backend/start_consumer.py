#!/usr/bin/env python3
"""启动文档处理消费者"""
import asyncio
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

from app.worker.document_processor import start_document_consumer


async def main():
    """主函数"""
    print("启动文档处理消费者服务...")
    print("按 Ctrl+C 停止服务")
    await start_document_consumer()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n消费者服务已停止")
