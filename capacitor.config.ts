import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dreamt.moonstick.app",
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
      // IMPORTANTE: Este debe ser el Web Client ID (tipo 3) para que Firebase pueda validar el token
      serverClientId:
        "998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
      // El androidClientId se configura automáticamente desde google-services.json
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound"],
    },
    LocalNotifications: {
      smallIcon: "ic_notification_small",
      iconColor: "#FFFFFF",
    },
  },
  android: {
    // This is important for Android 12+
    allowMixedContent: true,
  },
};

export default config;
