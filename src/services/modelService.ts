import { requestJson, requestRaw } from './httpClient';
import type { ModelInfo, LocalModel, DownloadTask } from '../types/domain';

/**
 * 获取可下载模型列表
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  return requestJson<ModelInfo[]>(
    '/api/v1/system/models',
    { method: 'GET' },
    '获取模型列表失败'
  );
}

/**
 * 获取已下载模型列表
 */
export async function getLocalModels(): Promise<LocalModel[]> {
  return requestJson<LocalModel[]>(
    '/api/v1/system/local-models',
    { method: 'GET' },
    '获取本地模型列表失败'
  );
}

/**
 * 触发模型下载
 */
export async function downloadModel(modelId: string): Promise<DownloadTask> {
  return requestJson<DownloadTask>(
    '/api/v1/system/models/download',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelId }),
    },
    '触发下载失败'
  );
}

/**
 * 暂停下载
 */
export async function pauseDownload(taskId: string): Promise<void> {
  await requestJson(
    '/api/v1/system/models/download/pause',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId }),
    },
    '暂停下载失败'
  );
}

/**
 * 恢复下载
 */
export async function resumeDownload(taskId: string): Promise<DownloadTask> {
  return requestJson<DownloadTask>(
    '/api/v1/system/models/download/resume',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId }),
    },
    '恢复下载失败'
  );
}

/**
 * 取消下载
 */
export async function cancelDownload(taskId: string): Promise<void> {
  await requestJson(
    '/api/v1/system/models/download/cancel',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId }),
    },
    '取消下载失败'
  );
}

/**
 * 获取下载任务列表
 */
export async function getDownloadTasks(): Promise<DownloadTask[]> {
  return requestJson<DownloadTask[]>(
    '/api/v1/system/models/download/tasks',
    { method: 'GET' },
    '获取下载任务失败'
  );
}

/**
 * 切换默认模型
 */
export async function switchDefaultModel(modelId: string, type: 'llm' | 'embedding'): Promise<LocalModel> {
  return requestJson<LocalModel>(
    '/api/v1/system/models/switch',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelId, type }),
    },
    '切换默认模型失败'
  );
}

/**
 * 删除本地模型
 */
export async function deleteLocalModel(modelId: string): Promise<void> {
  await requestJson(
    '/api/v1/system/models',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelId }),
    },
    '删除模型失败'
  );
}

/**
 * 获取存储信息
 */
export interface StorageInfo {
  total: number;
  used: number;
  available: number;
  modelsUsed: number;
}

export async function getStorageInfo(): Promise<StorageInfo> {
  return requestJson<StorageInfo>(
    '/api/v1/system/storage',
    { method: 'GET' },
    '获取存储信息失败'
  );
}

/**
 * 清理未使用的模型
 */
export async function cleanupUnusedModels(): Promise<{ freedSpace: number; deletedCount: number }> {
  return requestJson(
    '/api/v1/system/models/cleanup',
    { method: 'POST' },
    '清理未使用模型失败'
  );
}

/**
 * 检查存储权限
 */
export async function checkStoragePermission(): Promise<{ granted: boolean; shouldRequest: boolean }> {
  return requestJson(
    '/api/v1/system/permissions/storage',
    { method: 'GET' },
    '检查权限失败'
  );
}

/**
 * 请求存储权限
 */
export async function requestStoragePermission(): Promise<{ granted: boolean }> {
  return requestJson(
    '/api/v1/system/permissions/storage/request',
    { method: 'POST' },
    '请求权限失败'
  );
}
