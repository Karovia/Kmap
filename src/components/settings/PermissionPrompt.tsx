import React from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

interface PermissionPromptProps {
  onRequestPermission: () => void;
  onOpenSettings?: () => void;
  message?: string;
}

export function PermissionPrompt({
  onRequestPermission,
  onOpenSettings,
  message = '需要存储权限才能下载和管理本地模型',
}: PermissionPromptProps) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-orange-800 mb-2">需要存储权限</h4>
          <p className="text-sm text-orange-700 mb-3">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={onRequestPermission}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              授予权限
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-orange-700 border border-orange-300 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
              >
                <Settings className="size-3.5" />
                打开设置
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
