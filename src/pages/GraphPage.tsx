import { Bookmark, FileText, Menu, Network, Search, Share2, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function GraphPage() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light">
      <header className="flex items-center justify-between px-6 py-4 bg-background-light/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Network className="size-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Kmap</h1>
        </div>
        <div className="flex gap-4">
          <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <Search className="size-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        </div>

        <svg
          className="w-full h-full absolute inset-0 z-0"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <line
            x1="200"
            y1="300"
            x2="100"
            y2="150"
            className="stroke-slate-300"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="300"
            x2="300"
            y2="200"
            className="stroke-slate-300"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="300"
            x2="280"
            y2="450"
            className="stroke-slate-300"
            strokeWidth="1.5"
          />
          <line
            x1="100"
            y1="150"
            x2="50"
            y2="250"
            className="stroke-slate-300"
            strokeWidth="1"
            strokeDasharray="4"
          />

          <circle
            cx="200"
            cy="300"
            r="45"
            className="fill-primary/20 stroke-primary"
            strokeWidth="2"
          />
          <text
            x="200"
            y="305"
            textAnchor="middle"
            className="fill-slate-900 font-bold text-[14px]"
          >
            神经网络
          </text>

          <circle
            cx="100"
            cy="150"
            r="35"
            className="fill-slate-200 stroke-slate-400"
            strokeWidth="1.5"
          />
          <text x="100" y="155" textAnchor="middle" className="fill-slate-700 text-[12px]">
            量子物理
          </text>

          <circle
            cx="300"
            cy="200"
            r="30"
            className="fill-slate-200 stroke-slate-400"
            strokeWidth="1.5"
          />
          <text x="300" y="205" textAnchor="middle" className="fill-slate-700 text-[12px]">
            AI 伦理
          </text>

          <circle
            cx="280"
            cy="450"
            r="32"
            className="fill-slate-200 stroke-slate-400"
            strokeWidth="1.5"
          />
          <text x="280" y="455" textAnchor="middle" className="fill-slate-700 text-[12px]">
            大语言模型
          </text>
        </svg>

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">视图模式</p>
            <div className="flex gap-2">
              <button className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                3D 探索
              </button>
              <button className="bg-slate-100 text-xs px-3 py-1 rounded-full">列表视图</button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-[100px] left-0 right-0 z-30 px-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3"></div>
            <div className="px-6 pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                    核心实体
                  </span>
                  <h2 className="text-2xl font-bold">神经网络</h2>
                </div>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <Bookmark className="size-6" />
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                神经网络是一种受生物神经系统启发的人工智能模型，通过大量互连的节点（神经元）处理信息。它是深度学习的基础架构。
              </p>
              <div className="flex gap-8 mb-6 border-y border-slate-100 py-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">关联节点</p>
                  <p className="font-bold text-lg">128</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">引用文献</p>
                  <p className="font-bold text-lg">45</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">重要度</p>
                  <div className="flex items-center gap-0.5 text-primary">
                    <Star className="size-3 fill-current" />
                    <Star className="size-3 fill-current" />
                    <Star className="size-3 fill-current" />
                    <Star className="size-3 fill-current" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <FileText className="size-5" /> 查看文档
                </button>
                <button className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="size-5" /> 分享路径
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
