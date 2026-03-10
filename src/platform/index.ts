import { usePlatformStore } from '../stores/platformStore';
import type {
  PermissionState,
  PickedDocument,
  PlatformBridge,
  PlatformDeviceInfo,
  PlatformResult,
  SaveFilePayload,
  SharePayload,
} from './types';

function detectNativeApp(): boolean {
  const maybeCapacitor = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  return Boolean(maybeCapacitor?.isNativePlatform?.());
}

function getCurrentPermission(): PermissionState {
  return usePlatformStore.getState().storagePermission;
}

async function pickDocument(): Promise<PlatformResult<PickedDocument>> {
  return {
    success: false,
    error: '当前尚未接入 Android 原生文件选择能力',
  };
}

async function requestStoragePermission(): Promise<PlatformResult<PermissionState>> {
  if (!detectNativeApp()) {
    usePlatformStore.getState().setStoragePermission('unavailable');
    return {
      success: true,
      data: 'unavailable',
    };
  }

  return {
    success: false,
    error: '当前尚未接入 Android 存储权限申请能力',
  };
}

async function checkStoragePermission(): Promise<PlatformResult<PermissionState>> {
  return {
    success: true,
    data: getCurrentPermission(),
  };
}

async function shareContent(payload: SharePayload): Promise<PlatformResult<boolean>> {
  if (!payload.text && !payload.url && !payload.fileUri) {
    return {
      success: false,
      error: '分享内容不能为空',
    };
  }

  if (navigator.share) {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return {
      success: true,
      data: true,
    };
  }

  return {
    success: false,
    error: '当前环境不支持系统分享，请在 Android 宿主中使用',
  };
}

async function saveFile(payload: SaveFilePayload): Promise<PlatformResult<string>> {
  if (!payload.fileName) {
    return {
      success: false,
      error: '文件名不能为空',
    };
  }

  if (!payload.content) {
    return {
      success: false,
      error: '文件内容不能为空',
    };
  }

  const blob = new Blob([payload.content], {
    type: payload.encoding === 'base64' ? 'application/octet-stream' : 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = payload.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return {
    success: true,
    data: payload.fileName,
  };
}

async function getDeviceInfo(): Promise<PlatformResult<PlatformDeviceInfo>> {
  if (detectNativeApp()) {
    return {
      success: true,
      data: {
        platform: 'android',
      },
    };
  }

  return {
    success: true,
    data: {
      platform: 'web',
      userAgent: navigator.userAgent,
    },
  };
}

const isNativeApp = detectNativeApp();
usePlatformStore.getState().setNativeApp(isNativeApp);

export const platformBridge: PlatformBridge = {
  isNativeApp,
  pickDocument,
  requestStoragePermission,
  checkStoragePermission,
  shareContent,
  saveFile,
  getDeviceInfo,
};
