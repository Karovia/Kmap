import { create } from 'zustand';
import { modelsApi } from '../services/modelsService';
import type { ModelInfo, LocalModel, DownloadTask, ModelType } from '../types/domain';
import { usePlatformStore } from './platformStore';
import { Capacitor } from '@capacitor/core';
import type { PermissionState } from '../platform/types';
import { platformBridge } from '../platform/bridge';

interface ModelStoreState {
  // 模型市场数据
  availableModels: ModelInfo[];
  modelsLoading: boolean;
  modelsError: string | null;

  // 本地模型数据
  localModels: LocalModel[];
  localModelsLoading: boolean;
  localModelsError: string | null;

  // 存储信息
  storageInfo: {
    total: number;
    used: number;
    modelsUsed: number;
    available: number;
  } | null;

  // 下载任务
  downloadTasks: DownloadTask[];
  downloadTasksLoading: boolean;

  // UI状态
  activeTab: 'market' | 'local';
  filterType: ModelType | 'all';

  // 操作状态
  downloading: boolean;
  switchingModel: boolean;
  deletingModel: boolean;
  cleaningUp: boolean;

  // 轮询控制
  pollInterval: number | null;
}

interface ModelStoreActions {
  // 基础操作
  fetchAvailableModels: () => Promise<void>;
  fetchLocalModels: () => Promise<void>;
  fetchDownloadTasks: () => Promise<void>;

  // 下载管理
  startDownload: (modelId: string) => Promise<string | null>;
  pauseDownload: (taskId: string) => Promise<void>;
  resumeDownload: (taskId: string) => Promise<void>;
  cancelDownload: (taskId: string) => Promise<void>;

  // 模型管理
  switchDefaultModel: (modelId: string, type: ModelType) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  cleanupUnusedModels: () => Promise<{ freedSpace: number; deletedCount: number } | null>;

  // 权限检查
  checkStoragePermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;

  // UI控制
  setActiveTab: (tab: 'market' | 'local') => void;
  setFilterType: (type: ModelType | 'all') => void;

  // 轮询管理
  startPolling: (interval?: number) => void;
  stopPolling: () => void;

  // 错误处理
  clearErrors: () => void;
}

export type ModelStore = ModelStoreState & ModelStoreActions;

const initialState: ModelStoreState = {
  availableModels: [],
  modelsLoading: false,
  modelsError: null,

  localModels: [],
  localModelsLoading: false,
  localModelsError: null,

  storageInfo: null,

  downloadTasks: [],
  downloadTasksLoading: false,

  activeTab: 'market',
  filterType: 'all',

  downloading: false,
  switchingModel: false,
  deletingModel: false,
  cleaningUp: false,

  pollInterval: null,
};

