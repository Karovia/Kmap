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
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Bot,
  BrainCircuit,
  Clock,
  Scissors,
  Upload,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 工具函数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN');
}

function getStatusInfo(status: DocumentStatus): { label: string; color: string; icon: React.ElementType } {
  switch (status) {
    case 'pending':
      return { label: '待处理', color: 'bg-slate-100 text-slate-700', icon: Clock };
    case 'splitting':
      return { label: '分片中', color: 'bg-blue-100 text-blue-700', icon: Scissors };
    case 'embedding':
      return { label: '向量化中', color: 'bg-purple-100 text-purple-700', icon: BrainCircuit };
    case 'indexed':
      return { label: '已索引', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    case 'error':
      return { label: '错误', color: 'bg-red-100 text-red-700', icon: XCircle };
    default:
      return { label: '未知', color: 'bg-slate-100 text-slate-700', icon: Info };
  }
}

// --- Types ---

type Tab = 'home' | 'docs' | 'graph' | 'chat' | 'settings';

type ProviderType = 'openai' | 'gemini' | 'claude' | 'custom';

interface LLMProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl: string;
  model: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type DocumentStatus = 'pending' | 'splitting' | 'embedding' | 'indexed' | 'error';

interface Document {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
  status: DocumentStatus;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'md';
  error_message?: string;
  chunks_count?: number;
  progress?: number;
}

interface Activity {
  id: string;
  title: string;
  time: string;
  detail: string;
  type: 'file' | 'link';
}

// --- API Functions ---
const api = {
  async getProviders(): Promise<LLMProvider[]> {
    const res = await fetch('/api/v1/providers');
    if (!res.ok) throw new Error('获取服务商列表失败');
    return res.json();
  },

  async createProvider(provider: Omit<LLMProvider, 'id'>): Promise<LLMProvider> {
    const res = await fetch('/api/v1/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!res.ok) throw new Error('创建服务商失败');
    return res.json();
  },

  async updateProvider(id: string, provider: Partial<LLMProvider>): Promise<LLMProvider> {
    const res = await fetch(`/api/v1/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!res.ok) throw new Error('更新服务商失败');
    return res.json();
  },

  async deleteProvider(id: string): Promise<void> {
    const res = await fetch(`/api/v1/providers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除服务商失败');
  },

  async testProvider(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/v1/providers/${id}/test`, { method: 'POST' });
    if (!res.ok) throw new Error('测试失败');
    return res.json();
  },

  // 文档相关API
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('上传失败');
    return res.json();
  },

  async getDocuments(): Promise<Document[]> {
    const res = await fetch('/api/v1/documents');
    if (!res.ok) throw new Error('获取文档列表失败');
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除文档失败');
  },

  async getDocumentStatus(id: string): Promise<Document> {
    const res = await fetch(`/api/v1/documents/${id}/status`);
    if (!res.ok) throw new Error('获取文档状态失败');
    return res.json();
  },
};

// --- Mock Data ---

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DocumentStatus | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusPollingRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 加载文档列表
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDocuments();
      setDocuments(data);

      // 为处理中的文档启动状态轮询
      data.forEach(doc => {
        if (doc.status === 'pending' || doc.status === 'splitting' || doc.status === 'embedding') {
          startStatusPolling(doc.id);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文档列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 启动状态轮询
  const startStatusPolling = (documentId: string) => {
    // 如果已经在轮询，先清除
    if (statusPollingRef.current[documentId]) {
      clearInterval(statusPollingRef.current[documentId]);
    }

    // 每3秒查询一次状态
    statusPollingRef.current[documentId] = setInterval(async () => {
      try {
        const updatedDoc = await api.getDocumentStatus(documentId);
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId ? updatedDoc : doc
        ));

        // 如果处理完成或出错，停止轮询
        if (updatedDoc.status === 'indexed' || updatedDoc.status === 'error') {
          clearInterval(statusPollingRef.current[documentId]);
          delete statusPollingRef.current[documentId];
        }
      } catch (err) {
        console.error('获取文档状态失败:', err);
      }
    }, 3000);
  };

  // 停止所有轮询
  const stopAllPolling = () => {
    Object.values(statusPollingRef.current).forEach(interval => clearInterval(interval));
    statusPollingRef.current = {};
  };

  useEffect(() => {
    loadDocuments();
    return () => stopAllPolling();
  }, []);

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件类型。支持的类型：PDF, DOCX, CSV, TXT, MD');
      return;
    }

    // 验证文件大小（最大50MB）
    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setSuccess(null);

      const newDoc = await api.uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess(`文件 "${file.name}" 上传成功`);
      setDocuments(prev => [newDoc, ...prev]);

      // 启动状态轮询
      startStatusPolling(newDoc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理删除文档
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除文档 "${name}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);
      await api.deleteDocument(id);

      // 停止该文档的轮询
      if (statusPollingRef.current[id]) {
        clearInterval(statusPollingRef.current[id]);
        delete statusPollingRef.current[id];
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setSuccess(`文档已删除`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || doc.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filters: { value: DocumentStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'splitting', label: '分片中' },
    { value: 'embedding', label: '向量化中' },
    { value: 'indexed', label: '已索引' },
    { value: 'error', label: '错误' },
  ];

  return (
    <div className="bg-white min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="font-serif text-xl font-bold text-slate-900">文档管理</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 -mr-2 hover:bg-primary/10 rounded-full transition-colors text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.csv,.txt,.md"
            onChange={handleFileUpload}
          />
        </div>

        {/* 上传进度条 */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4"
            >
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">正在上传文件...</span>
                  <span className="text-sm text-primary font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提示信息 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4"
            >
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="size-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4"
            >
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="搜索知识库文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors",
                  activeFilter === filter.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-1">
        {loading ? (
          // 加载骨架屏
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-slate-200 rounded-full" />
            </div>
          ))
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="size-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">暂无文档</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery || activeFilter !== 'all'
                ? '没有找到匹配的文档'
                : '点击右上角上传按钮添加第一个文档'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                上传文档
              </button>
            )}
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const statusInfo = getStatusInfo(doc.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group relative"
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                  doc.type === 'pdf' ? "bg-red-50 text-red-600" :
                  doc.type === 'docx' ? "bg-blue-50 text-blue-600" :
                  doc.type === 'csv' ? "bg-green-50 text-green-600" :
                  doc.type === 'md' ? "bg-purple-50 text-purple-600" :
                  "bg-slate-100 text-slate-600"
                )}>
                  <FileText className="size-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-medium text-slate-900 truncate">{doc.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(doc.size)} · {formatTime(doc.uploaded_at)}
                    {doc.chunks_count && doc.status === 'indexed' && ` · ${doc.chunks_count} 个分片`}
                  </p>

                  {/* 错误信息 */}
                  {doc.status === 'error' && doc.error_message && (
                    <p className="text-xs text-red-600 mt-1 truncate">
                      错误：{doc.error_message}
                    </p>
                  )}

                  {/* 进度条 */}
                  {(doc.status === 'splitting' || doc.status === 'embedding') && doc.progress !== undefined && (
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    statusInfo.color
                  )}>
                    {(doc.status === 'pending' || doc.status === 'splitting' || doc.status === 'embedding') && (
                      <Loader2 className="size-3 animate-spin" />
                    )}
                    {doc.status !== 'pending' && doc.status !== 'splitting' && doc.status !== 'embedding' && (
                      <StatusIcon className="size-3" />
                    )}
                    {statusInfo.label}
                  </span>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="删除文档"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
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
  const [providers, setProviders] = useState<LLMProvider[]>([]);
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
    apiKey: '',
    baseUrl: '',
    model: '',
    isDefault: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // 加载服务商列表
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

  // 处理表单提交
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

  // 处理编辑
  const handleEdit = (provider: LLMProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl,
      model: provider.model,
      isDefault: provider.isDefault,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  // 处理删除
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

  // 处理测试
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

  // 重置表单
  const resetForm = () => {
    setShowForm(false);
    setEditingProvider(null);
    setFormData({
      name: '',
      type: 'openai',
      apiKey: '',
      baseUrl: '',
      model: '',
      isDefault: false,
    });
    setError(null);
    setSuccess(null);
  };

  // 获取服务商类型对应的图标和名称
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
        {/* 提示消息 */}
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

        {/* LLM 服务商配置 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif mb-1">LLM 服务商配置</h2>
              <p className="text-sm text-slate-500">管理您的大语言模型服务商，支持多平台切换。</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" />
              添加服务商
            </button>
          </div>

          {/* 服务商列表 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Settings className="size-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">暂无服务商配置，请点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => {
                const typeInfo = getProviderTypeInfo(provider.type);
                return (
                  <div
                    key={provider.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "size-10 rounded-lg flex items-center justify-center shrink-0",
                          provider.type === 'openai' ? "bg-emerald-50 text-emerald-600" :
                          provider.type === 'gemini' ? "bg-blue-50 text-blue-600" :
                          provider.type === 'claude' ? "bg-purple-50 text-purple-600" :
                          "bg-slate-50 text-slate-600"
                        )}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">{provider.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {typeInfo.label}
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

        {/* 表单弹窗 */}
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
                onClick={(e) => e.stopPropagation()}
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
                  {/* 服务商名称 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">服务商名称</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：公司 OpenAI"
                    />
                  </div>

                  {/* 服务商类型 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">服务商类型</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ProviderType })}
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

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        required
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
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

                  {/* Base URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Base URL (可选)</label>
                    <input
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：https://api.openai.com/v1"
                    />
                  </div>

                  {/* 模型名称 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">模型名称</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="例如：gpt-4o, claude-3-opus, gemini-pro"
                    />
                  </div>

                  {/* 设为默认 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="size-4 text-primary focus:ring-primary border-slate-300 rounded"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">
                      设为默认服务商
                    </label>
                  </div>

                  {/* 按钮 */}
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

        <hr className="border-slate-200" />

        {/* 向量模型配置 */}
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
            <p className="text-sm font-medium text-slate-800">配置说明</p>
            <p className="text-xs text-slate-500 leading-relaxed">您的配置将加密存储在本地，不会上传到第三方服务器。如果您使用本地部署的模型，请确保已在跨域设置中允许当前域名。</p>
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
