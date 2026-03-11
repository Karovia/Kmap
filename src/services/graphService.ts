import { requestJson } from './httpClient';

export interface GraphNode {
  id: string;
  label: string;
  type: 'root' | 'status' | 'provider' | 'document';
  size: number;
  description?: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphSummary {
  documents_total: number;
  indexed_documents: number;
  providers_total: number;
  default_chat_provider?: string | null;
  default_embedding_provider?: string | null;
}

export interface GraphOverview {
  summary: GraphSummary;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const graphService = {
  async getGraphOverview(): Promise<GraphOverview> {
    return requestJson<GraphOverview>('/api/v1/graph/overview', undefined, '获取图谱概览失败');
  },
};
