import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProviderFormModal } from '../components/settings/ProviderFormModal';
import { ProviderList } from '../components/settings/ProviderList';
import { ProviderScopeTabs } from '../components/settings/ProviderScopeTabs';
import { SettingsHintCard } from '../components/settings/SettingsHintCard';
import { StatusAlerts } from '../components/settings/StatusAlerts';
import { api } from '../services/api';
import { useProviderStore } from '../stores/providerStore';
import type { LLMProvider, ProviderScope } from '../types/domain';

export function SettingsPage() {
  const navigate = useNavigate();
  const providers = useProviderStore(state => state.providers);
  const loading = useProviderStore(state => state.loading);
  const setProviders = useProviderStore(state => state.setProviders);
  const setLoading = useProviderStore(state => state.setLoading);
  const [activeScope, setActiveScope] = useState<ProviderScope>('chat');
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

  const openCreateForm = (scope: ProviderScope) => {
    setEditingProvider(null);
    setFormData({
      name: '',
      type: 'openai',
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

  const providersByScope = providers.filter(provider => provider.providerScope === activeScope);

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-[#fcfaf8]/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="size-6 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold font-serif">设置</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full p-4 space-y-8">
        <StatusAlerts error={error} success={success} />

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

          <ProviderScopeTabs activeScope={activeScope} onChange={setActiveScope} />

          <button
            onClick={() => navigate('/settings/guide')}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">查看详细配置指南</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                包含火山方舟对话模型与 Embedding 模型的 Base URL、模型名和常见错误说明。
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
              打开教程
            </div>
          </button>

          <ProviderList
            loading={loading}
            providers={providersByScope}
            testingId={testingId}
            onTest={handleTest}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>

        <ProviderFormModal
          show={showForm}
          editingProvider={editingProvider}
          formData={formData}
          setFormData={setFormData}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />

        <SettingsHintCard />
      </main>
    </div>
  );
}
