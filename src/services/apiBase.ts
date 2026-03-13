import { Capacitor } from '@capacitor/core';

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export function resolveApiUrl(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = normalizePath(path);

  if (configuredApiBaseUrl) {
    return `${normalizeBaseUrl(configuredApiBaseUrl)}${normalizedPath}`;
  }

  if (Capacitor.isNativePlatform()) {
    console.warn(
      '[api] Native platform is using relative API paths. Set VITE_API_BASE_URL to a reachable backend URL.'
    );
  }

  return normalizedPath;
}

