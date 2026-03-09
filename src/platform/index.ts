import type { PickedDocument, PlatformBridge, PlatformResult } from './types';

async function pickDocument(): Promise<PlatformResult<PickedDocument>> {
  return {
    success: false,
    error: '当前尚未接入 Android 原生文件选择能力',
  };
}

export const platformBridge: PlatformBridge = {
  isNativeApp: false,
  pickDocument,
};
