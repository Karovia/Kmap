import React from 'react';
import { X, Cpu, HardDrive, Calendar, User, Hash, FileCode } from 'lucide-react';
import type { ModelInfo, LocalModel } from '../../types/domain';
import { formatFileSize, formatDate } from '../../utils/format';

interface ModelDetailModalProps {
  show: boolean;
  model: ModelInfo | LocalModel | null;
  onClose: () => void;
  isLocal?: boolean;
}

export function ModelDetailModal({ show, model, onClose, isLocal = false }: ModelDetailModalProps) {
  if (!show || !model) return null;

  const isLLM = model.type === 'llm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">模型详情</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="size-5 text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">{model.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isLLM ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}
              >
                {isLLM ? 'LLM' : 'Embedding'}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {'description' in model ? model.description : '本地已安装模型'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Cpu className="size-3.5" />
                <span>参数大小</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{model.parameters}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <HardDrive className="size-3.5" />
                <span>文件大小</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{formatFileSize(model.size)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <FileCode className="size-3.5" />
                <span>量化精度</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{model.quantization}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <FileCode className="size-3.5" />
                <span>文件格式</span>
              </div>
              <p className="text-base font-semibold text-slate-900">{model.format}</p>
            </div>
          </div>

          <div className="space-y-3">
            {'author' in model && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="size-4" />
                  <span className="text-sm">作者</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{model.author}</span>
              </div>
            )}

            {'version' in model && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="size-4" />
                  <span className="text-sm">版本</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{model.version}</span>
              </div>
            )}

            {'releaseDate' in model && model.releaseDate && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="size-4" />
                  <span className="text-sm">发布日期</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatDate(model.releaseDate)}</span>
              </div>
            )}

            {'downloadedAt' in model && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="size-4" />
                  <span className="text-sm">下载日期</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatDate(model.downloadedAt)}</span>
              </div>
            )}

            {'lastUsedAt' in model && model.lastUsedAt && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="size-4" />
                  <span className="text-sm">最近使用</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{formatDate(model.lastUsedAt)}</span>
              </div>
            )}

            {'sha256' in model && model.sha256 && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="size-4" />
                  <span className="text-sm">SHA256</span>
                </div>
                <span className="text-sm font-medium text-slate-900 font-mono text-xs">
                  {model.sha256.slice(0, 16)}...
                </span>
              </div>
            )}
          </div>

          {'tags' in model && model.tags.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 mb-2">标签</p>
              <div className="flex flex-wrap gap-1.5">
                {model.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
