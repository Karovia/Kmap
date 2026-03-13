import { requestJson } from './httpClient';
import type { ModelInfo, LocalModel, DownloadTask } from '../types/domain';

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface LocalModelsResponse {
  models: LocalModel[];
  storage: {
    total: number;
    used: number;
    modelsUsed: number;
    available: number;
  };
}

export interface DownloadRequest {
  modelId: string;
}

export interface DownloadResponse {
  taskId: string;
}

export interface SwitchDefaultModelRequest {
  modelId: string;
  type: 'llm' | 'embedding';
}

export interface DeleteModelRequest {
  modelId: string;
}

export const modelsApi = {
  /**
   * 获取可下载模型列表
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    const response = await requestJson<ModelsResponse>(
      '/api/v1/system/models',
      { method: 'GET' },
      '获取模型列表失败'
    );
    return response.models;
  },

  /**
   * 获取已下载模型列表和存储信息
   */
  async getLocalModels(): Promise<LocalModelsResponse> {
    return requestJson<LocalModelsResponse>(
      '/api/v1/system/local-models',
      { method: 'GET' },
      '获取本地模型列表失败'
    );
  },

  /**
   * 触发模型下载
   */
  async downloadModel(modelId: string): Promise<string> {
    const response = await requestJson<DownloadResponse>(
      '/api/v1/system/models/download',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId } as DownloadRequest),
      },
      '触发下载失败'
    );
    return response.taskId;
  },

  /**
   * 切换默认模型
   */
  async switchDefaultModel(modelId: string, type: 'llm' | 'embedding'): Promise<void> {
    await requestJson(
      '/api/v1/system/models/switch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId, type } as SwitchDefaultModelRequest),
      },
      '切换默认模型失败'
    );
  },

  /**
   * 删除本地模型
   */
  async deleteModel(modelId: string): Promise<void> {
    await requestJson(
      '/api/v1/system/models',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId } as DeleteModelRequest),
      },
      '删除模型失败'
    );
  },

  /**
   * 暂停下载任务
   */
  async pauseDownload(taskId: string): Promise<void> {
    await requestJson(
      `/api/v1/system/models/download/${taskId}/pause`,
      { method: 'POST' },
      '暂停下载失败'
    );
  },

  /**
   * 恢复下载任务
   */
  async resumeDownload(taskId: string): Promise<void> {
    await requestJson(
      `/api/v1/system/models/download/${taskId}/resume`,
      { method: 'POST' },
      '恢复下载失败'
    );
  },

  /**
   * 取消下载任务
   */
  async cancelDownload(taskId: string): Promise<void> {
    await requestJson(
      `/api/v1/system/models/download/${taskId}/cancel`,
      { method: 'POST' },
      '取消下载失败'
    );
  },

  /**
   * 获取下载任务状态
   */
  async getDownloadTask(taskId: string): Promise<DownloadTask> {
    return requestJson<DownloadTask>(
      `/api/v1/system/models/download/${taskId}`,
      { method: 'GET' },
      '获取下载状态失败'
    );
  },

  /**
   * 获取所有下载任务
   */
  async getDownloadTasks(): Promise<DownloadTask[]> {
    const response = await requestJson<{ tasks: DownloadTask[] }>(
      '/api/v1/system/models/downloads',
      { method: 'GET' },
      '获取下载任务列表失败'
    );
    return response.tasks;
  },

  /**
   * 清理未使用的模型
   */
  async cleanupUnusedModels(): Promise<{ freedSpace: number; deletedCount: number }> {
    return requestJson<{ freedSpace: number; deletedCount: number }>(
      '/api/v1/system/models/cleanup',
      { method: 'POST' },
      '清理未使用模型失败'
    );
  },
};
