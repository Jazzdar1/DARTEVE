import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartv.app',
  appName: 'DarTV',
  webDir: 'dist', // Agar Vite hai to 'dist', warna 'build'
  bundledWebRuntime: false,
  plugins: {
    CapacitorHttp: {
      enabled: true, // 🚀 YEH ON HONA LAZMI HAI CORS BYPASS KE LIYE
    },
  },
  server: {
    cleartext: true, 
    allowNavigation: ["*"]
  },
  android: {
    allowMixedContent: true
  }
};

export default config;