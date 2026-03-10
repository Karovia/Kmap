import {
  Bot,
  BrainCircuit,
  Edit3,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { LLMProvider, ProviderType } from '../../types/domain';
import { cn } from '../../utils/cn';

interface ProviderListProps {
  loading: boolean;
  providers: LLMProvider[];
  testingId: string | null;
  onTest: (id: string) => void;
  onEdit: (provider: LLMProvider) => void;
  onDelete: (id: string) => void;
}

function getProviderTypeInfo(type: ProviderType) {
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
}

export function ProviderList({
  loading,
  providers,
  testingId,
  onTest,
  onEdit,
  onDelete,
}: ProviderListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Settings className="size-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">当前用途暂无服务商配置，请点击上方按钮添加</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map(provider => {
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
                    <h3 className="font-semibold text-slate-900 truncate">{provider.name}</h3>
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
                  onClick={() => onTest(provider.id)}
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
                  onClick={() => onEdit(provider)}
                  className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit3 className="size-4" />
                </button>
                <button
                  onClick={() => onDelete(provider.id)}
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
  );
}
