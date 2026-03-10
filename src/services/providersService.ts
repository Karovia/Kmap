import type { LLMProvider, ProviderScope, ProviderType } from '../types/domain';
import { parseJsonResponse, requestJson } from './httpClient';

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

export const providersService = {
  async getProviders(providerScope?: ProviderScope): Promise<LLMProvider[]> {
    const params = providerScope ? `?provider_scope=${providerScope}` : '';
    const data = await requestJson<BackendProvider[]>(
      `/api/v1/providers${params}`,
      undefined,
      '获取服务商列表失败'
    );
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

    const data = await requestJson<BackendProvider>(
      '/api/v1/providers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      '创建服务商失败'
    );

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

    const data = await requestJson<BackendProvider>(
      `/api/v1/providers/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      '更新服务商失败'
    );

    return normalizeProvider(data);
  },

  async deleteProvider(id: string): Promise<void> {
    const response = await fetch(`/api/v1/providers/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('删除服务商失败');
    }
  },

  async testProvider(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/v1/providers/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    return parseJsonResponse<{ success: boolean; message: string }>(response, '测试失败');
  },
};
