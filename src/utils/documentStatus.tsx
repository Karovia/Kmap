import React from 'react';
import { BrainCircuit, CheckCircle2, Clock, Info, Scissors, XCircle } from 'lucide-react';
import type { DocumentStatus } from '../types/domain';

export function getStatusInfo(status: DocumentStatus): {
  label: string;
  color: string;
  icon: React.ElementType;
} {
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
