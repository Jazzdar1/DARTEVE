import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartv.app',
  appName: 'DarTV',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  // 👇 This will unlock the rest of the channels on the mobile app 👇
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;