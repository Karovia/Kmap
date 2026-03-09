import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Info,
  KeyRound,
  Link2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const chatSteps = [
  '在火山方舟控制台创建可用的 Anthropic 兼容对话模型 Endpoint。',
  '在设置页选择“对话模型”，服务商类型选择“Claude”。',
  'Base URL 填写 `https://ark.cn-beijing.volces.com/api/coding`。',
  '模型名称填写实际可用模型，例如 `ark-code-latest`。',
  '填入 API Key 后点击“测试连接”，返回成功后再设为默认。',
];

const embeddingSteps = [
  '在火山方舟控制台创建多模态 Embedding Endpoint，并记录真实的 Endpoint ID。',
  '在设置页选择“Embedding 模型”，服务商类型选择“自定义”。',
  'Base URL 填写 `https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal`。',
  '模型名称必须填写真实 Endpoint ID，例如 `ep-20260309221615-mfzdl`，不要写通用模型别名。',
  '点击“测试连接”，成功后会返回向量维度信息。',
];

export function ProviderGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f3ee] pb-24">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#f6f3ee]/85 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="rounded-full p-2 text-slate-600 transition-colors hover:bg-white"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="font-serif text-lg font-semibold text-slate-900">模型配置指南</h1>
            <p className="text-xs text-slate-500">对话模型与 Embedding 模型的详细配置教程</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">开始前先确认这 3 件事</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                只有 API Key、Base URL、模型名称三者同时正确，测试连接才会成功。
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <KeyRound className="mb-3 size-5 text-slate-700" />
              <p className="text-sm font-medium text-slate-900">API Key</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                必须是当前服务商控制台签发且仍有效的 Key。
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Link2 className="mb-3 size-5 text-slate-700" />
              <p className="text-sm font-medium text-slate-900">Base URL</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                必须填接口根地址或指定文档要求的固定地址，不能随意拼接。
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Sparkles className="mb-3 size-5 text-slate-700" />
              <p className="text-sm font-medium text-slate-900">模型名称</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                很多平台要求填写真实 Endpoint ID，而不是模型宣传名。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-serif text-xl font-bold text-slate-900">火山方舟对话模型配置</h2>
          <div className="space-y-3">
            {chatSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-4" />
              <span className="text-sm font-semibold">推荐示例</span>
            </div>
            <p className="text-sm text-emerald-800">类型：`Claude`</p>
            <p className="text-sm text-emerald-800">
              Base URL：`https://ark.cn-beijing.volces.com/api/coding`
            </p>
            <p className="text-sm text-emerald-800">模型名称：`ark-code-latest`</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-serif text-xl font-bold text-slate-900">
            火山方舟 Embedding 模型配置
          </h2>
          <div className="space-y-3">
            {embeddingSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <CheckCircle2 className="size-4" />
              <span className="text-sm font-semibold">推荐示例</span>
            </div>
            <p className="text-sm text-blue-800">类型：`自定义`</p>
            <p className="text-sm text-blue-800">
              Base URL：`https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal`
            </p>
            <p className="text-sm text-blue-800">模型名称：`ep-20260309221615-mfzdl`</p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <Info className="size-4" />
              <span className="text-sm font-semibold">常见错误</span>
            </div>
            <p className="text-sm text-amber-800">
              如果返回
              `InvalidEndpointOrModel.NotFound`，通常说明你填写的是通用模型名，而不是控制台里的真实
              Endpoint ID。
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-serif text-xl font-bold text-slate-900">操作建议</h2>
          <div className="space-y-2 text-sm leading-relaxed text-slate-600">
            <p>1. 先添加供应商，再点击“测试连接”，最后再设置为默认。</p>
            <p>2. 如果是火山方舟 Embedding，请优先复制 Endpoint ID，避免手输错误。</p>
            <p>
              3. 如果模型能在供应商控制台调用，但页面测试失败，优先检查 Base URL
              是否多写或少写了路径。
            </p>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            返回设置页继续配置
            <ExternalLink className="size-4" />
          </button>
        </section>
      </main>
    </div>
  );
}
