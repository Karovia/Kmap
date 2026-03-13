import React from 'react';
import { Download, HardDrive, Cpu, Info } from 'lucide-react';
import type { ModelInfo } from '../../types/domain';
import { formatFileSize } from '../../utils/format';

interface ModelCardProps {
  model: ModelInfo;
  isDownloading: boolean;
  onDownload: (modelId: string) => void;
}

export function ModelCard({ model, isDownloading, onDownload }: ModelCardProps) {
  const getTypeBadgeColor = (type: string) => {
    return type === 'llm' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'llm' ? '对话模型' : '向量模型';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary/30 hover:bg-primary/5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{model.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(
                model.type
              )}`}
            >
              {getTypeLabel(model.type)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{model.description}</p>
        </div>
        <button
          onClick={() => onDownload(model.id)}
          disabled={isDownloading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isDownloading
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <Download className="size-4" />
          {isDownloading ? '下载中' : '下载'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <Cpu className="size-3.5 text-slate-400" />
          <span>{model.parameters}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <HardDrive className="size-3.5 text-slate-400" />
          <span>{formatFileSize(model.requiredSpace)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <Info className="size-3.5 text-slate-400" />
          <span>{model.quantization}</span>
        </div>
      </div>

      {model.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {model.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
