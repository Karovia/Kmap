export type ProviderType = 'openai' | 'gemini' | 'claude' | 'custom';
export type ProviderScope = 'chat' | 'embedding';

export interface LLMProvider {
  id: string;
  name: string;
  type: ProviderType;
  providerScope: ProviderScope;
  apiKey: string;
  baseUrl: string;
  model: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentStatus = 'pending' | 'splitting' | 'embedding' | 'indexed' | 'error';

export interface Document {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
  status: DocumentStatus;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'md';
  error_message?: string;
  chunks_count?: number;
  progress?: number;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  detail: string;
  type: 'file' | 'link';
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export type ModelType = 'llm' | 'embedding';
export type DownloadStatus = 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface ModelInfo {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  author: string;
  version: string;
  size: number; // 文件大小，字节
  requiredSpace: number; // 所需存储空间，字节
  parameters: string; // 参数大小，如 "7B", "14B"
  quantization: string; // 量化精度，如 "4-bit", "8-bit"
  format: string; // 模型格式，如 "gguf"
  downloadUrl: string;
  sha256?: string;
  releaseDate?: string;
  tags: string[];
}

export interface LocalModel {
  id: string;
  modelId: string;
  name: string;
  type: ModelType;
  size: number;
  path: string;
  downloadedAt: string;
  isDefault: boolean;
  parameters: string;
  quantization: string;
  format: string;
  lastUsedAt?: string;
}

export interface DownloadTask {
  taskId: string;
  modelId: string;
  modelName: string;
  status: DownloadStatus;
  progress: number; // 0-100
  downloadedSize: number;
  totalSize: number;
  speed: number; // 下载速度，字节/秒
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
