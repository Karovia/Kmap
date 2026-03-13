import React from 'react';
import { Download, HardDrive, Cpu, Info } from 'lucide-react';
import type { ModelInfo } from '../../types/domain';
import { formatFileSize } from '../../utils/format';

interface ModelCardProps {
  model: ModelInfo;
  isDownloading: boolean;
  hasDownloaded: boolean;
  onDownload: () => void;
  onViewDetails: () => void;
}

export function ModelCard({ model, isDownloading, hasDownloaded, onDownload, onViewDetails }: ModelCardProps) {
  const isLLM = model.type === 'llm';
  const hasEnoughSpace = true; // 这里可以根据实际存储空间判断

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{model.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isLLM ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}
            >
              {isLLM ? 'LLM' : 'Embedding'}
            </span>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2">{model.description}</p>
        </div>
        <button
          onClick={onViewDetails}
          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="查看详情"
        >
          <Info className="size-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Cpu className="size-3" />
            <span>参数</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{model.parameters}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <HardDrive className="size-3" />
            <span>大小</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{formatFileSize(model.size)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <span>量化</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{model.quantization}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          需要 {formatFileSize(model.requiredSpace)} 存储空间
          {!hasEnoughSpace && <span className="text-red-500 ml-1">（空间不足）</span>}
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading || hasDownloaded || !hasEnoughSpace}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            hasDownloaded
              ? 'bg-green-50 text-green-600 cursor-default'
              : isDownloading
                ? 'bg-blue-50 text-blue-600 cursor-wait'
                : !hasEnoughSpace
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <Download className="size-4" />
          {hasDownloaded ? '已下载' : isDownloading ? '下载中' : '下载'}
        </button>
      </div>
    </div>
  );
}
