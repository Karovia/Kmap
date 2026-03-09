import { ArrowUp, Copy, Edit3, Menu, Network, PlusCircle, RefreshCw, ThumbsUp } from 'lucide-react';

export function ChatPage() {
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
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            今天
          </span>
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
              <button className="text-slate-400 hover:text-primary transition-colors">
                <Copy className="size-5" />
              </button>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <ThumbsUp className="size-5" />
              </button>
              <button className="text-slate-400 hover:text-primary transition-colors">
                <RefreshCw className="size-5" />
              </button>
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
        <div className="h-20" />
      </div>
    </div>
  );
}
