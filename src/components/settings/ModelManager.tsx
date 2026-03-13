import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';
import { usePlatformStore } from '../../stores/platformStore';
import { PermissionPrompt } from './PermissionPrompt';
import { ModelCard } from './ModelCard';
import { LocalModelCard } from './LocalModelCard';
import { DownloadTaskItem } from './DownloadTaskItem';
import { StorageInfo } from './StorageInfo';
import { CustomModelDialog } from './CustomModelDialog';
import type { ModelType } from '../../types/domain';

interface ModelManagerProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function ModelManager({ onError, onSuccess }: ModelManagerProps) {
  const [filterType, setFilterType] = useState<ModelType | 'all'>('all');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const {
    availableModels,
    localModels,
    downloadTasks,
    storageInfo,
    modelsLoading,
    localModelsLoading,
    downloading,
    switchingModel,
    deletingModel,
    cleaningUp,
    modelsError,
    localModelsError,
    activeTab,
    setActiveTab,
    fetchAvailableModels,
    fetchLocalModels,
    fetchDownloadTasks,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    switchDefaultModel,
    deleteModel,
    cleanupUnusedModels,
    startPolling,
    stopPolling,
    clearErrors,
    checkStoragePermission,
    requestStoragePermission,
  } = useModelStore();

  const { storagePermission } = usePlatformStore();

  // 加载数据和检查权限
  useEffect(() => {
    const init = async () => {
      await checkStoragePermission();
      fetchAvailableModels();
      fetchLocalModels();
      fetchDownloadTasks();
    };
    init();
  }, [checkStoragePermission, fetchAvailableModels, fetchLocalModels, fetchDownloadTasks]);

  // 权限变化监听
  useEffect(() => {
    setShowPermissionPrompt(storagePermission === 'denied');
  }, [storagePermission]);

  // 轮询下载状态
  useEffect(() => {
    const hasActiveDownloads = downloadTasks.some(
      (task) => task.status === 'downloading' || task.status === 'pending'
    );
    if (hasActiveDownloads) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [downloadTasks, startPolling, stopPolling]);

  // 错误处理
  useEffect(() => {
    if (modelsError && onError) {
      onError(modelsError);
      clearErrors();
    }
    if (localModelsError && onError) {
      onError(localModelsError);
      clearErrors();
    }
  }, [modelsError, localModelsError, onError, clearErrors]);

  const handleDownload = async (modelId: string) => {
    const taskId = await startDownload(modelId);
    if (taskId && onSuccess) {
      onSuccess('下载任务已创建');
    }
  };

  const handlePause = async (taskId: string) => {
    await pauseDownload(taskId);
  };

  const handleResume = async (taskId: string) => {
    await resumeDownload(taskId);
  };

  const handleCancel = async (taskId: string) => {
    await cancelDownload(taskId);
    if (onSuccess) {
      onSuccess('下载已取消');
    }
  };

  const handleRetry = async (taskId: string) => {
    const task = downloadTasks.find((t) => t.taskId === taskId);
    if (task) {
      const newTaskId = await startDownload(task.modelId);
      if (newTaskId && onSuccess) {
        onSuccess('重新下载已开始');
      }
    }
  };

  const handleSetDefault = async (modelId: string, type: ModelType) => {
    await switchDefaultModel(modelId, type);
    if (onSuccess) {
      onSuccess('默认模型已切换');
    }
  };

  const handleDelete = async (modelId: string) => {
    await deleteModel(modelId);
    if (onSuccess) {
      onSuccess('模型已删除');
    }
  };

  const handleCleanup = async () => {
    const result = await cleanupUnusedModels();
    if (result && onSuccess) {
      onSuccess(`已清理 ${result.deletedCount} 个模型，释放 ${(result.freedSpace / 1024 / 1024 / 1024).toFixed(2)} GB 空间`);
    }
  };

  const filteredAvailableModels = filterType === 'all'
    ? availableModels
    : availableModels.filter((model) => model.type === filterType);

  const filteredLocalModels = filterType === 'all'
    ? localModels
    : localModels.filter((model) => model.type === filterType);

  const activeDownloadTasks = downloadTasks.filter(
    (task) => task.status !== 'completed' && task.status !== 'failed'
  );

  const defaultModelIds = {
    llm: localModels.find((m) => m.type === 'llm' && m.isDefault)?.modelId,
    embedding: localModels.find((m) => m.type === 'embedding' && m.isDefault)?.modelId,
  };

  const downloadingModelIds = new Set(
    downloadTasks
      .filter((t) => t.status === 'downloading' || t.status === 'pending')
      .map((t) => t.modelId)
  );

  const handleRequestPermission = async () => {
    const granted = await requestStoragePermission();
    if (granted && onSuccess) {
      onSuccess('权限已授予');
    }
  };

  const handleOpenSettings = async () => {
    // 这里可以实现打开系统设置的逻辑
    if (onError) {
      onError('请在系统设置中手动开启存储权限');
    }
  };

  const handleCustomModelSubmit = async (url: string, type: ModelType) => {
    // 这里调用下载接口，传入自定义 URL
    // 后端需要支持解析自定义 URL 并创建下载任务
    const taskId = await startDownload(url); // 需要修改 startDownload 支持 URL
    if (taskId && onSuccess) {
      onSuccess('自定义模型下载任务已创建');
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-serif mb-1">模型管理</h2>
            <p className="text-sm text-slate-500">
              下载和管理本地开源模型，实现完全离线的AI能力。
            </p>
          </div>
          <button
            onClick={() => setShowCustomDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Plus className="size-4" />
            自定义模型
          </button>
        </div>

        {/* 权限提示 */}
        {showPermissionPrompt && (
          <PermissionPrompt
            onRequestPermission={handleRequestPermission}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {/* 过滤器 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('llm')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'llm'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            对话模型
          </button>
          <button
            onClick={() => setFilterType('embedding')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'embedding'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            向量模型
          </button>
        </div>

        {/* 存储信息 */}
        {storageInfo && (
          <StorageInfo
            total={storageInfo.total}
            used={storageInfo.used}
            available={storageInfo.available}
            modelsUsed={storageInfo.modelsUsed}
            onCleanup={handleCleanup}
            cleaningUp={cleaningUp}
          />
        )}

        {/* 进行中的下载任务 */}
        {activeDownloadTasks.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">下载中</h3>
            {activeDownloadTasks.map((task) => (
              <DownloadTaskItem
                key={task.taskId}
                task={task}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={handleCancel}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}
      </section>

      {/* 自定义Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'market'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            模型市场
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'local'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已下载
          </button>
        </div>

        <div className="p-4 space-y-3">
          {activeTab === 'market' ? (
            <>
              {modelsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-8 text-slate-400 animate-spin" />
                </div>
              ) : filteredAvailableModels.length === 0 ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">暂无可用模型</h4>
                      <p className="text-sm text-blue-700">当前没有符合条件的可下载模型</p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredAvailableModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isDownloading={downloadingModelIds.has(model.id) || downloading}
                    onDownload={handleDownload}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {localModelsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-8 text-slate-400 animate-spin" />
                </div>
              ) : filteredLocalModels.length === 0 ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">暂无本地模型</h4>
                      <p className="text-sm text-blue-700">你还没有下载任何模型，请到模型市场下载</p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredLocalModels.map((model) => (
                  <LocalModelCard
                    key={model.id}
                    model={model}
                    isDefault={defaultModelIds[model.type] === model.modelId}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* 自定义模型对话框 */}
      <CustomModelDialog
        show={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
        onSubmit={handleCustomModelSubmit}
      />
    </div>
  );
}
