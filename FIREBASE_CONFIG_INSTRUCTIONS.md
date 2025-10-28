# Instrucciones para Completar la Configuración de Firebase

Este proyecto ya tiene la configuración básica de Firebase, pero necesitas completar algunos pasos para que funcione completamente.

## Estado Actual

✅ **Configurado:**

- Project ID: `dream-journal-32932`
- Sender ID: `998030673719`
- Google Client ID: `62304341423-dsb11i2h2v3o04j6b5ej7j7pmvmong1v.apps.googleusercontent.com`

⚠️ **Falta configurar:**

- API Key de Firebase
- App ID de Firebase

## Pasos para Completar la Configuración

### 1. Obtener la API Key y App ID

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **dream-journal-32932**
3. Ve a **Configuración del proyecto** (⚙️ icono en el menú lateral)
4. En la sección **Tus aplicaciones**, busca o crea una aplicación web
5. Haz clic en el ícono de configuración (`</>`) para ver las credenciales
6. Copia los valores de:
   - `apiKey`
   - `appId`

### 2. Actualizar el archivo environment.ts

Abre el archivo `src/environments/environment.ts` y reemplaza los valores:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY_AQUI", // Reemplaza esto
    authDomain: "dream-journal-32932.firebaseapp.com",
    projectId: "dream-journal-32932",
    storageBucket: "dream-journal-32932.appspot.com",
    messagingSenderId: "998030673719",
    appId: "TU_APP_ID_AQUI", // Reemplaza esto
  },
};
```

### 3. Habilitar Authentication en Firebase

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Comenzar** si no lo has hecho
3. Habilita los métodos de inicio de sesión:
   - **Email/Password**: Actívalo
   - **Google**: Actívalo

### 4. Configurar Google Sign-In

#### Para Web (desarrollo local):

1. En Firebase Console → Authentication → Sign-in method → Google
2. Asegúrate de que esté habilitado
3. Agrega `localhost` a los dominios autorizados si no está

#### Para Android:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto **dream-journal-32932** (ID: 998030673719)
3. Ve a **APIs & Services** → **Credentials**
4. Crea un **OAuth 2.0 Client ID** para Android:
   - Application type: Android
   - Package name: `com.dreamjournal.app` (o el que uses en tu `capacitor.config.ts`)
   - SHA-1: Obtén tu SHA-1 con el comando:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
5. Agrega el Client ID generado en `src/environments/google-auth.config.ts`:
   ```typescript
   androidClientId: "TU_ANDROID_CLIENT_ID_AQUI";
   ```

#### Para iOS (si lo necesitas):

1. Sigue pasos similares pero para iOS
2. Necesitarás tu Bundle ID

## Archivo de Credenciales Protegido

Las credenciales de Google están protegidas en:

- **Archivo real**: `src/environments/google-auth.config.ts` (en .gitignore)
- **Archivo ejemplo**: `src/environments/google-auth.config.example.ts` (para referencia)

El archivo real **NO** se sube a git para mantener las credenciales seguras.

## Verificar que Todo Funciona

1. Asegúrate de que el servidor de desarrollo esté corriendo:

   ```bash
   npm start
   ```

2. Inicia sesión con las credenciales demo:

   - Email: `demo@dream.com`
   - Password: `password`

3. Ve a la página de Perfil (Profile)

4. Haz clic en **"Connect with Google"**

5. Si todo está configurado correctamente, deberías poder iniciar sesión con tu cuenta de Google

## Solución de Problemas

### Error: "Firebase: Error (auth/invalid-api-key)"

- Verifica que hayas copiado correctamente la API Key
- Asegúrate de que no tenga espacios al inicio o final

### Error: "Google Sign-In failed"

- Verifica que Google esté habilitado en Firebase Authentication
- Verifica que el Client ID sea correcto
- En desarrollo web, asegúrate de que `localhost` esté en dominios autorizados

### El botón de Google no responde

- Abre la consola del navegador (F12) para ver errores
- Verifica que todas las librerías estén instaladas: `npm install --legacy-peer-deps`

## Archivos Modificados en Este Proyecto

- ✅ `src/environments/google-auth.config.ts` - Credenciales de Google (protegido)
- ✅ `src/environments/environment.ts` - Configuración de Firebase
- ✅ `.gitignore` - Protege las credenciales
- ✅ `src/app/pages/profile/profile.component.*` - Botón de Google agregado
- ✅ `src/app/pages/login/login.component.*` - Botón de Google removido
- ✅ `src/app/shared/services/firebase-auth.service.ts` - Usa configuración protegida
- ✅ `src/assets/i18n/en.json` - Traducciones en inglés
- ✅ `src/assets/i18n/es.json` - Traducciones en español

## Contacto

Si tienes problemas, verifica:

1. Los logs en la consola del navegador
2. Los logs en Firebase Console → Authentication → Users
3. Que todas las dependencias estén instaladas correctamente
