import { FilePicker } from '@capawesome/capacitor-file-picker';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
  return Capacitor.isNativePlatform();
}

function mapPermission(value: string | undefined): PermissionState {
  if (value === 'granted') return 'granted';
  if (value === 'denied') return 'denied';
  if (value === 'prompt') return 'prompt';
  return 'unavailable';
}

function getCurrentPermission(): PermissionState {
  return usePlatformStore.getState().storagePermission;
}

function pickFileOnWeb(): Promise<PlatformResult<PickedDocument>> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.csv,.txt,.md';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ success: false, error: '未选择文件' });
        return;
      }

      resolve({
        success: true,
        data: {
          name: file.name,
          size: file.size,
          mimeType: file.type,
        },
      });
    };
    input.click();
  });
}

async function pickDocument(): Promise<PlatformResult<PickedDocument>> {
  if (!detectNativeApp()) {
    return pickFileOnWeb();
  }

  try {
    const result = await FilePicker.pickFiles({
      limit: 1,
      readData: false,
      types: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
        'text/plain',
        'text/markdown',
      ],
    });

    const file = result.files?.[0];
    if (!file) {
      return { success: false, error: '未获取到文件' };
    }

    return {
      success: true,
      data: {
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        uri: file.path,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件选择失败',
    };
  }
}

async function readFileContent(uri: string): Promise<PlatformResult<string>> {
  if (!uri) {
    return {
      success: false,
      error: '文件路径不能为空',
    };
  }

  if (!detectNativeApp()) {
    return {
      success: false,
      error: '当前平台不支持原生文件读取',
    };
  }

  try {
    const result = await Filesystem.readFile({ path: uri });
    if (typeof result.data !== 'string' || result.data.length === 0) {
      return {
        success: false,
        error: '未读取到有效的文件内容',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '读取原生文件内容失败',
    };
  }
}

async function requestStoragePermission(): Promise<PlatformResult<PermissionState>> {
  if (!detectNativeApp()) {
    usePlatformStore.getState().setStoragePermission('unavailable');
    return {
      success: true,
      data: 'unavailable',
    };
  }

  try {
    const permissions = await Filesystem.requestPermissions();
    const permission = mapPermission(permissions.publicStorage);
    usePlatformStore.getState().setStoragePermission(permission);
    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '申请存储权限失败',
    };
  }
}

async function checkStoragePermission(): Promise<PlatformResult<PermissionState>> {
  if (!detectNativeApp()) {
    return {
      success: true,
      data: getCurrentPermission(),
    };
  }

  try {
    const permissions = await Filesystem.checkPermissions();
    const permission = mapPermission(permissions.publicStorage);
    usePlatformStore.getState().setStoragePermission(permission);
    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '检查存储权限失败',
    };
  }
}

async function shareContent(payload: SharePayload): Promise<PlatformResult<boolean>> {
  if (!payload.text && !payload.url && !payload.fileUri) {
    return {
      success: false,
      error: '分享内容不能为空',
    };
  }

  try {
    await Share.share({
      title: payload.title,
      text: payload.text,
      url: payload.fileUri || payload.url,
      dialogTitle: payload.title ?? '分享内容',
    });

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '分享失败',
    };
  }
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

  try {
    if (detectNativeApp()) {
      const result = await Filesystem.writeFile({
        path: payload.fileName,
        data: payload.content,
        directory: Directory.Documents,
      });

      return {
        success: true,
        data: result.uri,
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存文件失败',
    };
  }
}

async function getDeviceInfo(): Promise<PlatformResult<PlatformDeviceInfo>> {
  const platform = Capacitor.getPlatform();

  if (platform === 'android' || platform === 'ios') {
    return {
      success: true,
      data: {
        platform,
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

async function registerBackButtonHandler(handler: () => void): Promise<PlatformResult<boolean>> {
  if (!detectNativeApp()) {
    return {
      success: true,
      data: false,
    };
  }

  try {
    await CapacitorApp.addListener('backButton', () => {
      handler();
    });

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册返回键监听失败',
    };
  }
}

const isNativeApp = detectNativeApp();
usePlatformStore.getState().setNativeApp(isNativeApp);

export const platformBridge: PlatformBridge = {
  isNativeApp,
  pickDocument,
  readFileContent,
  requestStoragePermission,
  checkStoragePermission,
  shareContent,
  saveFile,
  getDeviceInfo,
  registerBackButtonHandler,
};
