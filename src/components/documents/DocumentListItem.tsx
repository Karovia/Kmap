import { FileText, Loader2, Trash2 } from 'lucide-react';
import type { Document } from '../../types/domain';
import { cn } from '../../utils/cn';
import { getStatusInfo } from '../../utils/documentStatus';
import { formatFileSize, formatTime } from '../../utils/format';

interface DocumentListItemProps {
  doc: Document;
  deleting: boolean;
  onDelete: (id: string, name: string) => void;
}

export function DocumentListItem({ doc, deleting, onDelete }: DocumentListItemProps) {
  const statusInfo = getStatusInfo(doc.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group relative">
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
          doc.type === 'pdf'
            ? 'bg-red-50 text-red-600'
            : doc.type === 'docx'
              ? 'bg-blue-50 text-blue-600'
              : doc.type === 'csv'
                ? 'bg-green-50 text-green-600'
                : doc.type === 'md'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-slate-100 text-slate-600'
        )}
      >
        <FileText className="size-6" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-serif font-medium text-slate-900 truncate">{doc.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {formatFileSize(doc.size)} · {formatTime(doc.uploaded_at)}
          {doc.chunks_count && doc.status === 'indexed' && ` · ${doc.chunks_count} 个分片`}
        </p>

        {doc.status === 'error' && doc.error_message && (
          <p className="text-xs text-red-600 mt-1 truncate">错误：{doc.error_message}</p>
        )}

        {(doc.status === 'splitting' || doc.status === 'embedding') &&
          doc.progress !== undefined && (
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
          )}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
            statusInfo.color
          )}
        >
          {(doc.status === 'pending' ||
            doc.status === 'splitting' ||
            doc.status === 'embedding') && <Loader2 className="size-3 animate-spin" />}
          {doc.status !== 'pending' && doc.status !== 'splitting' && doc.status !== 'embedding' && (
            <StatusIcon className="size-3" />
          )}
          {statusInfo.label}
        </span>

        <button
          onClick={() => onDelete(doc.id, doc.name)}
          disabled={deleting}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          title="删除文档"
        >
          {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
