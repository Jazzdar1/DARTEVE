import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartv.app',
  appName: 'DarTV',
  webDir: 'dist',
  // 👇 This is the magic part that unblocks the video streams 👇
  server: {
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;