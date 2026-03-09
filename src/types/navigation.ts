import type { LucideIcon } from 'lucide-react';
import { FolderOpen, Home, MessageSquare, Network, Settings } from 'lucide-react';

export type Tab = 'home' | 'docs' | 'graph' | 'chat' | 'settings';

export interface NavItem {
  id: Tab;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', path: '/', icon: Home },
  { id: 'docs', label: '文档', path: '/documents', icon: FolderOpen },
  { id: 'chat', label: '对话', path: '/chat', icon: MessageSquare },
  { id: 'graph', label: '图谱', path: '/graph', icon: Network },
  { id: 'settings', label: '设置', path: '/settings', icon: Settings },
];
