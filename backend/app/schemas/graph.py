from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


GraphNodeType = Literal["root", "status", "provider", "document"]


class GraphNode(BaseModel):
    id: str = Field(..., description="节点 ID")
    label: str = Field(..., description="节点名称")
    type: GraphNodeType = Field(..., description="节点类型")
    size: int = Field(..., ge=1, description="节点尺寸权重")
    description: Optional[str] = Field(None, description="节点描述")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="节点元数据")


class GraphEdge(BaseModel):
    source: str = Field(..., description="起始节点 ID")
    target: str = Field(..., description="目标节点 ID")
    label: Optional[str] = Field(None, description="边标签")


class GraphSummary(BaseModel):
    documents_total: int = Field(..., ge=0, description="文档总数")
    indexed_documents: int = Field(..., ge=0, description="已索引文档数")
    providers_total: int = Field(..., ge=0, description="服务商总数")
    default_chat_provider: Optional[str] = Field(None, description="默认对话服务商")
    default_embedding_provider: Optional[str] = Field(None, description="默认 Embedding 服务商")


class GraphResponse(BaseModel):
    summary: GraphSummary = Field(..., description="图谱摘要")
    nodes: List[GraphNode] = Field(..., description="节点列表")
    edges: List[GraphEdge] = Field(..., description="边列表")
