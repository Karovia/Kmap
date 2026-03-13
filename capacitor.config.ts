import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karovia.kmap',
  appName: 'Kmap',
  webDir: 'dist',
  android: {
    path: 'android',
    allowMixedContent: true,
    hardwareAcceleration: true,
    buildOptions: {
      keystorePath: './kmap-release.jks',
      keystoreAlias: 'kmap',
      releaseType: 'APK'
    }
  },
  plugins: {
    Filesystem: {
      androidLegacyExternalStorage: true
    }
  }
};

export default config;
