export interface PlatformResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PickedDocument {
  name: string;
  size: number;
  mimeType?: string;
  uri?: string;
}

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
  fileUri?: string;
}

export interface SaveFilePayload {
  fileName: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

export interface PlatformDeviceInfo {
  platform: 'web' | 'android' | 'ios';
  userAgent?: string;
}

export interface PlatformBridge {
  isNativeApp: boolean;
  pickDocument: () => Promise<PlatformResult<PickedDocument>>;
  requestStoragePermission: () => Promise<PlatformResult<PermissionState>>;
  checkStoragePermission: () => Promise<PlatformResult<PermissionState>>;
  shareContent: (payload: SharePayload) => Promise<PlatformResult<boolean>>;
  saveFile: (payload: SaveFilePayload) => Promise<PlatformResult<string>>;
  getDeviceInfo: () => Promise<PlatformResult<PlatformDeviceInfo>>;
}
