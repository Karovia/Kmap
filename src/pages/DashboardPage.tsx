import { ChevronRight, FileText, Link as LinkIcon, Maximize2, Network, Search } from 'lucide-react';
import { MOCK_ACTIVITIES } from '../data/mockActivities';
import { cn } from '../utils/cn';

export function DashboardPage() {
  return (
    <div className="px-6 pt-8 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Network className="size-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-500 uppercase font-serif">
            Kmap
          </span>
        </div>
        <button className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
          <Search className="size-5 text-slate-600" />
        </button>
      </header>

      <section className="mb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900">下午好</h1>
        <p className="mt-3 text-lg text-slate-500 font-light max-w-xs leading-relaxed">
          这是您当前的知识网络概览，今天已处理 24 个新节点。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 mb-10">
        {[
          { label: '文档总数', value: '1,284', change: '+12%' },
          { label: '知识节点', value: '5,602', change: '+5%' },
          { label: '关联关系', value: '12.4k', change: '+18%' },
          { label: '查询次数', value: '892', change: '+7%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold">知识图谱可视化</h3>
          <button className="text-sm font-medium text-primary flex items-center gap-1">
            全屏查看 <Maximize2 className="size-3" />
          </button>
        </div>
        <div className="relative w-full aspect-square max-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #1754cf 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>
          <div className="relative w-full h-full p-8 flex items-center justify-center">
            <div className="relative group">
              <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <div className="size-8 bg-primary rounded-full shadow-lg shadow-primary/40"></div>
              </div>
              <div className="absolute -top-12 -left-8 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-xl text-xs font-medium whitespace-nowrap">
                核心概念：人工智能
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-primary/40 to-transparent rotate-45 origin-left"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-gradient-to-r from-primary/40 to-transparent -rotate-12 origin-left"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[1px] bg-gradient-to-r from-primary/40 to-transparent rotate-[160deg] origin-left"></div>

              <div className="absolute -right-40 -top-10 size-4 bg-slate-300 rounded-full"></div>
              <div className="absolute -right-28 top-20 size-3 bg-slate-300 rounded-full"></div>
              <div className="absolute -left-32 -bottom-16 size-5 bg-slate-300 rounded-full"></div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white/20 flex justify-between items-center">
            <div className="flex -space-x-2">
              <div className="size-6 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="size-6 rounded-full bg-emerald-400 border-2 border-white"></div>
              <div className="size-6 rounded-full bg-amber-400 border-2 border-white"></div>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              实时同步中...
            </span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="font-serif text-xl font-semibold mb-4">最近活动</h3>
        <div className="space-y-3">
          {MOCK_ACTIVITIES.map(activity => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-slate-100/50"
            >
              <div
                className={cn(
                  'size-10 rounded-lg flex items-center justify-center',
                  activity.type === 'file'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'
                )}
              >
                {activity.type === 'file' ? (
                  <FileText className="size-5" />
                ) : (
                  <LinkIcon className="size-5" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{activity.title}</h4>
                <p className="text-xs text-slate-500">
                  {activity.time} • {activity.detail}
                </p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
