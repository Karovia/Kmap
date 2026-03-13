import os
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class Node:
    """图节点"""
    id: str
    label: str
    properties: Dict[str, Any]


@dataclass
class Relationship:
    """图关系"""
    id: str
    start_node_id: str
    end_node_id: str
    type: str
    properties: Dict[str, Any]


class LiteGraphDB:
    """轻量化本地图数据库实现，基于文件存储"""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.nodes_file = os.path.join(db_path, "nodes.json")
        self.relationships_file = os.path.join(db_path, "relationships.json")
        self.nodes: Dict[str, Node] = {}
        self.relationships: Dict[str, Relationship] = {}

        # 确保目录存在
        os.makedirs(db_path, exist_ok=True)

        # 加载现有数据
        self._load_data()

    def _load_data(self) -> None:
        """从文件加载数据"""
        try:
            if os.path.exists(self.nodes_file):
                with open(self.nodes_file, "r", encoding="utf-8") as f:
                    nodes_data = json.load(f)
                    for node_data in nodes_data:
                        node = Node(**node_data)
                        self.nodes[node.id] = node
                logger.info(f"加载了 {len(self.nodes)} 个节点")

            if os.path.exists(self.relationships_file):
                with open(self.relationships_file, "r", encoding="utf-8") as f:
                    rels_data = json.load(f)
                    for rel_data in rels_data:
                        rel = Relationship(**rel_data)
                        self.relationships[rel.id] = rel
                logger.info(f"加载了 {len(self.relationships)} 个关系")
        except Exception as e:
            logger.error(f"加载图数据库失败: {str(e)}", exc_info=True)
            # 初始化空数据库
            self.nodes = {}
            self.relationships = {}

    def _save_data(self) -> None:
        """保存数据到文件"""
        try:
            # 保存节点
            nodes_data = [
                {
                    "id": node.id,
                    "label": node.label,
                    "properties": node.properties
                }
                for node in self.nodes.values()
            ]
            with open(self.nodes_file, "w", encoding="utf-8") as f:
                json.dump(nodes_data, f, ensure_ascii=False, indent=2)

            # 保存关系
            rels_data = [
                {
                    "id": rel.id,
                    "start_node_id": rel.start_node_id,
                    "end_node_id": rel.end_node_id,
                    "type": rel.type,
                    "properties": rel.properties
                }
                for rel in self.relationships.values()
            ]
            with open(self.relationships_file, "w", encoding="utf-8") as f:
                json.dump(rels_data, f, ensure_ascii=False, indent=2)

            logger.debug(f"图数据库已保存，节点数: {len(self.nodes)}, 关系数: {len(self.relationships)}")
        except Exception as e:
            logger.error(f"保存图数据库失败: {str(e)}", exc_info=True)
            raise

    def create_node(self, label: str, properties: Dict[str, Any]) -> Node:
        """创建节点"""
        node_id = str(uuid4())
        node = Node(id=node_id, label=label, properties=properties)
        self.nodes[node_id] = node
        self._save_data()
        return node

    def create_relationship(self, start_node_id: str, end_node_id: str, rel_type: str,
                            properties: Optional[Dict[str, Any]] = None) -> Relationship:
        """创建关系"""
        if start_node_id not in self.nodes:
            raise ValueError(f"起始节点不存在: {start_node_id}")
        if end_node_id not in self.nodes:
            raise ValueError(f"目标节点不存在: {end_node_id}")

        rel_id = str(uuid4())
        rel = Relationship(
            id=rel_id,
            start_node_id=start_node_id,
            end_node_id=end_node_id,
            type=rel_type,
            properties=properties or {}
        )
        self.relationships[rel_id] = rel
        self._save_data()
        return rel

    def find_nodes_by_label(self, label: str) -> List[Node]:
        """按标签查找节点"""
        return [node for node in self.nodes.values() if node.label == label]

    def find_node_by_id(self, node_id: str) -> Optional[Node]:
        """按ID查找节点"""
        return self.nodes.get(node_id)

    def find_relationships(self, start_node_id: Optional[str] = None,
                           end_node_id: Optional[str] = None,
                           rel_type: Optional[str] = None) -> List[Relationship]:
        """查找关系"""
        results = list(self.relationships.values())

        if start_node_id is not None:
            results = [r for r in results if r.start_node_id == start_node_id]
        if end_node_id is not None:
            results = [r for r in results if r.end_node_id == end_node_id]
        if rel_type is not None:
            results = [r for r in results if r.type == rel_type]

        return results

    def query(self, cypher: str) -> List[Dict[str, Any]]:
        """简单的Cypher查询支持（仅支持基础查询）"""
        # TODO: 实现更完整的Cypher解析
        logger.warning("LiteGraphDB仅支持基础查询功能，复杂查询建议使用Neo4j")

        # 简单的MATCH查询解析
        if "MATCH" in cypher and "RETURN" in cypher:
            # 提取返回字段
            return_part = cypher.split("RETURN")[1].strip()
            return_fields = [f.strip() for f in return_part.split(",")]

            # 匹配节点
            if "(n)" in cypher:
                nodes = list(self.nodes.values())
                results = []
                for node in nodes:
                    result = {}
                    for field in return_fields:
                        if field == "n":
                            result["n"] = {
                                "id": node.id,
                                "label": node.label,
                                "properties": node.properties
                            }
                        elif field.startswith("n."):
                            prop_name = field[2:]
                            result[field] = node.properties.get(prop_name)
                    results.append(result)
                return results

        return []

    def delete_node(self, node_id: str, delete_relationships: bool = True) -> None:
        """删除节点"""
        if node_id not in self.nodes:
            raise ValueError(f"节点不存在: {node_id}")

        # 删除关联的关系
        if delete_relationships:
            rels_to_delete = [
                rel_id for rel_id, rel in self.relationships.items()
                if rel.start_node_id == node_id or rel.end_node_id == node_id
            ]
            for rel_id in rels_to_delete:
                del self.relationships[rel_id]

        del self.nodes[node_id]
        self._save_data()

    def delete_relationship(self, rel_id: str) -> None:
        """删除关系"""
        if rel_id not in self.relationships:
            raise ValueError(f"关系不存在: {rel_id}")
        del self.relationships[rel_id]
        self._save_data()

    def update_node_properties(self, node_id: str, properties: Dict[str, Any]) -> Node:
        """更新节点属性"""
        if node_id not in self.nodes:
            raise ValueError(f"节点不存在: {node_id}")

        node = self.nodes[node_id]
        node.properties.update(properties)
        self._save_data()
        return node

    def update_relationship_properties(self, rel_id: str, properties: Dict[str, Any]) -> Relationship:
        """更新关系属性"""
        if rel_id not in self.relationships:
            raise ValueError(f"关系不存在: {rel_id}")

        rel = self.relationships[rel_id]
        rel.properties.update(properties)
        self._save_data()
        return rel

    def close(self) -> None:
        """关闭数据库连接"""
        self._save_data()
        logger.info("LiteGraphDB已关闭")


class LocalGraphManager:
    """本地图数据库管理器"""

    _instance = None
    _db: Optional[LiteGraphDB] = None
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self, db_path: str, db_type: str = "litegraph") -> None:
        """初始化本地图数据库"""
        if self._initialized:
            return

        if db_type == "litegraph":
            self._db = LiteGraphDB(db_path)
        elif db_type == "neo4j-embedded":
            # TODO: 实现Neo4j嵌入式版本支持
            raise NotImplementedError("Neo4j嵌入式版本支持尚未实现")
        else:
            raise ValueError(f"不支持的图数据库类型: {db_type}")

        self._initialized = True
        logger.info(f"本地图数据库初始化完成，类型: {db_type}, 路径: {db_path}")

    @property
    def db(self) -> LiteGraphDB:
        """获取图数据库实例"""
        if not self._initialized or self._db is None:
            raise RuntimeError("本地图数据库未初始化，请先调用initialize()")
        return self._db

    def is_available(self) -> bool:
        """检查本地图数据库是否可用"""
        return self._initialized and self._db is not None


# 全局实例
local_graph = LocalGraphManager()
