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
