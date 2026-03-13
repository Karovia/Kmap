import type { LocalInferencePlugin } from './localInference';

export class LocalInferenceWeb implements LocalInferencePlugin {
  async isAvailable(): Promise<{ available: boolean }> {
    // Web平台不支持本地推理，返回false
    return { available: false };
  }

  async chat(options: { message: string }): Promise<{ response: string }> {
    throw new Error('Local inference not available on web platform');
  }

  async embed(options: { text: string }): Promise<{ embedding: number[] }> {
    throw new Error('Local inference not available on web platform');
  }
}
