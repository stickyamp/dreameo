# 🔧 Fix Google Login Android - Pasos Finales

## ✅ Estado Actual

- SHA-1 correcto en Firebase: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB`
- google-services.json presente y correcto
- Web Client ID configurado: `998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com`

## 🚀 Solución (Ejecuta estos comandos en orden)

### Paso 1: Limpiar el build de Android

```bash
cd android
.\gradlew.bat clean
cd ..
```

### Paso 2: Sincronizar Capacitor

```bash
npx cap sync android
```

### Paso 3: Copiar capacitor.config.json al build

```bash
npx cap copy android
```

### Paso 4: Probar en dispositivo/emulador

```bash
npx cap run android
```

## 🔍 Verificación Adicional

Si aún no funciona después de estos pasos, verifica en Firebase Console:

### 1. Google Sign-In Habilitado

- Ve a: https://console.firebase.google.com/project/dream-journal-32932/authentication/providers
- Verifica que "Google" esté **Habilitado**

### 2. SHA-1 Agregado

- Ve a: https://console.firebase.google.com/project/dream-journal-32932/settings/general
- En "Your apps" → Android app (com.dreamjournal.app)
- Verifica que el SHA-1 esté presente: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB`

### 3. Web Client ID Correcto

En Firebase Console → Authentication → Sign-in method → Google

- Verifica que el "Web SDK configuration" muestre:
  ```
  998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com
  ```

## 📱 Prueba

1. Abre la app en el dispositivo/emulador
2. Ve a la pantalla de Login
3. Click en "Continue with Google"
4. Deberías ver el selector de cuentas de Google nativo
5. Selecciona tu cuenta
6. La app debe redirigir a /tabs con sesión iniciada

## ❓ Si Aún Falla

Revisa los logs de Android:

```bash
npx cap run android --target [DEVICE_ID]
```

En Android Studio, abre el Logcat y busca errores relacionados con:

- "GoogleAuth"
- "Firebase"
- "Sign-in"

Los errores comunes incluyen:

- **"API not enabled"**: Habilita Google Sign-In API en Google Cloud Console
- **"Developer error"**: El SHA-1 no coincide o no se descargó el google-services.json después de agregarlo
- **"Invalid client ID"**: El serverClientId no coincide con el Web Client ID

## 🎯 Checklist Final

- [x] SHA-1 obtenido y agregado en Firebase
- [x] google-services.json descargado y en android/app/
- [x] Google Sign-In habilitado en Firebase Authentication
- [x] Web Client ID configurado en capacitor.config.ts
- [ ] Build limpiado con `gradlew.bat clean`
- [ ] Capacitor sincronizado con `npx cap sync android`
- [ ] App probada en dispositivo/emulador
