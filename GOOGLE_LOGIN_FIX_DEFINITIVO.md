# 🔧 Solución Definitiva para Google Login en Android

## ❌ Problema Identificado

`signInWithPopup` **NO FUNCIONA** en Android porque el WebView de Capacitor no puede manejar popups.

## ✅ Solución Implementada

- **Web**: Usa `signInWithPopup` (funciona perfectamente)
- **Android**: Usa flujo nativo con `GoogleAuth` plugin (requiere configuración SHA-1)

---

## 🔑 PASO 1: Obtener tu SHA-1 (Debug)

Ejecuta este comando en la terminal:

```bash
cd android
./gradlew signingReport
```

Busca en la salida algo como esto:

```
Variant: debug
Config: debug
Store: C:\Users\alibe\.android\debug.keystore
Alias: AndroidDebugKey
MD5: XX:XX:XX...
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
SHA-256: XX:XX:XX...
```

**COPIA el SHA-1** (el que está en la línea que dice SHA1:)

---

## 🔥 PASO 2: Añadir SHA-1 a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en el ⚙️ (configuración) → **Configuración del proyecto**
4. Baja a la sección "Tus apps"
5. Click en tu app Android `com.dreamjournal.app`
6. En la sección "Huellas digitales del certificado SHA"
7. Click en **"Añadir huella digital"**
8. **Pega tu SHA-1** y guarda

---

## ☁️ PASO 3: Añadir SHA-1 a Google Cloud Console

**ESTO ES LO MÁS IMPORTANTE**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (mismo que Firebase)
3. En el menú lateral → **APIs y servicios** → **Credenciales**
4. Busca el cliente OAuth de tipo **"Android"**
   - Nombre: algo como "Web client (auto created by Google Service)"
   - Tipo: Android
   - ID: termina en `.apps.googleusercontent.com`
5. **Si NO existe un cliente Android**, créalo:

   - Click en **"+ CREAR CREDENCIALES"**
   - Selecciona **"ID de cliente de OAuth"**
   - Tipo de aplicación: **Android**
   - Nombre: `Dreameo Android`
   - Nombre del paquete: `com.dreamjournal.app`
   - **Huella digital del certificado SHA-1**: PEGA TU SHA-1 AQUÍ
   - Click en **Crear**

6. **Si ya existe**, edítalo:
   - Click en el nombre del cliente Android
   - Verifica que el **nombre del paquete** sea `com.dreamjournal.app`
   - Verifica que la **huella digital SHA-1** sea la correcta
   - Si no está, añádela
   - Guarda

---

## 📥 PASO 4: Descargar nuevo google-services.json

1. Vuelve a Firebase Console
2. ⚙️ → Configuración del proyecto
3. Baja a "Tus apps" → tu app Android
4. Click en **"Descargar google-services.json"**
5. **IMPORTANTE**: Reemplaza el archivo existente:
   ```
   android/app/google-services.json
   ```

---

## 🔨 PASO 5: Recompilar el Proyecto

```bash
# Limpiar todo
npm run build
npx cap sync android

# Limpiar build de Android
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

---

## 📱 PASO 6: Instalar APK Nuevo

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

O desde Android Studio:

```bash
npx cap open android
# Presiona Run (▶️)
```

---

## 🧪 PASO 7: Probar Google Login

1. Abre la app en tu dispositivo Android
2. Click en "Continuar con Google"
3. Deberías ver:
   - Los logs: `✅ Using NATIVE authentication flow`
   - La pantalla nativa de selección de cuenta de Google
   - **NO** debería aparecer Error Code 10
   - **NO** debería aparecer `auth/cancelled-popup-request`

---

## 🔍 Verificar Configuración

### En Firebase Console:

✅ SHA-1 añadido
✅ `google-services.json` descargado después de añadir SHA-1

### En Google Cloud Console:

✅ Cliente OAuth Android existe
✅ Package name: `com.dreamjournal.app`
✅ SHA-1 coincide con el de Firebase
✅ Estado: Activo

### En tu código:

✅ `google-services.json` en `android/app/`
✅ Build recompilado
✅ APK reinstalado

---

## 📞 Si Aún NO Funciona

Si después de hacer TODO lo anterior aún no funciona, verifica:

### 1. Logs en Logcat

```bash
adb logcat | findstr "GoogleAuth"
```

Busca:

- Error Code 10 → SHA-1 mal configurado en Google Cloud
- Error Code 12 → Nombre de paquete incorrecto
- Error de popup → Necesitas reinstalar el APK

### 2. Verifica el SHA-1

```bash
cd android
./gradlew signingReport | findstr "SHA1"
```

Compara este SHA-1 con el que pusiste en Google Cloud Console.

### 3. Limpieza Total

```bash
# Limpia TODO
cd android
./gradlew clean
rm -rf .gradle
rm -rf build
rm -rf app/build
cd ..

# Reconstruye
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
cd ..
```

---

## 💡 Explicación Técnica

### Por qué `signInWithPopup` no funciona en Android:

- El WebView de Capacitor no puede manejar ventanas popup
- Firebase intenta abrir un popup para autenticación
- El WebView lo bloquea → Error `auth/cancelled-popup-request`

### Por qué el flujo nativo requiere SHA-1:

- Google Cloud necesita verificar que la app es legítima
- Usa el SHA-1 del certificado de firma de la app
- Sin SHA-1 → Error Code 10 (DEVELOPER_ERROR)

### Por qué funciona en web:

- Los navegadores SÍ soportan popups nativamente
- No necesita SHA-1 porque no usa la app móvil
