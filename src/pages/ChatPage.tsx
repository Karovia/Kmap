import {
  ArrowUp,
  Copy,
  Edit3,
  LoaderCircle,
  Menu,
  Network,
  PlusCircle,
  RefreshCw,
  ThumbsUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../services/api';
import type { ChatMessage } from '../types/domain';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    content: '你好，我是 Kmap 助手。你可以直接向我提问，我会基于当前默认 chat 模型返回回答。',
  },
];

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('Kmap');

  const canSubmit = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const userMessage = createMessage('user', content);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const result = await api.sendChat(nextMessages);
      setProviderName(result.providerName || 'Kmap');
      setMessages(prev => [...prev, createMessage('assistant', result.reply)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light">
      <header className="sticky top-0 z-10 flex items-center border-b border-slate-200 bg-background-light/80 p-4 backdrop-blur-md">
        <div className="flex size-10 shrink-0 items-center justify-center text-slate-600">
          <Menu className="size-6" />
        </div>
        <h2 className="flex-1 text-center font-serif text-xl font-bold text-slate-900">Kmap</h2>
        <div className="flex size-10 items-center justify-end text-slate-600">
          <Edit3 className="size-6" />
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-3xl space-y-6 overflow-y-auto p-4 pb-32">
        <div className="py-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">今天</span>
        </div>

        {messages.map(message => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex flex-col items-end gap-2">
                <div className="max-w-[85%] rounded-2xl bg-slate-100 px-5 py-3 leading-relaxed text-slate-800 shadow-sm">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                    <Network className="size-3 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{providerName}</span>
                </div>
                <div className="whitespace-pre-wrap text-base leading-loose text-slate-900">
                  {message.content}
                </div>
                <div className="flex gap-4 pt-2">
                  <button className="text-slate-400 transition-colors hover:text-primary">
                    <Copy className="size-5" />
                  </button>
                  <button className="text-slate-400 transition-colors hover:text-primary">
                    <ThumbsUp className="size-5" />
                  </button>
                  <button className="text-slate-400 transition-colors hover:text-primary">
                    <RefreshCw className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <LoaderCircle className="size-4 animate-spin" />
            正在等待模型响应...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background-light via-background-light to-transparent pb-safe">
        <div className="mx-auto mb-4 max-w-3xl px-4">
          <div className="relative flex items-end overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-xl">
            <button className="pb-2 text-slate-400 hover:text-slate-600">
              <PlusCircle className="size-6" />
            </button>
            <textarea
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              className="max-h-32 flex-1 resize-none border-none bg-transparent px-3 py-2 text-slate-900 focus:ring-0"
              placeholder="向 Kmap 提问..."
              rows={1}
            />
            <button
              onClick={() => void handleSend()}
              disabled={!canSubmit}
              className="flex size-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ArrowUp className="size-5" />
            </button>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}
