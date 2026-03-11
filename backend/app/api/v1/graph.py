from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.document import Document
from app.schemas.graph import GraphEdge, GraphNode, GraphResponse, GraphSummary

router = APIRouter()


@router.get("/overview", response_model=GraphResponse, summary="获取图谱概览数据")
async def get_graph_overview(db: AsyncSession = Depends(get_db_session)):
    from app.crud.document import crud_document
    from app.crud.llm_provider import llm_provider

    documents = await crud_document.get_multi(db, skip=0, limit=8)
    documents_total = await crud_document.count(db)
    providers = await llm_provider.get_multi(db, skip=0, limit=20)
    default_chat_provider = await llm_provider.get_default(db, provider_scope="chat")
    default_embedding_provider = await llm_provider.get_default(db, provider_scope="embedding")

    indexed_result = await db.execute(select(Document).where(Document.status == "indexed"))
    indexed_documents = len(indexed_result.scalars().all())

    status_counter = Counter(document.status for document in documents)

    nodes = [
        GraphNode(
            id="root-kmap",
            label="Kmap",
            type="root",
            size=36,
            description="当前知识库全局视图",
            metadata={
                "documents_total": documents_total,
                "providers_total": len(providers),
            },
        )
    ]
    edges: list[GraphEdge] = []

    for status_name, count in status_counter.items():
        status_node_id = f"status-{status_name}"
        nodes.append(
            GraphNode(
                id=status_node_id,
                label=status_name,
                type="status",
                size=max(16, 12 + count * 2),
                description=f"当前共有 {count} 个文档处于 {status_name} 状态",
                metadata={"count": count},
            )
        )
        edges.append(GraphEdge(source="root-kmap", target=status_node_id, label="状态分组"))

    for provider in providers:
        provider_node_id = f"provider-{provider.id}"
        scope_label = "对话" if provider.provider_scope == "chat" else "Embedding"
        description = f"{scope_label}服务商 · {provider.type} · {provider.model_name}"
        nodes.append(
            GraphNode(
                id=provider_node_id,
                label=provider.name,
                type="provider",
                size=20 if provider.is_default else 16,
                description=description,
                metadata={
                    "scope": provider.provider_scope,
                    "provider_type": provider.type,
                    "model_name": provider.model_name,
                    "is_default": provider.is_default,
                },
            )
        )
        edges.append(
            GraphEdge(
                source="root-kmap",
                target=provider_node_id,
                label="默认服务商" if provider.is_default else "可用服务商",
            )
        )

    for document in documents:
        document_node_id = f"document-{document.id}"
        status_node_id = f"status-{document.status}"
        nodes.append(
            GraphNode(
                id=document_node_id,
                label=document.name,
                type="document",
                size=14,
                description=f"{document.file_type.upper()} · {document.status}",
                metadata={
                    "status": document.status,
                    "file_type": document.file_type,
                    "file_size": document.file_size,
                },
            )
        )
        edges.append(GraphEdge(source=status_node_id, target=document_node_id, label="包含文档"))

    return GraphResponse(
        summary=GraphSummary(
            documents_total=documents_total,
            indexed_documents=indexed_documents,
            providers_total=len(providers),
            default_chat_provider=default_chat_provider.name if default_chat_provider else None,
            default_embedding_provider=default_embedding_provider.name if default_embedding_provider else None,
        ),
        nodes=nodes,
        edges=edges,
    )
