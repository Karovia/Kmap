import { Info } from 'lucide-react';

export function SettingsHintCard() {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-4">
      <Info className="size-6 text-primary shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-800">配置说明</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          您的配置将加密存储在本地，不会上传到第三方服务器。如果您使用本地部署的模型，请确保已在跨域设置中允许当前域名。
        </p>
      </div>
    </div>
  );
}
