import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { NAV_ITEMS } from '../../types/navigation';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-6 py-3 pb-8 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto relative w-full">
        {NAV_ITEMS.map(tab => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          if (tab.id === 'chat') {
            return (
              <div key={tab.id} className="flex flex-col items-center gap-1 -mt-8 px-2">
                <button
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    'size-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center',
                    isActive
                      ? 'bg-primary text-white shadow-primary/20'
                      : 'bg-slate-900 text-white shadow-slate-900/20'
                  )}
                >
                  <Icon className="size-6" />
                </button>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider mt-1',
                    isActive ? 'text-primary' : 'text-slate-900'
                  )}
                >
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('size-6', isActive && 'fill-current')} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
