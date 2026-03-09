from typing import Optional

import aio_pika

from app.core.config import settings

rabbitmq_connection: Optional[aio_pika.Connection] = None


async def get_rabbitmq_connection() -> aio_pika.Connection:
    """获取RabbitMQ连接"""
    global rabbitmq_connection
    if rabbitmq_connection is None or rabbitmq_connection.is_closed:
        rabbitmq_connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    return rabbitmq_connection


async def get_rabbitmq_channel() -> aio_pika.Channel:
    """获取RabbitMQ通道"""
    connection = await get_rabbitmq_connection()
    channel = await connection.channel()
    await channel.declare_exchange(settings.RABBITMQ_EXCHANGE, aio_pika.ExchangeType.DIRECT, durable=True)
    return channel


async def close_rabbitmq_connection():
    """关闭RabbitMQ连接"""
    global rabbitmq_connection
    if rabbitmq_connection and not rabbitmq_connection.is_closed:
        await rabbitmq_connection.close()
        rabbitmq_connection = None
