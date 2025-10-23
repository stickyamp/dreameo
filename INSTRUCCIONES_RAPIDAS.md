# 🚀 Instrucciones Rápidas - Login con Google

## ¡Tu login con Google está listo! Solo falta configurar las credenciales.

## 🎯 Opción 1: Configuración Automática (5 minutos)

### 1. Ejecuta el script de configuración:

```bash
node setup-firebase.js
```

### 2. El script te pedirá:

**Credenciales de Firebase:**

- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

**¿Dónde obtenerlas?**

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto (o crea uno)
3. Ve a Project Settings (⚙️) > General
4. Busca "Your apps" y copia la configuración

**Web Client ID de Google:**

- Client ID (termina en .apps.googleusercontent.com)

**¿Dónde obtenerlo?**

1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto
3. Ve a APIs & Services > Credentials
4. Busca "Web client" y copia el Client ID

### 3. Habilita Google Sign-In en Firebase:

1. Ve a https://console.firebase.google.com/
2. Authentication > Sign-in method
3. Habilita "Google"
4. Guarda

### 4. Autoriza localhost:

1. Ve a https://console.cloud.google.com/
2. APIs & Services > Credentials
3. Edita tu Web client
4. En "Authorized JavaScript origins" agrega:
   - `http://localhost:8100`
   - `http://localhost:4200`

### 5. ¡Prueba!

```bash
npm start
```

---

## 🎯 Opción 2: Configuración Manual

Si prefieres hacerlo manualmente, edita estos 3 archivos:

### 1️⃣ `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
  },
};
```

### 2️⃣ `capacitor.config.ts`

Busca `GoogleAuth` y cambia:

```typescript
serverClientId: "TU_CLIENT_ID.apps.googleusercontent.com",
```

### 3️⃣ `src/app/shared/services/firebase-auth.service.ts`

Busca `initializeGoogleAuth` y cambia:

```typescript
clientId: "TU_CLIENT_ID.apps.googleusercontent.com",
```

---

## ✅ Checklist

- [ ] Ejecuté `node setup-firebase.js` (o configuré manualmente)
- [ ] Habilitéé Google Sign-In en Firebase Console
- [ ] Autoricé localhost en Google Cloud Console
- [ ] Ejecuté `npm start`
- [ ] Probé el botón "Continuar con Google"

---

## 📚 Documentación Completa

- `README_GOOGLE_LOGIN.md` - Descripción completa del feature
- `QUICK_START.md` - Guía paso a paso detallada
- `GOOGLE_SIGNIN_SETUP.md` - Troubleshooting y configuración avanzada

---

## 🎉 ¿Todo listo?

Una vez configurado, deberías ver:

1. Botón "Continuar con Google" en la pantalla de login
2. Al hacer clic, se abre el popup de Google
3. Tras seleccionar tu cuenta, acceso a la app
4. Tu perfil guardado con tu nombre y email de Google

¡Disfruta tu login con Google! 🚀

