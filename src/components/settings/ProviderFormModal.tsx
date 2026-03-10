import type React from 'react';
import { ChevronDown, Eye, Loader2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LLMProvider, ProviderType } from '../../types/domain';
import { cn } from '../../utils/cn';

interface ProviderFormModalProps {
  show: boolean;
  editingProvider: LLMProvider | null;
  formData: Omit<LLMProvider, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<LLMProvider, 'id'>>>;
  showApiKey: boolean;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ProviderFormModal(props: ProviderFormModalProps) {
  const {
    show,
    editingProvider,
    formData,
    setFormData,
    showApiKey,
    setShowApiKey,
    submitting,
    onSubmit,
    onClose,
  } = props;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingProvider ? '编辑服务商' : '添加服务商'}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="size-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">服务商名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="例如：公司 OpenAI"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">服务商类型</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({ ...formData, type: e.target.value as ProviderType })
                    }
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="custom">自定义</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none size-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">用途</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, providerScope: 'chat' })}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                      formData.providerScope === 'chat'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600'
                    )}
                  >
                    对话模型
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, providerScope: 'embedding' })}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                      formData.providerScope === 'embedding'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-600'
                    )}
                  >
                    Embedding 模型
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required
                    value={formData.apiKey}
                    onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="输入 API 密钥"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Eye className="size-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Base URL (可选)</label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="例如：https://api.openai.com/v1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">模型名称</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={
                    formData.providerScope === 'embedding'
                      ? '例如：text-embedding-3-small'
                      : '例如：gpt-4o, claude-3-opus'
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="size-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">
                  设为当前用途默认服务商
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {editingProvider ? '保存修改' : '添加服务商'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
