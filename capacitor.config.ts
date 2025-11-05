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
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#000000",
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId:
        "998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound"],
    },
    LocalNotifications: {
      smallIcon: "res://drawable/push_icon", // ← Add this! No .png extension
      iconColor: "#8c30a0ff", // ← Optional: your brand color
    },
  },
  android: {
    // This is important for Android 12+
    allowMixedContent: true,
  },
};

export default config;
