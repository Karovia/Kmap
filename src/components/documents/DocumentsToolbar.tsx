import React from 'react';
import { ArrowLeft, Loader2, Search, Upload } from 'lucide-react';
import type { DocumentStatus } from '../../types/domain';
import { cn } from '../../utils/cn';

interface DocumentsToolbarProps {
  uploading: boolean;
  uploadProgress: number;
  searchQuery: string;
  activeFilter: DocumentStatus | 'all';
  filters: { value: DocumentStatus | 'all'; label: string }[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: DocumentStatus | 'all') => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNativeFilePick?: () => void;
  isNativeApp?: boolean;
}

export function DocumentsToolbar(props: DocumentsToolbarProps) {
  const {
    uploading,
    uploadProgress,
    searchQuery,
    activeFilter,
    filters,
    fileInputRef,
    onSearchChange,
    onFilterChange,
    onFileUpload,
    onNativeFilePick,
    isNativeApp,
  } = props;

  const handleUploadClick = () => {
    if (isNativeApp && onNativeFilePick) {
      onNativeFilePick();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <button className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="font-serif text-xl font-bold text-slate-900">文档管理</h1>
        <button
          onClick={handleUploadClick}
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
          onChange={onFileUpload}
        />
      </div>

      {uploading && (
        <div className="mb-4 bg-primary/5 rounded-lg p-3">
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
      )}

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="搜索知识库文件..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors',
                activeFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
