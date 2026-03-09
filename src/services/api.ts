import type { Document, LLMProvider, ProviderScope, ProviderType } from '../types/domain';

interface BackendProvider {
  id: number;
  name: string;
  type: ProviderType;
  provider_scope: ProviderScope;
  api_key: string;
  base_url?: string | null;
  model_name: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendDocument {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
  status: Document['status'];
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  chunks?: Array<unknown>;
}

interface BackendDocumentListResponse {
  total: number;
  items: BackendDocument[];
}

interface BackendDocumentUploadResponse {
  success: boolean;
  message: string;
  document: BackendDocument;
}

function inferDocumentType(fileType: string): Document['type'] {
  if (fileType === 'doc') return 'docx';
  if (fileType === 'txt') return 'txt';
  if (fileType === 'md') return 'md';
  if (fileType === 'csv') return 'csv';
  if (fileType === 'pdf') return 'pdf';
  return 'txt';
}

function normalizeDocument(document: BackendDocument): Document {
  return {
    id: String(document.id),
    name: document.name,
    size: document.file_size,
    uploaded_at: document.created_at,
    status: document.status,
    type: inferDocumentType(document.file_type),
    error_message: document.error_message ?? undefined,
    chunks_count: document.chunks?.length,
  };
}

function normalizeProvider(provider: BackendProvider): LLMProvider {
  return {
    id: String(provider.id),
    name: provider.name,
    type: provider.type,
    providerScope: provider.provider_scope,
    apiKey: provider.api_key,
    baseUrl: provider.base_url ?? '',
    model: provider.model_name,
    isDefault: provider.is_default,
    createdAt: provider.created_at,
    updatedAt: provider.updated_at,
  };
}

async function parseJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    throw new Error(fallbackMessage);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('接口返回了非 JSON 内容，请检查前端代理或后端服务是否正常');
  }

  return res.json() as Promise<T>;
}

export const api = {
  async getProviders(providerScope?: ProviderScope): Promise<LLMProvider[]> {
    const params = providerScope ? `?provider_scope=${providerScope}` : '';
    const res = await fetch(`/api/v1/providers${params}`);
    const data = await parseJsonResponse<BackendProvider[]>(res, '获取服务商列表失败');
    return data.map(normalizeProvider);
  },

  async createProvider(provider: Omit<LLMProvider, 'id'>): Promise<LLMProvider> {
    const payload = {
      name: provider.name,
      type: provider.type,
      provider_scope: provider.providerScope,
      api_key: provider.apiKey,
      base_url: provider.baseUrl || null,
      model_name: provider.model,
      is_default: provider.isDefault,
    };

    const res = await fetch('/api/v1/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse<BackendProvider>(res, '创建服务商失败');
    return normalizeProvider(data);
  },

  async updateProvider(id: string, provider: Partial<LLMProvider>): Promise<LLMProvider> {
    const payload = {
      ...(provider.name !== undefined ? { name: provider.name } : {}),
      ...(provider.type !== undefined ? { type: provider.type } : {}),
      ...(provider.providerScope !== undefined ? { provider_scope: provider.providerScope } : {}),
      ...(provider.apiKey !== undefined ? { api_key: provider.apiKey } : {}),
      ...(provider.baseUrl !== undefined ? { base_url: provider.baseUrl || null } : {}),
      ...(provider.model !== undefined ? { model_name: provider.model } : {}),
      ...(provider.isDefault !== undefined ? { is_default: provider.isDefault } : {}),
    };

    const res = await fetch(`/api/v1/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse<BackendProvider>(res, '更新服务商失败');
    return normalizeProvider(data);
  },

  async deleteProvider(id: string): Promise<void> {
    const res = await fetch(`/api/v1/providers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除服务商失败');
  },

  async testProvider(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/v1/providers/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    return parseJsonResponse<{ success: boolean; message: string }>(res, '测试失败');
  },

  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    onProgress?.(0);

    const res = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await parseJsonResponse<BackendDocumentUploadResponse>(res, '上传失败');

    onProgress?.(100);

    return normalizeDocument(data.document);
  },

  async getDocuments(): Promise<Document[]> {
    const res = await fetch('/api/v1/documents');
    const data = await parseJsonResponse<BackendDocumentListResponse>(res, '获取文档列表失败');
    return data.items.map(normalizeDocument);
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除文档失败');
  },

  async getDocumentStatus(id: string): Promise<Document> {
    const res = await fetch(`/api/v1/documents/${id}/status`);
    const data = await parseJsonResponse<BackendDocument>(res, '获取文档状态失败');
    return normalizeDocument(data);
  },
};
