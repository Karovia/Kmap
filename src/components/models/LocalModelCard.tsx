import React, { useState } from 'react';
import { Check, Trash2, Info, Cpu, HardDrive, Calendar } from 'lucide-react';
import type { LocalModel } from '../../types/domain';
import { formatFileSize, formatDate } from '../../utils/format';

interface LocalModelCardProps {
  model: LocalModel;
  isSwitching: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

export function LocalModelCard({ model, isSwitching, onSetDefault, onDelete, onViewDetails }: LocalModelCardProps) {
  const isLLM = model.type === 'llm';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{model.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isLLM ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}
            >
              {isLLM ? 'LLM' : 'Embedding'}
            </span>
            {model.isDefault && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1">
                <Check className="size-3" />
                默认
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>下载于 {formatDate(model.downloadedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="size-3" />
              <span>{formatFileSize(model.size)}</span>
            </div>
          </div>
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
            <span>量化</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{model.quantization}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <span>格式</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{model.format}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {!model.isDefault ? (
          <button
            onClick={onSetDefault}
            disabled={isSwitching}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwitching ? '切换中...' : '设为默认'}
          </button>
        ) : (
          <div className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-600 text-center">
            当前默认
          </div>
        )}

        {showDeleteConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              确认删除
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="删除模型"
          >
            <Trash2 className="size-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}
