import React, { useState } from 'react';
import { Check, Trash2, HardDrive, Cpu, Clock } from 'lucide-react';
import type { LocalModel } from '../../types/domain';
import { formatFileSize, formatTime } from '../../utils/format';

interface LocalModelCardProps {
  model: LocalModel;
  isDefault: boolean;
  onSetDefault: (modelId: string, type: 'llm' | 'embedding') => void;
  onDelete: (modelId: string) => void;
}

export function LocalModelCard({ model, isDefault, onSetDefault, onDelete }: LocalModelCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTypeBadgeColor = (type: string) => {
    return type === 'llm' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'llm' ? '对话模型' : '向量模型';
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(model.modelId);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
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
            {isDefault && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                默认
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span>下载于 {formatTime(model.downloadedAt)}</span>
            {model.lastUsedAt && (
              <span>上次使用 {formatTime(model.lastUsedAt)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isDefault && (
            <button
              onClick={() => onSetDefault(model.modelId, model.type)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <Check className="size-4" />
              设为默认
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDefault}
            className={`p-1.5 rounded-lg transition-colors ${
              isDefault
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : showDeleteConfirm
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'hover:bg-red-50 text-red-600'
            }`}
            title={isDefault ? '默认模型无法删除' : '删除模型'}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <Cpu className="size-3.5 text-slate-400" />
          <span>{model.parameters}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <HardDrive className="size-3.5 text-slate-400" />
          <span>{formatFileSize(model.size)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <Clock className="size-3.5 text-slate-400" />
          <span>{model.quantization}</span>
        </div>
      </div>

      {showDeleteConfirm && (
        <p className="mt-2 text-xs text-red-600">再次点击确认删除，删除后无法恢复</p>
      )}
    </div>
  );
}
