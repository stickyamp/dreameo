# 🔧 Solución para Google Sign-In en Android

## Problema

El login de Google en Android muestra el error "profile.googleerror. something went wrong".

## Causa

Faltan configuraciones necesarias en Android, específicamente el archivo `google-services.json`.

## ✅ Solución Paso a Paso

### 1. Obtener el SHA-1 de tu app

En una terminal, ejecuta:

```bash
cd android
./gradlew signingReport
```

O en Windows:

```bash
cd android
gradlew.bat signingReport
```

Busca en la salida la sección **Variant: debug** y copia el **SHA-1**. Se verá algo así:

```
SHA-1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

### 2. Agregar SHA-1 a Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **dream-journal-32932**
3. Ve a **Project Settings** (⚙️)
4. Desplázate a la sección **Your apps**
5. Busca la app Android: `com.dreamjournal.app`
   - Si no existe, crea una:
     - Click en "Add app" → Android
     - Package name: `com.dreamjournal.app`
     - App nickname: "Dream Journal Android"
     - Click "Register app"
6. En la app Android, busca la sección **SHA certificate fingerprints**
7. Click en "Add fingerprint"
8. Pega el SHA-1 que copiaste del paso 1
9. Click "Save"

### 3. Descargar google-services.json

1. En la misma pantalla de **Project Settings** → **Your apps** → Android app
2. Click en el botón **Download google-services.json**
3. Guarda el archivo descargado
4. **Copia el archivo a:** `android/app/google-services.json`

La ubicación exacta debe ser:

```
dreameo/
├── android/
│   └── app/
│       ├── google-services.json  ← AQUÍ
│       ├── build.gradle
│       └── src/
```

### 4. Habilitar Google Sign-In en Firebase

1. En Firebase Console, ve a **Authentication** → **Sign-in method**
2. Busca **Google** en la lista de proveedores
3. Click en **Google**
4. Habilita el toggle
5. Verifica que el **Web SDK configuration** muestre el Web Client ID correcto
6. Click "Save"

### 5. Verificar la configuración

Verifica que estos archivos tengan la configuración correcta:

#### ✅ `capacitor.config.ts` (YA CORREGIDO)

```typescript
GoogleAuth: {
  scopes: ["profile", "email"],
  serverClientId: "62304341423-dsb11i2h2v3o04j6b5ej7j7pmvmong1v.apps.googleusercontent.com",
  forceCodeForRefreshToken: true,
}
```

#### ✅ `src/environments/google-auth.config.ts` (YA CONFIGURADO)

```typescript
webClientId: "62304341423-dsb11i2h2v3o04j6b5ej7j7pmvmong1v.apps.googleusercontent.com";
```

### 6. Sincronizar Capacitor

```bash
npx cap sync android
```

### 7. Limpiar y Reconstruir la App

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

O en Windows:

```bash
cd android
gradlew.bat clean
cd ..
npx cap sync android
```

### 8. Probar en Dispositivo/Emulador

```bash
npx cap run android
```

O abre el proyecto en Android Studio y ejecuta desde ahí:

```bash
npx cap open android
```

## 🔍 Verificación

Cuando ejecutes la app en Android:

1. Ve a la pantalla de Login
2. Click en "Continue with Google"
3. Debes ver el selector de cuenta de Google (no un error)
4. Selecciona tu cuenta
5. Deberías ser redirigido a la app con la sesión iniciada

## ⚠️ Errores Comunes

### Error: "Developer Error" o "API Key Error"

- **Causa:** SHA-1 no configurado o google-services.json no descargado
- **Solución:** Repite los pasos 1-3

### Error: "Invalid Client ID"

- **Causa:** El serverClientId no coincide con el Web Client ID de Firebase
- **Solución:** Verifica que sea el mismo en capacitor.config.ts y Firebase Console

### No aparece el selector de Google

- **Causa:** google-services.json falta o está mal ubicado
- **Solución:** Verifica que esté en `android/app/google-services.json`

### Funciona en Web pero no en Android

- **Causa:** Normal, son flujos diferentes. Android necesita SHA-1 y google-services.json
- **Solución:** Completa todos los pasos de esta guía

## 📋 Checklist Final

- [ ] SHA-1 obtenido con `./gradlew signingReport`
- [ ] SHA-1 agregado en Firebase Console
- [ ] Google Sign-In habilitado en Firebase Authentication
- [ ] `google-services.json` descargado
- [ ] `google-services.json` colocado en `android/app/`
- [ ] `npx cap sync android` ejecutado
- [ ] App reconstruida y probada en dispositivo/emulador

## 🎉 Resultado

Después de seguir estos pasos, el login de Google funcionará tanto en:

- ✅ Web (localhost:8100)
- ✅ Android (dispositivo físico o emulador)

## 📚 Recursos Adicionales

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
