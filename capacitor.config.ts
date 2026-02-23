import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartv.app',
  appName: 'DarTV',
  webDir: 'dist', // Agar aap Vite use kar rahe hain to yahan 'dist' hoga. (Agar Create React App hai to 'build' likhein)
  bundledWebRuntime: false,
  plugins: {
    // 🚀 CORS bypass aur custom headers (Referer) ko allow karne ke liye
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    // 🚀 Bina 's' wale (http://) links ko Android mein chalne dene ke liye
    cleartext: true, 
    allowNavigation: ["*"]
  },
  android: {
    allowMixedContent: true
  }
};

export default config;