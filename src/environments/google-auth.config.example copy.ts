/**
 * Google Authentication Configuration Example
 * Copy this file to google-auth.config.ts and add your real credentials
 *
 * To get your credentials:
 * 1. Go to https://console.cloud.google.com/
 * 2. Select your project (dream-journal-32932)
 * 3. Go to "APIs & Services" > "Credentials"
 * 4. Find your OAuth 2.0 Client IDs
 */

export const googleAuthConfig = {
  // Cliente ID para Web (OAuth 2.0)
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",

  // Configuración para plataformas móviles (si las necesitas)
  androidClientId: "", // Si tienes uno específico para Android
  iosClientId: "", // Si tienes uno específico para iOS

  // Scopes necesarios
  scopes: ["profile", "email", "https://www.googleapis.com/auth/drive.appdata"],

  // Opciones adicionales
  grantOfflineAccess: true,
};
