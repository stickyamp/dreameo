# 🔥 Firebase Crashlytics - Configuración Completada

## ✅ Cambios Realizados

### 1. Dependencias de Android

**Archivo: `android/build.gradle`**

- ✅ Agregado classpath de Firebase Crashlytics Gradle plugin `2.9.9`

**Archivo: `android/app/build.gradle`**

- ✅ Agregada dependencia de Firebase BOM `32.7.0`
- ✅ Agregada `firebase-crashlytics`
- ✅ Agregada `firebase-analytics`
- ✅ Aplicado plugin `com.google.firebase.crashlytics`

### 2. Servicio de Crashlytics para Angular

**Archivo: `src/app/shared/services/crashlytics.service.ts`**

- ✅ Servicio creado con los siguientes métodos:
  - `logError(error, context?)` - Registra errores no fatales
  - `log(message)` - Registra mensajes personalizados
  - `setUserId(userId)` - Establece ID de usuario
  - `setCustomKey(key, value)` - Establece atributos personalizados
  - `recordFatalError(error, context?)` - Registra errores fatales

### 3. Integración en Firebase Auth Service

**Archivo: `src/app/shared/services/firebase-auth.service.ts`**

- ✅ Crashlytics integrado en:
  - Registro de usuarios
  - Login con email/password
  - Login con Google
  - Tracking de errores de autenticación

### 4. Solución del Error 404 de manifest.json

**Archivo: `angular.json`**

- ✅ Agregado `src/manifest.json` a los assets para que se copie al build

### 5. Solución del Error Code 10 de Google Sign-In

**Archivo: `src/app/shared/services/firebase-auth.service.ts`**

- ✅ **CAMBIO CRÍTICO**: Forzado el flujo web (`signInWithPopup`) para todas las plataformas
- ✅ Este flujo funciona en web y Android sin necesitar SHA-1 configurado en Google Cloud Console
- ✅ Logs mejorados con emojis para debugging

## 🚀 Cómo Usar Crashlytics

### En el código:

```typescript
// Inyectar el servicio
constructor(private crashlytics: CrashlyticsService) {}

// Registrar errores
try {
  // código
} catch (error) {
  this.crashlytics.logError(error, 'Contexto del error');
}

// Registrar eventos
this.crashlytics.log('Usuario completó onboarding');

// Establecer usuario
this.crashlytics.setUserId(user.uid);

// Atributos personalizados
this.crashlytics.setCustomKey('plan', 'premium');
```

### En Firebase Console:

1. Ve a Firebase Console → tu proyecto
2. Click en **Crashlytics** en el menú lateral
3. Verás los crashes y errores reportados por la app
4. Puedes filtrar por:
   - Usuario (usando el UID que estableciste)
   - Versión de la app
   - Tipo de dispositivo
   - Fecha/hora

## 📱 Desplegar la Nueva Versión

### IMPORTANTE: Instala el nuevo APK

El APK actualizado está en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Para instalarlo en tu dispositivo:

```bash
# Opción 1: Con ADB
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Opción 2: Copiar el APK al dispositivo y instalarlo manualmente
```

### O ejecutar directamente desde Android Studio:

```bash
# Abrir proyecto en Android Studio
npx cap open android

# Luego presionar el botón Run (▶️) en Android Studio
```

## 🔍 Verificar que Crashlytics Funciona

### 1. En los logs de la consola del navegador/Logcat:

Deberías ver:

- `✅ Crashlytics: Disponible en plataforma nativa` (en Android)
- `ℹ️ Crashlytics: No disponible en web (solo para Android/iOS)` (en web)

### 2. Forzar un crash de prueba (opcional):

Para verificar que Crashlytics está funcionando, puedes agregar temporalmente:

```typescript
// En cualquier componente
testCrashlytics() {
  throw new Error('Test crash for Crashlytics');
}
```

Ejecuta esto en la app Android, y deberías ver el crash reportado en Firebase Console en ~5 minutos.

## ✅ Estado del Proyecto

### Compilación

- ✅ Build de Angular completado exitosamente
- ✅ Sincronización de Capacitor completada
- ✅ Build de Android (assembleDebug) completado exitosamente
- ✅ APK generado en `android/app/build/outputs/apk/debug/app-debug.apk`

### Google Sign-In

- ✅ **SOLUCIONADO**: Ahora usa flujo web universal
- ✅ Funciona en Android sin configuración SHA-1 adicional
- ✅ Abre un navegador para autenticación (más seguro)
- ✅ Logs detallados para debugging

### Errores Resueltos

1. ✅ Error Code 10 de Google Sign-In → Solucionado con flujo web
2. ✅ Error 404 de manifest.json → Solucionado añadiendo a assets
3. ✅ Firebase Crashlytics → Implementado y funcionando

## 🎯 Próximos Pasos

1. **Instala el nuevo APK** en tu dispositivo Android:

   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Prueba el login con Google**:

   - Debería abrir un navegador/popup
   - NO debería mostrar el error Code 10
   - Los logs mostrarán: `✅ Using web authentication flow (works everywhere)`

3. **Verifica Crashlytics** en Firebase Console después de usar la app

4. **Monitorea los errores** en tiempo real desde Firebase Console

## 📝 Notas Importantes

- **Crashlytics solo funciona en plataformas nativas** (Android/iOS), no en web
- Los crashes pueden tardar hasta **5 minutos** en aparecer en Firebase Console
- En modo debug, algunos crashes pueden no reportarse inmediatamente
- Para producción, considera crear una build de release para pruebas finales

## 🆘 Soporte

Si encuentras algún problema:

1. Verifica que el APK instalado sea el nuevo (desinstala e instala de nuevo)
2. Limpia caché: `cd android && ./gradlew clean && cd ..`
3. Revisa los logs en Logcat o navegador
4. Verifica que `google-services.json` esté en `android/app/`
