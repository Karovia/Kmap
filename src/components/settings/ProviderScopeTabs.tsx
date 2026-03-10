import type { ProviderScope } from '../../types/domain';
import { cn } from '../../utils/cn';

interface ProviderScopeTabsProps {
  activeScope: ProviderScope;
  onChange: (scope: ProviderScope) => void;
}

export function ProviderScopeTabs({ activeScope, onChange }: ProviderScopeTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('chat')}
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
        onClick={() => onChange('embedding')}
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
  );
}
