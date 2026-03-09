import asyncio
import json
import logging

import aio_pika

from app.core.config import settings
from app.crud.document import crud_document
from app.db.rabbitmq import get_rabbitmq_channel
from app.db.session import AsyncSessionLocal
from app.services.document_processor import DocumentProcessor

logger = logging.getLogger(__name__)

# 队列名称
DOCUMENT_PROCESSING_QUEUE = f"{settings.RABBITMQ_QUEUE_PREFIX}document_processing"


async def process_document_task(document_id: int, file_path: str) -> None:
    """
    发送文档处理任务到RabbitMQ队列
    :param document_id: 文档ID
    :param file_path: 文件路径
    """
    try:
        channel = await get_rabbitmq_channel()

        # 声明队列
        queue = await channel.declare_queue(
            DOCUMENT_PROCESSING_QUEUE,
            durable=True,
            arguments={"x-dead-letter-exchange": f"{settings.RABBITMQ_EXCHANGE}_dlx"},
        )

        # 绑定队列到交换机
        await queue.bind(settings.RABBITMQ_EXCHANGE, routing_key=DOCUMENT_PROCESSING_QUEUE)

        # 构建消息
        message = {"document_id": document_id, "file_path": file_path, "task_type": "document_processing"}

        # 发送消息
        await channel.default_exchange.publish(
            aio_pika.Message(body=json.dumps(message).encode(), delivery_mode=aio_pika.DeliveryMode.PERSISTENT),
            routing_key=DOCUMENT_PROCESSING_QUEUE,
        )

        logger.info(f"文档 {document_id} 处理任务已发送到队列")
    except Exception as e:
        logger.error(f"发送文档处理任务失败: {str(e)}")
        # 更新文档状态为错误
        async with AsyncSessionLocal() as db:
            await crud_document.update_status(
                db, document_id=document_id, status="error", error_message=f"任务队列发送失败: {str(e)}"
            )
        raise


async def process_document_message(message: aio_pika.IncomingMessage) -> None:
    """
    处理文档处理消息
    :param message: RabbitMQ消息
    """
    async with message.process():
        try:
            data = json.loads(message.body.decode())
            document_id = data["document_id"]
            file_path = data["file_path"]

            logger.info(f"开始处理文档 {document_id}，文件路径: {file_path}")

            # 更新文档状态为处理中
            async with AsyncSessionLocal() as db:
                await crud_document.update_status(db, document_id=document_id, status="splitting")

            # 处理文档
            processor = DocumentProcessor()
            await processor.process_document(document_id, file_path)

            logger.info(f"文档 {document_id} 处理完成")

        except Exception as e:
            logger.error(f"处理文档失败: {str(e)}", exc_info=True)
            # 更新文档状态为错误
            if "document_id" in locals():
                async with AsyncSessionLocal() as db:
                    await crud_document.update_status(
                        db, document_id=document_id, status="error", error_message=f"处理失败: {str(e)}"
                    )
            raise


async def start_document_consumer() -> None:
    """启动文档处理消费者"""
    try:
        channel = await get_rabbitmq_channel()

        # 声明队列
        queue = await channel.declare_queue(
            DOCUMENT_PROCESSING_QUEUE,
            durable=True,
            arguments={"x-dead-letter-exchange": f"{settings.RABBITMQ_EXCHANGE}_dlx"},
        )

        # 设置预取计数
        await channel.set_qos(prefetch_count=1)

        logger.info(f"文档处理消费者已启动，等待队列 {DOCUMENT_PROCESSING_QUEUE} 的消息...")

        # 开始消费消息
        await queue.consume(process_document_message)

    except Exception as e:
        logger.error(f"启动文档处理消费者失败: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    # 单独运行消费者
    asyncio.run(start_document_consumer())
