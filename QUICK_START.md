# 🚀 Quick Start - Google Sign-In

Esta guía rápida te ayudará a configurar Google Sign-In en minutos.

## Opción 1: Script Automatizado (Recomendado)

Ejecuta el script interactivo que te guiará paso a paso:

```bash
node setup-firebase.js
```

El script te pedirá:

- Credenciales de Firebase
- Web Client ID de Google

Y automáticamente configurará todos los archivos necesarios.

## Opción 2: Configuración Manual

### Paso 1: Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Project Settings** (⚙️) > **General**
4. En "Your apps", crea una app web si no tienes una
5. Copia la configuración de Firebase

### Paso 2: Obtener Web Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto de Firebase
3. Ve a **APIs & Services** > **Credentials**
4. Busca el **Web client** (termina en `.apps.googleusercontent.com`)
5. Copia el **Client ID** completo

### Paso 3: Configurar la App

Edita estos 3 archivos:

#### 1. `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
  },
};
```

#### 2. `capacitor.config.ts`

Busca `GoogleAuth` y reemplaza:

```typescript
GoogleAuth: {
  scopes: ["profile", "email"],
  serverClientId: "TU_CLIENT_ID.apps.googleusercontent.com", // ← Reemplaza aquí
  forceCodeForRefreshToken: true,
}
```

#### 3. `src/app/shared/services/firebase-auth.service.ts`

Busca `initializeGoogleAuth()` y reemplaza:

```typescript
private initializeGoogleAuth() {
  GoogleAuth.initialize({
    clientId: "TU_CLIENT_ID.apps.googleusercontent.com", // ← Reemplaza aquí
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });
}
```

### Paso 4: Habilitar Google Sign-In en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Google**
5. Guarda los cambios

### Paso 5: Configurar Dominios Autorizados (Para Web)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. Edita tu **Web client**
4. Agrega en **Authorized JavaScript origins**:
   - `http://localhost:8100`
   - `http://localhost:4200`
5. Agrega en **Authorized redirect URIs**:
   - `http://localhost:8100`
   - `http://localhost:4200`
6. Guarda

### Paso 6: Probar

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar la app
npm start
```

La app se abrirá en `http://localhost:8100`. Haz clic en "Continuar con Google" y deberías poder iniciar sesión.

## 📱 Configuración para Android

Si vas a usar en Android:

1. Genera el SHA-1:

   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Copia el SHA-1 de **debug**

3. Ve a Firebase Console > **Project Settings** > **Your apps**

4. Selecciona tu app Android

5. Agrega el SHA-1 fingerprint

6. Descarga el nuevo `google-services.json`

7. Reemplázalo en `android/app/google-services.json`

8. Sincroniza:
   ```bash
   npx cap sync android
   ```

## 🍎 Configuración para iOS

Si vas a usar en iOS:

1. Ve a Firebase Console > **Project Settings** > **Your apps**

2. Selecciona tu app iOS

3. Descarga `GoogleService-Info.plist`

4. Agrégalo a tu proyecto iOS en Xcode

5. En `ios/App/App/Info.plist`, agrega el URL scheme del `REVERSED_CLIENT_ID`

6. Sincroniza:
   ```bash
   npx cap sync ios
   ```

## ❓ Troubleshooting

### No funciona en localhost

- Verifica que `http://localhost:8100` esté en los orígenes autorizados
- Verifica que Google Sign-In esté habilitado en Firebase Console

### "Invalid Client ID"

- Asegúrate de usar el **Web Client ID**, no el Android o iOS
- Verifica que no haya espacios al inicio o final
- Debe terminar en `.apps.googleusercontent.com`

### "popup_closed_by_user"

- Esto es normal cuando el usuario cancela el login
- No requiere acción

### Para más ayuda

Consulta el archivo `GOOGLE_SIGNIN_SETUP.md` para información detallada.

## ✅ Checklist

- [ ] Credenciales de Firebase configuradas en `environment.ts`
- [ ] Web Client ID configurado en `capacitor.config.ts`
- [ ] Web Client ID configurado en `firebase-auth.service.ts`
- [ ] Google Sign-In habilitado en Firebase Console
- [ ] Dominios autorizados configurados en Google Cloud Console
- [ ] App probada con `npm start`

¡Listo! 🎉

