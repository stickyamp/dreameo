# 🔐 Login con Google - Configuración Completa

Este documento explica cómo configurar y usar el login con Google en la aplicación Dream Journal.

## ✅ Estado Actual

El login con Google está **completamente implementado** y listo para usar. Solo necesitas configurar tus credenciales de Firebase y Google.

## 🎯 Archivos Modificados/Creados

### Código Principal

- ✅ `src/app/shared/services/firebase-auth.service.ts` - Servicio de autenticación con Google
- ✅ `src/app/pages/login/login.component.ts` - Componente de login actualizado
- ✅ `src/app/pages/login/login.component.html` - UI con botón de Google
- ✅ `src/app/pages/login/login.component.scss` - Estilos del botón de Google
- ✅ `src/main.ts` - Firebase providers habilitados e iconos registrados
- ✅ `capacitor.config.ts` - Configuración de GoogleAuth plugin

### Traducciones

- ✅ `src/assets/i18n/en.json` - Textos en inglés
- ✅ `src/assets/i18n/es.json` - Textos en español

### Dependencias

- ✅ `@codetrix-studio/capacitor-google-auth@3.3.4` - Instalado
- ✅ `@angular/fire` - Ya instalado
- ✅ `firebase` - Ya instalado

### Documentación y Herramientas

- 📝 `setup-firebase.js` - Script interactivo de configuración
- 📝 `QUICK_START.md` - Guía rápida
- 📝 `GOOGLE_SIGNIN_SETUP.md` - Guía detallada
- 📝 `src/environments/environment.example.ts` - Ejemplo de configuración

## 🚀 Cómo Hacerlo Funcional en 5 Minutos

### Método 1: Script Automático (Más Fácil) ⭐

1. Ejecuta el script de configuración:

   ```bash
   node setup-firebase.js
   ```

2. El script te pedirá:

   - Tu Firebase API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
   - Web Client ID de Google

3. El script configurará automáticamente todos los archivos

4. Habilita Google Sign-In en Firebase Console:

   - Ve a https://console.firebase.google.com/
   - Selecciona tu proyecto
   - Ve a **Authentication** > **Sign-in method**
   - Habilita **Google**
   - Guarda

5. Autoriza localhost en Google Cloud Console:

   - Ve a https://console.cloud.google.com/
   - **APIs & Services** > **Credentials**
   - Edita tu Web Client
   - Agrega `http://localhost:8100` en **Authorized JavaScript origins**

6. ¡Listo! Ejecuta:
   ```bash
   npm start
   ```

### Método 2: Configuración Manual

Si prefieres hacerlo manualmente, sigue la guía en `QUICK_START.md`.

## 📋 Checklist de Configuración

- [ ] **Paso 1:** Obtener credenciales de Firebase Console
- [ ] **Paso 2:** Obtener Web Client ID de Google Cloud Console
- [ ] **Paso 3:** Configurar `src/environments/environment.ts`
- [ ] **Paso 4:** Configurar `capacitor.config.ts` (reemplazar `YOUR_WEB_CLIENT_ID`)
- [ ] **Paso 5:** Configurar `firebase-auth.service.ts` (reemplazar `YOUR_WEB_CLIENT_ID`)
- [ ] **Paso 6:** Habilitar Google Sign-In en Firebase Console
- [ ] **Paso 7:** Autorizar dominios en Google Cloud Console
- [ ] **Paso 8:** Probar con `npm start`

## 🎨 Características Implementadas

### UI/UX

- ✅ Botón de Google con estilo Material Design
- ✅ Icono de Google oficial
- ✅ Separador visual ("o")
- ✅ Estados de carga (spinner)
- ✅ Mensajes de error descriptivos
- ✅ Prevención de doble clic
- ✅ Soporte multiidioma (inglés y español)

### Funcionalidad

