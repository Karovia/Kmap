import { registerPlugin } from '@capacitor/core';

export interface LocalInferencePlugin {
  isAvailable(): Promise<{ available: boolean }>;
  chat(options: { message: string }): Promise<{ response: string }>;
  embed(options: { text: string }): Promise<{ embedding: number[] }>;
}

const LocalInference = registerPlugin<LocalInferencePlugin>('LocalInference', {
  web: () => import('./localInference.web').then(m => new m.LocalInferenceWeb()),
});

export default LocalInference;
