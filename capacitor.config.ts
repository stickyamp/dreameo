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
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
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
