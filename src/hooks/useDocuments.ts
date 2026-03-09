import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api } from '../services/api';
import type { Document, DocumentStatus } from '../types/domain';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
  'text/markdown',
  '',
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'csv', 'txt', 'md'];

export function useDocuments() {
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
  const statusPollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const startStatusPolling = (documentId: string) => {
    if (statusPollingRef.current[documentId]) {
      clearInterval(statusPollingRef.current[documentId]);
    }

    statusPollingRef.current[documentId] = setInterval(async () => {
      try {
        const updatedDoc = await api.getDocumentStatus(documentId);
        setDocuments(prev => prev.map(doc => (doc.id === documentId ? updatedDoc : doc)));

        if (updatedDoc.status === 'indexed' || updatedDoc.status === 'error') {
          clearInterval(statusPollingRef.current[documentId]);
          delete statusPollingRef.current[documentId];
        }
      } catch (err) {
        console.error('获取文档状态失败:', err);
      }
    }, 3000);
  };

  const stopAllPolling = () => {
    for (const documentId in statusPollingRef.current) {
      clearInterval(statusPollingRef.current[documentId]);
    }
    statusPollingRef.current = {};
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDocuments();
      setDocuments(data);

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

  useEffect(() => {
    loadDocuments();
    return () => stopAllPolling();
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.includes('.')
      ? (file.name.split('.').pop()?.toLowerCase() ?? '')
      : '';

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
      setError('不支持的文件类型。支持的类型：PDF, DOCX, CSV, TXT, MD');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      setSuccess(null);

      const newDoc = await api.uploadDocument(file, progress => {
        setUploadProgress(progress);
      });

      setSuccess(`文件 "${file.name}" 上传成功`);
      setDocuments(prev => [newDoc, ...prev]);
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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除文档 "${name}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);
      await api.deleteDocument(id);

      if (statusPollingRef.current[id]) {
        clearInterval(statusPollingRef.current[id]);
        delete statusPollingRef.current[id];
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setSuccess('文档已删除');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const filters: { value: DocumentStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'splitting', label: '分片中' },
    { value: 'embedding', label: '向量化中' },
    { value: 'indexed', label: '已索引' },
    { value: 'error', label: '错误' },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || doc.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return {
    loading,
    uploading,
    uploadProgress,
    error,
    success,
    searchQuery,
    activeFilter,
    deletingId,
    fileInputRef,
    filters,
    filteredDocuments,
    setSearchQuery,
    setActiveFilter,
    handleFileUpload,
    handleDelete,
  };
}
