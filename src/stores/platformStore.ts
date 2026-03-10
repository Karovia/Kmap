import { create } from 'zustand';
import type { PermissionState } from '../platform/types';

interface PlatformStoreState {
  isNativeApp: boolean;
  storagePermission: PermissionState;
  setNativeApp: (isNativeApp: boolean) => void;
  setStoragePermission: (permission: PermissionState) => void;
}

export const usePlatformStore = create<PlatformStoreState>(set => ({
  isNativeApp: false,
  storagePermission: 'prompt',
  setNativeApp: isNativeApp => set({ isNativeApp }),
  setStoragePermission: storagePermission => set({ storagePermission }),
}));
