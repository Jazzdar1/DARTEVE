import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartv.app',
  appName: 'DarTV',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  // 👇 This new section will permanently kill the browser CORS security 👇
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;