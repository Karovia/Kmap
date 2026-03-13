import React from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { formatFileSize } from '../../utils/format';

interface StorageInfoProps {
  total: number;
  used: number;
  modelsUsed: number;
  available: number;
  onCleanup: () => void;
  isCleaning: boolean;
}

export function StorageInfo({ total, used, modelsUsed, available, onCleanup, isCleaning }: StorageInfoProps) {
  const usedPercentage = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0;
  const modelsPercentage = total > 0 ? Math.min(100, Math.max(0, (modelsUsed / total) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="size-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">存储空间</h3>
        </div>
        <button
          onClick={onCleanup}
          disabled={isCleaning || modelsUsed === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="size-4" />
          {isCleaning ? '清理中...' : '清理未使用'}
        </button>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${modelsPercentage}%` }}
              title="模型占用"
            />
            <div
              className="h-full bg-slate-300 transition-all duration-300"
              style={{ width: `${usedPercentage - modelsPercentage}%` }}
              title="其他占用"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">{formatFileSize(total)}</p>
          <p className="text-xs text-slate-500">总容量</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-blue-600">{formatFileSize(modelsUsed)}</p>
          <p className="text-xs text-slate-500">模型占用</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-green-600">{formatFileSize(available)}</p>
          <p className="text-xs text-slate-500">可用空间</p>
        </div>
      </div>
    </div>
  );
}
