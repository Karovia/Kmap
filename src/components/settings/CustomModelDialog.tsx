import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import type { ModelType } from '../../types/domain';

interface CustomModelDialogProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (url: string, type: ModelType) => Promise<void>;
}

export function CustomModelDialog({ show, onClose, onSubmit }: CustomModelDialogProps) {
  const [url, setUrl] = useState('');
  const [modelType, setModelType] = useState<ModelType>('llm');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证 URL 格式
    if (!url.trim()) {
      setError('请输入模型 URL');
      return;
    }

    // 验证是否为 Hugging Face URL
    if (!url.includes('huggingface.co')) {
      setError('目前仅支持 Hugging Face 模型 URL');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(url.trim(), modelType);
      setUrl('');
      setModelType('llm');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setUrl('');
      setModelType('llm');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">添加自定义模型</h3>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="size-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              模型类型
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="llm"
                  checked={modelType === 'llm'}
                  onChange={(e) => setModelType(e.target.value as ModelType)}
                  disabled={submitting}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">对话模型 (LLM)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="embedding"
                  checked={modelType === 'embedding'}
                  onChange={(e) => setModelType(e.target.value as ModelType)}
                  disabled={submitting}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-700">向量模型 (Embedding)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="model-url" className="block text-sm font-medium text-slate-700">
              Hugging Face 模型 URL
            </label>
            <input
              id="model-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={submitting}
              placeholder="https://huggingface.co/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-slate-50 disabled:text-slate-500"
            />
            <p className="text-xs text-slate-500">
              示例: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-ONNX/resolve/main/onnx/model.onnx
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800">
              <strong>提示：</strong>
            </p>
            <ul className="mt-2 text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>仅支持 ONNX 格式的量化模型</li>
              <li>对话模型将保存到 models/llm/ 目录</li>
              <li>向量模型将保存到 models/embedding/ 目录</li>
              <li>下载前会自动验证 URL 有效性</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || !url.trim()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  添加中...
                </>
              ) : (
                '添加模型'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
