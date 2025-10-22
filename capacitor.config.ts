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
      launchShowDuration: 3000,
      backgroundColor: "#030014",
      showSpinner: false,
      androidSplashResourceName: "splash_simple",
      splashFullScreen: true,
      splashImmersive: true,
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#030014"
    }
  }
};

export default config;
