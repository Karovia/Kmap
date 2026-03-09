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

export interface PlatformBridge {
  isNativeApp: boolean;
  pickDocument: () => Promise<PlatformResult<PickedDocument>>;
}