export const useModelStore = create<ModelStore>((set, get) => ({
  ...initialState,

  fetchAvailableModels: async () => {
    set({ modelsLoading: true, modelsError: null });
    try {
      const models = await modelsApi.getAvailableModels();
      set({ availableModels: models });
    } catch (err) {
      set({ modelsError: err instanceof Error ? err.message : '获取模型列表失败' });
    } finally {
      set({ modelsLoading: false });
    }
  },

  fetchLocalModels: async () => {
    set({ localModelsLoading: true, localModelsError: null });
    try {
      const response = await modelsApi.getLocalModels();
      set({
        localModels: response.models,
        storageInfo: response.storage,
      });
    } catch (err) {
      set({ localModelsError: err instanceof Error ? err.message : '获取本地模型失败' });
    } finally {
      set({ localModelsLoading: false });
    }
  },

  fetchDownloadTasks: async () => {
    set({ downloadTasksLoading: true });
    try {
      const tasks = await modelsApi.getDownloadTasks();
      set({ downloadTasks: tasks });
    } catch (err) {
      console.error('Failed to fetch download tasks:', err);
    } finally {
      set({ downloadTasksLoading: false });
    }
  },

  startDownload: async (modelId: string) => {
    let hasPermission = await get().checkStoragePermission();

    // 如果权限未授予，尝试请求权限
    if (!hasPermission) {
      hasPermission = await get().requestStoragePermission();
      if (!hasPermission) {
        set({ modelsError: '需要存储权限才能下载模型，请在系统设置中开启存储权限' });
        return null;
      }
    }

    // 检查存储空间是否足够
    const model = get().availableModels.find(m => m.id === modelId);
    if (model && get().storageInfo) {
      if (model.requiredSpace > get().storageInfo.available) {
        set({ modelsError: '存储空间不足，请清理后重试' });
        return null;
      }
    }

    set({ downloading: true });
    try {
      const taskId = await modelsApi.downloadModel(modelId);
      await get().fetchDownloadTasks();

      // 自动开始轮询如果还没开始
      if (!get().pollInterval) {
        get().startPolling();
      }

      return taskId;
    } catch (err) {
      set({ modelsError: err instanceof Error ? err.message : '下载失败' });
      return null;
    } finally {
      set({ downloading: false });
    }
  },

  pauseDownload: async (taskId: string) => {
    try {
      await modelsApi.pauseDownload(taskId);
      await get().fetchDownloadTasks();
    } catch (err) {
      set({ modelsError: err instanceof Error ? err.message : '暂停下载失败' });
    }
  },

  resumeDownload: async (taskId: string) => {
    try {
      await modelsApi.resumeDownload(taskId);
      await get().fetchDownloadTasks();
    } catch (err) {
      set({ modelsError: err instanceof Error ? err.message : '恢复下载失败' });
    }
  },

  cancelDownload: async (taskId: string) => {
    try {
      await modelsApi.cancelDownload(taskId);
      await get().fetchDownloadTasks();
    } catch (err) {
      set({ modelsError: err instanceof Error ? err.message : '取消下载失败' });
    }
  },

  switchDefaultModel: async (modelId: string, type: ModelType) => {
    set({ switchingModel: true });
    try {
      await modelsApi.switchDefaultModel(modelId, type);
      await get().fetchLocalModels();
    } catch (err) {
      set({ localModelsError: err instanceof Error ? err.message : '切换默认模型失败' });
    } finally {
      set({ switchingModel: false });
    }
  },

  deleteModel: async (modelId: string) => {
    set({ deletingModel: true });
    try {
      await modelsApi.deleteModel(modelId);
      await get().fetchLocalModels();
    } catch (err) {
      set({ localModelsError: err instanceof Error ? err.message : '删除模型失败' });
    } finally {
      set({ deletingModel: false });
    }
  },

  cleanupUnusedModels: async () => {
    set({ cleaningUp: true });
    try {
      const result = await modelsApi.cleanupUnusedModels();
      await get().fetchLocalModels();
      return result;
    } catch (err) {
      set({ localModelsError: err instanceof Error ? err.message : '清理未使用模型失败' });
      return null;
    } finally {
      set({ cleaningUp: false });
    }
  },

  checkStoragePermission: async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    const { storagePermission, setStoragePermission } = usePlatformStore.getState();

    if (storagePermission === 'granted') {
      return true;
    }

    if (storagePermission === 'denied') {
      return false;
    }

    try {
      const result = await platformBridge.checkStoragePermission();
      if (result.success && result.data) {
        setStoragePermission(result.data);
        return result.data === 'granted';
      }
      return false;
    } catch (err) {
      console.error('Failed to check storage permission:', err);
      return false;
    }
  },

  /**
   * 请求存储权限
   */
  requestStoragePermission: async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      const { setStoragePermission } = usePlatformStore.getState();
      const result = await platformBridge.requestStoragePermission();

      if (result.success && result.data) {
        setStoragePermission(result.data);
        return result.data === 'granted';
      }
      return false;
    } catch (err) {
      console.error('Failed to request storage permission:', err);
      return false;
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterType: (type) => set({ filterType: type }),

  startPolling: (interval = 3000) => {
    const existingInterval = get().pollInterval;
    if (existingInterval) {
      window.clearInterval(existingInterval);
    }

    const newInterval = window.setInterval(async () => {
      const { downloadTasks } = get();
      // 只有当有进行中的下载任务时才轮询
      const hasActiveDownloads = downloadTasks.some(
        task => task.status === 'downloading' || task.status === 'pending'
      );

      if (hasActiveDownloads) {
        await get().fetchDownloadTasks();
        await get().fetchLocalModels();
      } else {
        // 如果没有活跃下载，停止轮询
        get().stopPolling();
      }
    }, interval);

    set({ pollInterval: newInterval });
  },

  stopPolling: () => {
    const interval = get().pollInterval;
    if (interval) {
      window.clearInterval(interval);
      set({ pollInterval: null });
    }
  },

  clearErrors: () => set({ modelsError: null, localModelsError: null }),
}));
