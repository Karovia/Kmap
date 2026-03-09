import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from '../services/api';
import type { LLMProvider, ProviderScope, ProviderType } from '../types/domain';
import { cn } from '../utils/cn';

export function SettingsPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [activeScope, setActiveScope] = useState<ProviderScope>('chat');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [formData, setFormData] = useState<Omit<LLMProvider, 'id'>>({
    name: '',
    type: 'openai',
    providerScope: 'chat',
    apiKey: '',
    baseUrl: '',
    model: '',
    isDefault: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingProvider) {
        await api.updateProvider(editingProvider.id, formData);
        setSuccess('服务商配置更新成功');
      } else {
        await api.createProvider(formData);
        setSuccess('服务商创建成功');
      }

      setShowForm(false);
      setEditingProvider(null);
      setFormData({
        name: '',
        type: 'openai',
        providerScope: activeScope,
        apiKey: '',
        baseUrl: '',
        model: '',
        isDefault: false,
      });
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (provider: LLMProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      providerScope: provider.providerScope,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl,
      model: provider.model,
      isDefault: provider.isDefault,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个服务商配置吗？')) return;
    try {
      setError(null);
      setSuccess(null);
      await api.deleteProvider(id);
      setSuccess('服务商删除成功');
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTestingId(id);
      setError(null);
      setSuccess(null);
      const result = await api.testProvider(id);
      if (result.success) {
        setSuccess('连接测试成功！');
      } else {
        setError(`测试失败：${result.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProvider(null);
    setFormData({
      name: '',
      type: 'openai',
      providerScope: activeScope,
      apiKey: '',
      baseUrl: '',
      model: '',
      isDefault: false,
    });
    setError(null);
    setSuccess(null);
  };

  const providersByScope = providers.filter(provider => provider.providerScope === activeScope);

  const openCreateForm = (scope: ProviderScope) => {
    setEditingProvider(null);
    setFormData({
      name: '',
      type: scope === 'embedding' ? 'openai' : 'openai',
      providerScope: scope,
      apiKey: '',
      baseUrl: '',
      model: scope === 'embedding' ? 'text-embedding-3-small' : '',
      isDefault: false,
    });
    setActiveScope(scope);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const getProviderTypeInfo = (type: ProviderType) => {
    switch (type) {
      case 'openai':
        return { icon: <Sparkles className="size-4" />, label: 'OpenAI' };
      case 'gemini':
        return { icon: <Bot className="size-4" />, label: 'Gemini' };
      case 'claude':
        return { icon: <BrainCircuit className="size-4" />, label: 'Claude' };
      case 'custom':
        return { icon: <Settings className="size-4" />, label: '自定义' };
    }
  };

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-[#fcfaf8]/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeft className="size-6 text-slate-600 cursor-pointer" />
          <h1 className="text-lg font-semibold font-serif">设置</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full p-4 space-y-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700"
            >
              <XCircle className="size-5 text-red-500 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700"
            >
              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
              <p className="text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif mb-1">LLM 服务商配置</h2>
              <p className="text-sm text-slate-500">
                管理对话模型和 Embedding 模型服务商，分别设置默认供应商。
              </p>
            </div>
            <button
              onClick={() => openCreateForm(activeScope)}
              className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
              添加{activeScope === 'chat' ? '对话' : 'Embedding'}服务商
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveScope('chat')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeScope === 'chat'
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              )}
            >
              对话模型
            </button>
            <button
              onClick={() => setActiveScope('embedding')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeScope === 'embedding'
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              )}
            >
              Embedding 模型
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
          ) : providersByScope.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Settings className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">当前用途暂无服务商配置，请点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providersByScope.map(provider => {
                const typeInfo = getProviderTypeInfo(provider.type);
                return (
                  <div
                    key={provider.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={cn(
                            'size-10 rounded-lg flex items-center justify-center shrink-0',
                            provider.type === 'openai'
                              ? 'bg-emerald-50 text-emerald-600'
                              : provider.type === 'gemini'
                                ? 'bg-blue-50 text-blue-600'
                                : provider.type === 'claude'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-slate-50 text-slate-600'
                          )}
                        >
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">
                              {provider.name}
                            </h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {typeInfo.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {provider.providerScope === 'chat' ? '对话' : 'Embedding'}
                            </span>
                            {provider.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                默认
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-2">模型: {provider.model}</p>
                          {provider.baseUrl && (
                            <p className="text-xs text-slate-400 truncate">{provider.baseUrl}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleTest(provider.id)}
                          disabled={testingId === provider.id}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
                          title="测试连接"
                        >
                          {testingId === provider.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RefreshCw className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(provider)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={resetForm}
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
                    onClick={resetForm}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <XCircle className="size-5 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                      onClick={resetForm}
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

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4">
          <Info className="size-6 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800">配置说明</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              您的配置将加密存储在本地，不会上传到第三方服务器。如果您使用本地部署的模型，请确保已在跨域设置中允许当前域名。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
