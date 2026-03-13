import type { Document } from '../types/domain';
import { parseJsonResponse, requestJson, requestRaw } from './httpClient';

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

interface BackendDocumentStatusResponse {
  id: number;
  status: Document['status'];
  error_message?: string | null;
  updated_at?: string;
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

export const documentsService = {
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    onProgress?.(0);

    const response = await requestRaw('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await parseJsonResponse<BackendDocumentUploadResponse>(response, '上传失败');

    onProgress?.(100);

    return normalizeDocument(data.document);
  },

  async getDocuments(): Promise<Document[]> {
    const data = await requestJson<BackendDocumentListResponse>(
      '/api/v1/documents',
      undefined,
      '获取文档列表失败'
    );
    return data.items.map(normalizeDocument);
  },

  async deleteDocument(id: string): Promise<void> {
    const response = await requestRaw(`/api/v1/documents/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('删除文档失败');
    }
  },

  async getDocumentStatus(id: string): Promise<Document> {
    const data = await requestJson<BackendDocumentStatusResponse>(
      `/api/v1/documents/${id}/status`,
      undefined,
      '获取文档状态失败'
    );
    return {
      id: String(data.id),
      name: '',
      size: 0,
      uploaded_at: data.updated_at ?? '',
      status: data.status,
      type: 'txt',
      error_message: data.error_message ?? undefined,
    };
  },
};
