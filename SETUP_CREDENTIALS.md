# 🔐 Configuración de Credenciales

Este documento explica cómo configurar las credenciales necesarias para que la aplicación funcione correctamente.

## ⚠️ IMPORTANTE: Seguridad

Los siguientes archivos contienen información sensible y **NO deben ser subidos a Git**:

- `src/environments/environment.ts`
- `src/environments/google-auth.config.ts`

Estos archivos ya están protegidos en `.gitignore`. **NO los remuevas del .gitignore**.

## 📋 Archivos de Configuración Requeridos

### 1. Firebase Configuration (`environment.ts`)

**Paso 1:** Copia el archivo de ejemplo

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

**Paso 2:** Obtén tus credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `dream-journal-32932`
3. Haz clic en ⚙️ **Configuración del proyecto**
4. En la sección **"Tus aplicaciones"**:
   - Si NO tienes una app web: Haz clic en `</>` para crear una
   - Si ya tienes una: Haz clic en ella para ver las credenciales
5. Copia todos los valores de `firebaseConfig`

**Paso 3:** Actualiza `src/environments/environment.ts` con tus valores:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "dream-journal-32932.firebaseapp.com",
    projectId: "dream-journal-32932",
    storageBucket: "dream-journal-32932.firebasestorage.app",
    messagingSenderId: "998030673719",
    appId: "TU_APP_ID_AQUI",
    measurementId: "TU_MEASUREMENT_ID_AQUI",
  },
};
```

### 2. Google Authentication (`google-auth.config.ts`)

**Paso 1:** Copia el archivo de ejemplo

```bash
cp src/environments/google-auth.config.example.ts src/environments/google-auth.config.ts
```

**Paso 2:** Obtén tu Client ID de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `dream-journal-32932`
3. Ve a **APIs & Services** → **Credentials**
4. Busca tu **OAuth 2.0 Client ID** para Web
5. Copia el **Client ID**

**Paso 3:** Actualiza `src/environments/google-auth.config.ts`:

```typescript
export const googleAuthConfig = {
  webClientId: "TU_CLIENT_ID.apps.googleusercontent.com",
  androidClientId: "", // Opcional
  iosClientId: "", // Opcional
  scopes: ["profile", "email"],
  grantOfflineAccess: true,
};
```

## 🔥 Habilitar Authentication en Firebase

1. En Firebase Console, ve a **Authentication**
2. Haz clic en **"Comenzar"** (si es la primera vez)
3. Ve a la pestaña **"Sign-in method"**
4. Habilita los siguientes métodos:
   - ✅ **Email/Password**
   - ✅ **Google**

## ✅ Verificar que Todo Funciona

1. Instala las dependencias:

```bash
npm install --legacy-peer-deps
```

2. Inicia el servidor de desarrollo:

```bash
npm start
```

3. Abre la app: `http://localhost:8100`

4. Prueba el login:
   - **Credenciales demo:** `demo@dream.com` / `password`
   - **Google Sign-In:** Ve a Profile → "Connect with Google"

## 🚫 NO Hacer

- ❌ **NO** subas `environment.ts` a Git
- ❌ **NO** subas `google-auth.config.ts` a Git
- ❌ **NO** compartas tus credenciales públicamente
- ❌ **NO** remuevas estos archivos del `.gitignore`

## 📚 Más Información

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Google Sign-In Setup](./GOOGLE_SIGNIN_SETUP.md)
- [Firebase Config Instructions](./FIREBASE_CONFIG_INSTRUCTIONS.md)

## 🆘 Soporte

Si tienes problemas:

1. Verifica que los archivos existan y tengan el formato correcto
2. Revisa la consola del navegador para ver errores específicos
3. Asegúrate de que Authentication esté habilitado en Firebase
4. Verifica que tu dominio esté autorizado en Google Cloud Console
