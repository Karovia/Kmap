import { Bookmark, FileText, LoaderCircle, Menu, Network, RefreshCw, Search, Share2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import type { GraphEdge, GraphNode, GraphOverview } from '../services/graphService';

type PositionedNode = GraphNode & { x: number; y: number };

function getNodeColor(type: GraphNode['type']): string {
  switch (type) {
    case 'root':
      return 'rgb(23 84 207)';
    case 'status':
      return 'rgb(59 130 246)';
    case 'provider':
      return 'rgb(16 185 129)';
    case 'document':
      return 'rgb(148 163 184)';
    default:
      return 'rgb(148 163 184)';
  }
}

export function GraphPage() {
  const [graph, setGraph] = useState<GraphOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getGraphOverview();
        setGraph(data);
        setSelectedNodeId(data.nodes[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载图谱失败');
      } finally {
        setLoading(false);
      }
    };

    void loadGraph();
  }, []);

  const positionedNodes = useMemo<PositionedNode[]>(() => {
    if (!graph) return [];

    const rootNode = graph.nodes.find(node => node.type === 'root');
    const statusNodes = graph.nodes.filter(node => node.type === 'status');
    const providerNodes = graph.nodes.filter(node => node.type === 'provider');
    const documentNodes = graph.nodes.filter(node => node.type === 'document');
    const nodes: PositionedNode[] = [];

    if (rootNode) {
      nodes.push({ ...rootNode, x: 200, y: 250 });
    }

    statusNodes.forEach((node, index) => {
      const gap = 320 / Math.max(statusNodes.length, 1);
      nodes.push({
        ...node,
        x: 40 + gap * index,
        y: 110,
      });
    });

    providerNodes.forEach((node, index) => {
      nodes.push({
        ...node,
        x: 80 + (index % 2) * 240,
        y: 350 + Math.floor(index / 2) * 90,
      });
    });

    documentNodes.forEach((node, index) => {
      const gap = 320 / Math.max(documentNodes.length, 1);
      nodes.push({
        ...node,
        x: 40 + gap * index,
        y: 500,
      });
    });

    return nodes;
  }, [graph]);

  const nodePositionMap = useMemo(
    () =>
      positionedNodes.reduce<Record<string, PositionedNode>>((accumulator, node) => {
        accumulator[node.id] = node;
        return accumulator;
      }, {}),
    [positionedNodes]
  );

  const selectedNode = positionedNodes.find(node => node.id === selectedNodeId) ?? positionedNodes[0] ?? null;

  const renderEdge = (edge: GraphEdge, index: number) => {
    const source = nodePositionMap[edge.source];
    const target = nodePositionMap[edge.target];
    if (!source || !target) return null;

    return (
      <line
        key={`${edge.source}-${edge.target}-${index}`}
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        className="stroke-slate-300"
        strokeWidth="1.5"
        strokeDasharray={edge.label === '包含文档' ? '4 4' : undefined}
      />
    );
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-background-light/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Network className="size-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Kmap</h1>
        </div>
        <div className="flex gap-4">
          <button className="rounded-full p-2 transition-colors hover:bg-slate-200">
            <Search className="size-5" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-slate-200">
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex h-full items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="size-5 animate-spin" />
            正在加载图谱数据...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-600">
              {error}
            </div>
          </div>
        ) : !graph ? null : (
          <>
            <svg
              className="absolute inset-0 z-0 h-full w-full"
              viewBox="0 0 400 640"
              preserveAspectRatio="xMidYMid meet"
            >
              {graph.edges.map(renderEdge)}
              {positionedNodes.map(node => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={getNodeColor(node.type)}
                    fillOpacity={node.id === selectedNode?.id ? 0.22 : 0.14}
                    stroke={getNodeColor(node.type)}
                    strokeWidth={node.id === selectedNode?.id ? 3 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className="fill-slate-900 text-[11px] font-medium"
                  >
                    {node.label.length > 10 ? `${node.label.slice(0, 9)}…` : node.label}
                  </text>
                </g>
              ))}
            </svg>

            <div className="absolute left-6 top-6 flex flex-col gap-2">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                <p className="mb-2 text-xs text-slate-500">图谱摘要</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p>文档总数：{graph.summary.documents_total}</p>
                  <p>已索引：{graph.summary.indexed_documents}</p>
                  <p>服务商：{graph.summary.providers_total}</p>
                </div>
              </div>
            </div>

            {selectedNode ? (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-[100px] left-0 right-0 z-30 px-4"
              >
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                  <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-slate-300"></div>
                  <div className="px-6 pb-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {selectedNode.type === 'root'
                            ? '核心节点'
                            : selectedNode.type === 'status'
                              ? '状态节点'
                              : selectedNode.type === 'provider'
                                ? '服务商节点'
                                : '文档节点'}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedNode.label}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedNode.description || '暂无节点说明'}
                        </p>
                      </div>
                      <button className="text-slate-400 transition-colors hover:text-primary">
                        <Star className="size-5" />
                      </button>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs text-slate-400">节点类型</p>
                        <div className="flex items-center gap-2">
                          <Bookmark className="size-4 text-primary" />
                          <span className="font-semibold">{selectedNode.type}</span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs text-slate-400">关联强度</p>
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span className="font-semibold">{selectedNode.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h3 className="mb-2 text-sm font-semibold text-slate-900">节点元数据</h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        {Object.entries(selectedNode.metadata).length > 0 ? (
                          Object.entries(selectedNode.metadata).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                            >
                              <span className="text-slate-400">{key}</span>
                              <span className="max-w-[60%] truncate text-right text-slate-700">
                                {String(value)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p>暂无更多元数据</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-medium text-white">
                        <Share2 className="size-5" /> 分享路径
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700">
                        <RefreshCw className="size-5" /> 刷新图谱
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