- ✅ Autenticación con Google OAuth
- ✅ Integración con Firebase Authentication
- ✅ Manejo de sesión persistente
- ✅ Detección de estado de autenticación
- ✅ Manejo robusto de errores
- ✅ Soporte para web, Android e iOS
- ✅ Logout con cierre de sesión de Google

### Seguridad

- ✅ Tokens de autenticación seguros
- ✅ Credenciales nunca expuestas en código
- ✅ Validación de permisos
- ✅ Redirecciones seguras

## 🌐 Flujo de Autenticación

1. Usuario hace clic en "Continuar con Google"
2. Se muestra un loader
3. Se abre el flujo de OAuth de Google (popup o redirección)
4. Usuario selecciona cuenta de Google
5. Usuario autoriza permisos (email, perfil)
6. Google devuelve token de autenticación
7. Se crea credencial de Firebase con el token
8. Firebase autentica al usuario
9. Se guarda la sesión localmente (Capacitor Preferences)
10. Usuario es redirigido a `/tabs`

## 🔍 Verificación de Funcionamiento

### En el Browser Console

Deberías ver logs como:

```
Google Auth initialized successfully
Starting Google Sign-In...
Google user obtained: usuario@gmail.com
Google sign-in successful: usuario@gmail.com
Firebase user authenticated: { uid: "...", email: "..." }
```

### En la UI

1. Botón "Continuar con Google" visible
2. Al hacer clic, aparece loader
3. Se abre popup/modal de Google
4. Tras seleccionar cuenta, redirección a /tabs

## 🐛 Solución de Problemas

### "Error de configuración"

**Problema:** Las credenciales no están configuradas
**Solución:** Ejecuta `node setup-firebase.js` o edita manualmente los archivos

### "Invalid Client ID"

**Problema:** El Client ID es incorrecto o no está configurado
**Solución:**

- Verifica que sea el **Web Client ID**
- Debe terminar en `.apps.googleusercontent.com`
- Sin espacios al inicio o final

### "popup_closed_by_user"

**Problema:** Usuario cerró el popup de Google
**Solución:** Es normal, no requiere acción. El usuario puede intentar de nuevo.

### No funciona en localhost

**Problema:** Dominio no autorizado
**Solución:**

1. Google Cloud Console > Credentials > Edit Web Client
2. Agrega `http://localhost:8100` en Authorized JavaScript origins
3. Guarda y espera unos minutos

### Firebase not initialized

**Problema:** Firebase no está configurado correctamente
**Solución:**

- Verifica que `src/main.ts` tenga los providers de Firebase descomentados
- Verifica que `environment.ts` tenga las credenciales correctas

## 📱 Configuración para Producción

### Web

1. Agrega tu dominio en Google Cloud Console (Authorized origins)
2. Agrega tu dominio en Firebase Console (Authorized domains)
3. Crea `environment.prod.ts` con tus credenciales

### Android

1. Genera SHA-1: `cd android && ./gradlew signingReport`
2. Agrega SHA-1 en Firebase Console
3. Descarga nuevo `google-services.json`
4. Ejecuta `npx cap sync android`

### iOS

1. Descarga `GoogleService-Info.plist` de Firebase
2. Agrégalo al proyecto en Xcode
3. Configura URL scheme con `REVERSED_CLIENT_ID`
4. Ejecuta `npx cap sync ios`

## 📚 Recursos Adicionales

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [Capacitor Google Auth](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Angular Fire](https://github.com/angular/angularfire)

## 🎉 ¿Listo para Usar?

Si has completado todos los pasos del checklist, tu login con Google debería estar funcionando correctamente.

**Para empezar:**

```bash
npm start
```

Luego ve a http://localhost:8100, haz clic en "Continuar con Google" y ¡disfruta!

---

**¿Necesitas ayuda?** Consulta los archivos de documentación:

- `QUICK_START.md` - Guía rápida paso a paso
- `GOOGLE_SIGNIN_SETUP.md` - Guía detallada con troubleshooting

