import type { ChatMessage } from '../types/domain';
import { requestJson } from './httpClient';

interface BackendChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface BackendChatResponse {
  success: boolean;
  message: string;
  reply: string;
  provider_name?: string | null;
}

export const chatService = {
  async sendChat(messages: ChatMessage[]): Promise<{ reply: string; providerName?: string }> {
    const payload = {
      messages: messages.map<BackendChatMessage>(message => ({
        role: message.role,
        content: message.content,
      })),
    };

    const data = await requestJson<BackendChatResponse>(
      '/api/v1/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      '发送聊天消息失败'
    );

    return {
      reply: data.reply,
      providerName: data.provider_name ?? undefined,
    };
  },
};
