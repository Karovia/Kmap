import { Capacitor } from '@capacitor/core';
import LocalInference from '@/plugins/localInference';

class InferenceService {
  private localAvailable = false;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    // 检查是否在原生平台且本地推理可用
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalInference.isAvailable();
        this.localAvailable = result.available;
        console.log('[InferenceService] Local inference available:', this.localAvailable);
      } catch (error) {
        console.warn('[InferenceService] Failed to check local inference availability:', error);
        this.localAvailable = false;
      }
    }

    this.initialized = true;
  }

  async chat(message: string): Promise<string> {
    await this.initialize();

    if (this.localAvailable) {
      // 使用本地推理
      try {
        const result = await LocalInference.chat({ message });
        return result.response;
      } catch (error) {
        console.error('[InferenceService] Local chat failed:', error);
        throw new Error('本地推理失败，请检查模型是否正确加载');
      }
    } else {
      // 使用远程API
      throw new Error('远程API调用暂未实现，请使用本地推理模式');
    }
  }

  async embed(text: string): Promise<number[]> {
    await this.initialize();

    if (this.localAvailable) {
      // 使用本地嵌入
      try {
        const result = await LocalInference.embed({ text });
        return result.embedding;
      } catch (error) {
        console.error('[InferenceService] Local embedding failed:', error);
        throw new Error('本地向量化失败，请检查模型是否正确加载');
      }
    } else {
      // 使用远程API
      throw new Error('远程API调用暂未实现，请使用本地推理模式');
    }
  }

  isLocalAvailable(): boolean {
    return this.localAvailable;
  }
}

export const inferenceService = new InferenceService();
