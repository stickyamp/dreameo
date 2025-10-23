# Google Sign-In Setup Guide

Esta guía explica cómo configurar Google Sign-In para la aplicación Dream Journal.

## Pre-requisitos

1. Cuenta de Firebase configurada
2. Proyecto de Firebase conectado a tu app
3. Google Cloud Console acceso al proyecto

## Pasos de Configuración

### 1. Configurar Firebase Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `dreameo`
3. Ve a **Authentication** → **Sign-in method**
4. Habilita el proveedor **Google**
5. Guarda la configuración

### 2. Obtener el Web Client ID

1. En Firebase Console, ve a **Project Settings** (⚙️)
2. En la pestaña **General**, busca la sección **Your apps**
3. Si no tienes una app web, crea una con el botón "Add app" → Web
4. En la configuración de Firebase, encontrarás algo como:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     // ... otros campos
   };
   ```
5. Ve a [Google Cloud Console](https://console.cloud.google.com/)
6. Selecciona tu proyecto
7. Ve a **APIs & Services** → **Credentials**
8. Busca el **Web client** que termina en `.apps.googleusercontent.com`
9. Copia el **Client ID** completo

### 3. Configurar el archivo environment.ts

Edita el archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890",
  },
};
```

### 4. Configurar capacitor.config.ts

Edita el archivo `capacitor.config.ts` y reemplaza `YOUR_WEB_CLIENT_ID` con tu Client ID:

```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: 'TU_CLIENT_ID.apps.googleusercontent.com',
  forceCodeForRefreshToken: true
}
```

### 5. Configurar firebase-auth.service.ts

Edita el archivo `src/app/shared/services/firebase-auth.service.ts` y actualiza el método `initializeGoogleAuth()`:

```typescript
private initializeGoogleAuth() {
  GoogleAuth.initialize({
    clientId: 'TU_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}
```

### 6. Configurar Android (si aplica)

Para Android, necesitas agregar el SHA-1 fingerprint de tu app:

1. Genera el SHA-1:

   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Copia el SHA-1 del `debug` keystore

3. Ve a Firebase Console → **Project Settings** → **Your apps**

4. Selecciona tu app Android

5. Agrega el SHA-1 fingerprint

6. Descarga el nuevo `google-services.json` y reemplázalo en `android/app/`

### 7. Configurar iOS (si aplica)

1. Ve a Firebase Console → **Project Settings** → **Your apps**

2. Selecciona tu app iOS

3. Descarga el `GoogleService-Info.plist`

4. Agrega el archivo a tu proyecto iOS

5. En Xcode, agrega el URL scheme:
   - Abre `ios/App/App/Info.plist`
   - Agrega el `REVERSED_CLIENT_ID` de tu `GoogleService-Info.plist`

### 8. Sincronizar Capacitor

Después de configurar todo, ejecuta:

```bash
# Sincronizar cambios
npx cap sync

# Para Android
npx cap sync android

# Para iOS
npx cap sync ios
```

### 9. Probar la Autenticación

1. Inicia la aplicación:

   ```bash
   npm start
   # o para dispositivo
   npx cap run android
   npx cap run ios
   ```

2. Ve a la página de login

3. Haz clic en "Continuar con Google"

4. Selecciona tu cuenta de Google

5. Deberías ser redirigido a la página principal de la app

## Troubleshooting

### Error: "popup_closed_by_user"

- El usuario canceló el flujo de autenticación
- Esto es normal, no requiere acción

### Error: "Invalid client ID"

- Verifica que el Client ID sea correcto
- Asegúrate de usar el Web Client ID, no el Android o iOS Client ID
- Verifica que no haya espacios al inicio o final

### Error: "API key not valid"

- Verifica que las credenciales de Firebase sean correctas
- Asegúrate de que Google Sign-In esté habilitado en Firebase Console

### Error en Android: "Developer error"

- Verifica que el SHA-1 fingerprint esté configurado en Firebase
- Descarga el nuevo `google-services.json` después de agregar el SHA-1
- Ejecuta `npx cap sync android`

### No funciona en Web

- El plugin funciona automáticamente en web
- Asegúrate de que el dominio esté autorizado en Google Cloud Console
- Ve a **APIs & Services** → **Credentials** → selecciona tu Web Client
- Agrega `http://localhost:8100` en **Authorized JavaScript origins**

## Recursos Adicionales

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Notas Importantes

1. **Nunca** subas tus credenciales de Firebase al repositorio público
2. Considera usar variables de entorno para las credenciales en producción
3. El Web Client ID debe ser el mismo en todos los archivos de configuración
4. Recuerda ejecutar `npx cap sync` después de cualquier cambio en la configuración

