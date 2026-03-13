import React from 'react';
import { Pause, Play, X, AlertCircle } from 'lucide-react';
import type { DownloadTask } from '../../types/domain';
import { formatFileSize, formatSpeed } from '../../utils/format';

interface DownloadTaskItemProps {
  task: DownloadTask;
  onPause: (taskId: string) => void;
  onResume: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
}

export function DownloadTaskItem({ task, onPause, onResume, onCancel, onRetry }: DownloadTaskItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'text-blue-600';
      case 'paused':
        return 'text-orange-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'downloading':
        return '下载中';
      case 'paused':
        return '已暂停';
      case 'completed':
        return '已完成';
      case 'failed':
        return '下载失败';
      default:
        return status;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{task.modelName}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            {task.status === 'downloading' && (
              <span className="text-slate-500">{formatSpeed(task.speed)}</span>
            )}
            <span className="text-slate-500">
              {formatFileSize(task.downloadedSize)} / {formatFileSize(task.totalSize)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {task.status === 'downloading' && (
            <button
              onClick={() => onPause(task.taskId)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="暂停"
            >
              <Pause className="size-4 text-slate-600" />
            </button>
          )}
          {task.status === 'paused' && (
            <button
              onClick={() => onResume(task.taskId)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="继续"
            >
              <Play className="size-4 text-slate-600" />
            </button>
          )}
          {task.status === 'failed' && (
            <button
              onClick={() => onRetry(task.taskId)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="重试"
            >
              <AlertCircle className="size-4 text-red-600" />
            </button>
          )}
          {(task.status === 'downloading' || task.status === 'paused' || task.status === 'failed') && (
            <button
              onClick={() => onCancel(task.taskId)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="取消"
            >
              <X className="size-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor(task.status)} transition-all duration-300`}
          style={{ width: `${Math.min(task.progress, 100)}%` }}
        />
      </div>

      {/* 错误信息 */}
      {task.status === 'failed' && task.error && (
        <p className="mt-2 text-xs text-red-600">{task.error}</p>
      )}
    </div>
  );
}
