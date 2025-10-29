import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dreamjournal.app",
  appName: "Dreameo",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 2000,
      backgroundColor: "#000000ff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
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
