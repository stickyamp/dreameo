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
        "998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
