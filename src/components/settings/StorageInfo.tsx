import React from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { formatFileSize } from '../../utils/format';

interface StorageInfoProps {
  total: number;
  used: number;
  available: number;
  modelsUsed: number;
  onCleanup: () => void;
  cleaningUp: boolean;
}

export function StorageInfo({ total, used, available, modelsUsed, onCleanup, cleaningUp }: StorageInfoProps) {
  const usedPercentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const modelsPercentage = total > 0 ? Math.min((modelsUsed / total) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="size-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">存储信息</h3>
        </div>
        <button
          onClick={onCleanup}
          disabled={cleaningUp || modelsUsed === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            cleaningUp || modelsUsed === 0
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }`}
        >
          <Trash2 className="size-4" />
          {cleaningUp ? '清理中...' : '清理未使用'}
        </button>
      </div>

      {/* 进度条 */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className="h-full flex">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${modelsPercentage}%` }}
            title="模型占用"
          />
          <div
            className="h-full bg-slate-400 transition-all duration-300"
            style={{ width: `${usedPercentage - modelsPercentage}%` }}
            title="其他占用"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-500 mb-0.5">总存储空间</p>
          <p className="font-medium text-slate-900">{formatFileSize(total)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5">可用空间</p>
          <p className="font-medium text-slate-900">{formatFileSize(available)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5">已用空间</p>
          <p className="font-medium text-slate-900">{formatFileSize(used)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5">模型占用</p>
          <p className="font-medium text-orange-600">{formatFileSize(modelsUsed)}</p>
        </div>
      </div>
    </div>
  );
}
