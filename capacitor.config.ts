import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreamjournal.app',
  appName: 'Dream Journal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2d1b69",
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#2d1b69"
    }
  }
};

export default config;
