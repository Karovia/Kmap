from nebula3.gclient.net import ConnectionPool
from nebula3.Config import Config
from typing import Optional

from app.core.config import settings

nebula_pool: Optional[ConnectionPool] = None


def get_nebula_client():
    """获取Nebula Graph客户端"""
    global nebula_pool
    if nebula_pool is None:
        config = Config()
        config.max_connection_pool_size = 10
        config.timeout = settings.NEBULA_GRAPH_TIMEOUT

        nebula_pool = ConnectionPool()
        nebula_pool.init(
            [(settings.NEBULA_GRAPH_HOST, settings.NEBULA_GRAPH_PORT)],
            config
        )

    session = nebula_pool.get_session(
        settings.NEBULA_GRAPH_USER,
        settings.NEBULA_GRAPH_PASSWORD
    )

    if session:
        session.execute(f"USE {settings.NEBULA_GRAPH_SPACE}")

    return session


def close_nebula_connection():
    """关闭Nebula Graph连接池"""
    global nebula_pool
    if nebula_pool:
        nebula_pool.close()
        nebula_pool = None
