import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dreamjournal.app",
  appName: "Dream Journal",
  webDir: "dist",
  server: {
    androidScheme: "https",
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
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#030014",
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId:
        "62304341423-dsb11i2h2v3o04j6b5ej7j7pmvmong1v.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
