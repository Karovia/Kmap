/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  FolderOpen, 
  Network, 
  Settings, 
  MessageSquare, 
  Search, 
  MoreHorizontal, 
  ChevronRight, 
  FileText, 
  Link as LinkIcon, 
  ArrowLeft, 
  Maximize2, 
  Star, 
  Bookmark, 
  Share2, 
  PlusCircle, 
  ArrowUp,
  Menu,
  Edit3,
  Copy,
  ThumbsUp,
  RefreshCw,
  Info,
  Eye,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type Tab = 'home' | 'docs' | 'graph' | 'chat' | 'settings';

interface Document {
  id: string;
  name: string;
  size: string;
  time: string;
  status: 'indexed' | 'splitting' | 'error';
  type: 'pdf' | 'docx' | 'csv';
}

interface Activity {
  id: string;
  title: string;
  time: string;
  detail: string;
  type: 'file' | 'link';
}

// --- Mock Data ---

const MOCK_DOCS: Document[] = [
  { id: '1', name: '2024年度市场趋势分析报告.pdf', size: '2.4 MB', time: '12分钟前', status: 'indexed', type: 'pdf' },
  { id: '2', name: '核心算法架构设计文档.docx', size: '850 KB', time: '1小时前', status: 'splitting', type: 'docx' },
  { id: '3', name: 'Q3 客户反馈原始数据.csv', size: '15.2 MB', time: '昨天 14:20', status: 'indexed', type: 'csv' },
  { id: '4', name: '竞争对手产品对比图.pdf', size: '4.1 MB', time: '3天前', status: 'error', type: 'pdf' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', title: '量子计算入门导论.pdf', time: '2 小时前', detail: '已提取 42 个实体', type: 'file' },
  { id: '2', title: '建立“神经网络”与“深度学习”的关联', time: '5 小时前', detail: '自动推荐关联', type: 'link' },
];

// --- Components ---

const BottomNav = ({ currentTab, setTab }: { currentTab: Tab, setTab: (t: Tab) => void }) => {
  const tabs: { id: Tab, label: string, icon: React.ElementType }[] = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'docs', label: '文档', icon: FolderOpen },
    { id: 'chat', label: '对话', icon: MessageSquare },
    { id: 'graph', label: '图谱', icon: Network },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-6 py-3 pb-8 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto relative w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.id === 'chat') {
            return (
              <div key={tab.id} className="flex flex-col items-center gap-1 -mt-8 px-2">
                <button 
                  onClick={() => setTab('chat')}
                  className={cn(
                    "size-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center",
                    isActive ? "bg-primary text-white shadow-primary/20" : "bg-slate-900 text-white shadow-slate-900/20"
                  )}
                >
                  <Icon className="size-6" />
                </button>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1", isActive ? "text-primary" : "text-slate-900")}>
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button 
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("size-6", isActive && "fill-current")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  return (
    <div className="px-6 pt-8 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Network className="size-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-500 uppercase font-serif">Kmap</span>
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
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
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
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #1754cf 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="relative w-full h-full p-8 flex items-center justify-center">
            <div className="relative group">
              <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <div className="size-8 bg-primary rounded-full shadow-lg shadow-primary/40"></div>
              </div>
              <div className="absolute -top-12 -left-8 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-xl text-xs font-medium whitespace-nowrap">核心概念：人工智能</div>
              
              {/* Lines */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-primary/40 to-transparent rotate-45 origin-left"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-gradient-to-r from-primary/40 to-transparent -rotate-12 origin-left"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[1px] bg-gradient-to-r from-primary/40 to-transparent rotate-[160deg] origin-left"></div>
              
              {/* Nodes */}
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
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">实时同步中...</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="font-serif text-xl font-semibold mb-4">最近活动</h3>
        <div className="space-y-3">
          {MOCK_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-slate-100/50">
              <div className={cn(
                "size-10 rounded-lg flex items-center justify-center",
                activity.type === 'file' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
              )}>
                {activity.type === 'file' ? <FileText className="size-5" /> : <LinkIcon className="size-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{activity.title}</h4>
                <p className="text-xs text-slate-500">{activity.time} • {activity.detail}</p>
              </div>
              <ChevronRight className="size-5 text-slate-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const DocumentsView = () => {
  return (
    <div className="bg-white min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="font-serif text-xl font-bold text-slate-900">Kmap</h1>
          <button className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors">
            <MoreHorizontal className="size-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="搜索知识库文件..." 
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['全部', '已索引', '正在拆分', '错误'].map((filter, i) => (
              <button 
                key={i}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors",
                  i === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="px-4 py-6 space-y-1">
        {MOCK_DOCS.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              doc.type === 'pdf' ? "bg-red-50 text-red-600" : 
              doc.type === 'docx' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
            )}>
              <FileText className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-medium text-slate-900 truncate">{doc.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{doc.size} · {doc.time}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                doc.status === 'indexed' ? "bg-green-100 text-green-700" : 
                doc.status === 'splitting' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              )}>
                {doc.status === 'indexed' ? '已索引' : doc.status === 'splitting' ? '正在拆分' : '错误'}
              </span>
              <ChevronRight className="size-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

const GraphView = () => {
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
        
        <svg className="w-full h-full absolute inset-0 z-0" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <line x1="200" y1="300" x2="100" y2="150" className="stroke-slate-300" strokeWidth="1.5" />
          <line x1="200" y1="300" x2="300" y2="200" className="stroke-slate-300" strokeWidth="1.5" />
          <line x1="200" y1="300" x2="280" y2="450" className="stroke-slate-300" strokeWidth="1.5" />
          <line x1="100" y1="150" x2="50" y2="250" className="stroke-slate-300" strokeWidth="1" strokeDasharray="4" />
          
          <circle cx="200" cy="300" r="45" className="fill-primary/20 stroke-primary" strokeWidth="2" />
          <text x="200" y="305" textAnchor="middle" className="fill-slate-900 font-bold text-[14px]">神经网络</text>
          
          <circle cx="100" cy="150" r="35" className="fill-slate-200 stroke-slate-400" strokeWidth="1.5" />
          <text x="100" y="155" textAnchor="middle" className="fill-slate-700 text-[12px]">量子物理</text>
          
          <circle cx="300" cy="200" r="30" className="fill-slate-200 stroke-slate-400" strokeWidth="1.5" />
          <text x="300" y="205" textAnchor="middle" className="fill-slate-700 text-[12px]">AI 伦理</text>
          
          <circle cx="280" cy="450" r="32" className="fill-slate-200 stroke-slate-400" strokeWidth="1.5" />
          <text x="280" y="455" textAnchor="middle" className="fill-slate-700 text-[12px]">大语言模型</text>
        </svg>

        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">视图模式</p>
            <div className="flex gap-2">
              <button className="bg-primary text-white text-xs px-3 py-1 rounded-full">3D 探索</button>
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
                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">核心实体</span>
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
};

const ChatView = () => {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light">
      <header className="flex items-center bg-background-light/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-slate-200">
        <div className="flex size-10 shrink-0 items-center justify-center text-slate-600 cursor-pointer">
          <Menu className="size-6" />
        </div>
        <h2 className="font-serif text-xl font-bold flex-1 text-center text-slate-900">Kmap</h2>
        <div className="flex size-10 items-center justify-end text-slate-600 cursor-pointer">
          <Edit3 className="size-6" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8 max-w-3xl mx-auto w-full pb-32">
        <div className="text-center py-4">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">今天</span>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="max-w-[85%] bg-slate-100 rounded-2xl px-5 py-3 text-slate-800 leading-relaxed shadow-sm">
            请帮我写一段关于人工智能未来的简短描述，字数控制在100字左右。
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Network className="size-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-500">Claude</span>
            </div>
            <div className="text-lg font-normal leading-loose text-slate-900">
              人工智能的未来将从“工具”演变为“协作伙伴”。它将深度融入医疗、能源与教育领域，通过对海量数据的精准解析，破解人类文明面临的复杂难题。未来的AI不仅是效率的跃升，更是人类创造力的延伸，引领我们进入一个智慧互联、共同进化且充满无限可能的新纪元。
            </div>
            <div className="flex gap-4 pt-2">
              <button className="text-slate-400 hover:text-primary transition-colors"><Copy className="size-5" /></button>
              <button className="text-slate-400 hover:text-primary transition-colors"><ThumbsUp className="size-5" /></button>
              <button className="text-slate-400 hover:text-primary transition-colors"><RefreshCw className="size-5" /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="max-w-[85%] bg-slate-100 rounded-2xl px-5 py-3 text-slate-800 leading-relaxed shadow-sm">
            听起来很宏大。能具体谈谈它对普通人日常生活的影响吗？
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background-light via-background-light to-transparent pb-safe">
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-2 pl-4">
            <button className="text-slate-400 hover:text-slate-600">
              <PlusCircle className="size-6" />
            </button>
            <textarea 
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 px-3 py-2 resize-none max-h-32" 
              placeholder="向 Kmap 提问..." 
              rows={1}
            />
            <button className="bg-primary text-white size-10 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors">
              <ArrowUp className="size-5" />
            </button>
          </div>
        </div>
        <div className="h-20" /> {/* Spacer for BottomNav */}
      </div>
    </div>
  );
};

const SettingsView = () => {
  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-[#fcfaf8]/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeft className="size-6 text-slate-600 cursor-pointer" />
          <h1 className="text-lg font-semibold font-serif">Kmap</h1>
        </div>
        <button className="text-primary font-medium text-sm">保存</button>
      </header>

      <main className="max-w-2xl mx-auto w-full p-4 space-y-8">
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif mb-1">语言模型 (LLM)</h2>
            <p className="text-sm text-slate-500">选择并配置为您提供对话服务的主模型。</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">服务商</label>
            <div className="flex p-1 bg-slate-200/50 rounded-xl">
              <button className="flex-1 py-2 text-sm font-medium rounded-lg bg-white shadow-sm">OpenAI</button>
              <button className="flex-1 py-2 text-sm font-medium text-slate-500">本地模型</button>
              <button className="flex-1 py-2 text-sm font-medium text-slate-500">自定义</button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">选择模型</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                <option>gpt-4o</option>
                <option>gpt-4-turbo</option>
                <option>gpt-3.5-turbo</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none size-5" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">API 密钥</label>
            <div className="relative">
              <input 
                type="password" 
                value="••••••••••••••••••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="sk-..." 
              />
              <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 size-5" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">温度 (Temperature)</label>
              <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-primary">0.7</span>
            </div>
            <input 
              type="range" 
              min="0" max="2" step="0.1" defaultValue="0.7"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
            />
            <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              <span>更精确</span>
              <span>更具创造力</span>
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif mb-1">向量模型 (Embedding)</h2>
            <p className="text-sm text-slate-500">用于知识库检索和文档处理。建议选择稳定的模型。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">模型</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option>text-embedding-3-small</option>
                  <option>text-embedding-3-large</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none size-5" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">向量维度</label>
              <input type="text" value="1536" readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500" />
            </div>
          </div>
        </section>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4">
          <Info className="size-6 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800">正在使用 OpenAI 全局配置</p>
            <p className="text-xs text-slate-500 leading-relaxed">您的配置将同步到所有关联的知识库。如果您在本地运行 Ollama，请确保已在跨域设置中允许当前域名。</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [currentTab, setTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-background-light">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentTab === 'home' && <Dashboard />}
          {currentTab === 'docs' && <DocumentsView />}
          {currentTab === 'graph' && <GraphView />}
          {currentTab === 'chat' && <ChatView />}
          {currentTab === 'settings' && <SettingsView />}
        </motion.div>
      </AnimatePresence>
      <BottomNav currentTab={currentTab} setTab={setTab} />
    </div>
  );
}
