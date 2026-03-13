import React from 'react';
import { Pause, Play, X, HardDrive, Clock } from 'lucide-react';
import type { DownloadTask } from '../../types/domain';
import { formatFileSize, formatSpeed } from '../../utils/format';

interface DownloadProgressItemProps {
  task: DownloadTask;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export function DownloadProgressItem({ task, onPause, onResume, onCancel }: DownloadProgressItemProps) {
  const isDownloading = task.status === 'downloading';
  const isPaused = task.status === 'paused';
  const isFailed = task.status === 'failed';
  const isCompleted = task.status === 'completed';

  const progress = Math.min(100, Math.max(0, task.progress));
  const downloadedSize = formatFileSize(task.downloadedSize);
  const totalSize = formatFileSize(task.totalSize);
  const speed = formatSpeed(task.speed);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isDownloading
                ? 'bg-blue-500 animate-pulse'
                : isPaused
                  ? 'bg-amber-500'
                  : isFailed
                    ? 'bg-red-500'
                    : isCompleted
                      ? 'bg-green-500'
                      : 'bg-slate-400'
            }`}
          />
          <span className="font-medium text-slate-900 text-sm">{task.modelName}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isCompleted && !isFailed && (
            <>
              {isDownloading ? (
                <button
                  onClick={onPause}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="暂停"
                >
                  <Pause className="size-4 text-slate-600" />
                </button>
              ) : isPaused ? (
                <button
                  onClick={onResume}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="继续"
                >
                  <Play className="size-4 text-slate-600" />
                </button>
              )}
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="取消"
              >
                <X className="size-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFailed ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>
            {downloadedSize} / {totalSize}
          </span>
          {isDownloading && <span className="text-blue-600">{speed}</span>}
          {isPaused && <span className="text-amber-600">已暂停</span>}
          {isFailed && <span className="text-red-600">下载失败</span>}
          {isCompleted && <span className="text-green-600">已完成</span>}
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="size-3" />
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>

      {isFailed && task.error && (
        <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
          {task.error}
        </div>
      )}
    </div>
  );
}
