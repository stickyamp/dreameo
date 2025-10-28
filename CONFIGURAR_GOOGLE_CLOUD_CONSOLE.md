# 🔧 CONFIGURAR GOOGLE CLOUD CONSOLE

## ✅ PROGRESO

El código ahora funciona correctamente:

- ✅ `Google Auth initialized successfully`
- ✅ El plugin está registrado

## ❌ Problema Actual

Error: `Something went wrong` al hacer `GoogleAuth.signIn()`

**Causa:** Falta habilitar APIs en Google Cloud Console.

---

## 🔧 SOLUCIÓN: Configurar Google Cloud Console

### PASO 1: Ve a Google Cloud Console

🔗 https://console.cloud.google.com/

1. Selecciona tu proyecto: **dream-journal-32932**

### PASO 2: Habilita las APIs Necesarias

#### A) Habilita Google Sign-In API

1. En el menú izquierdo: **APIs & Services** → **Enabled APIs & services**
2. Click en **"+ ENABLE APIS AND SERVICES"** (arriba)
3. Busca: **"Google Sign-In API"** o **"Google Identity"**
4. Click en el resultado
5. Click en **"ENABLE"**

#### B) Habilita Google+ API (si existe)

1. Busca: **"Google+ API"**
2. Si aparece, habilítala
3. Si no aparece o está deprecated, ignora este paso

### PASO 3: Verifica las Credenciales

1. **APIs & Services** → **Credentials**
2. Deberías ver tus OAuth 2.0 Client IDs:
   - **Web client** (type: Web application)
   - **Android client** (type: Android)

#### Verifica el Android Client:

1. Click en el **Android client**
2. Verifica que tenga:
   - **Package name:** `com.dreamjournal.app`
   - **SHA-1:** `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB`

Si NO está, agrégalo:

- Click en "Add fingerprint"
- Pega el SHA-1
- Click "Save"

### PASO 4: Verifica OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. Verifica que esté configurado:
   - **User Type:** External (o Internal si es workspace)
   - **App name:** Dream Journal
   - **User support email:** Tu email
   - **Developer contact:** Tu email
3. **Test users:** Agrega tu cuenta de Google si es "Testing"

### PASO 5: Espera 5-10 Minutos

Google Cloud tarda unos minutos en propagar los cambios.

---

## 🚀 Después de Configurar

1. **Espera 5-10 minutos**
2. **Desinstala la app del móvil**
3. **Vuelve a instalar desde Android Studio** (▶️)
4. **Prueba el login de Google**

---

## 📋 Checklist de Google Cloud Console

- [ ] Proyecto seleccionado: dream-journal-32932
- [ ] Google Sign-In API habilitada
- [ ] OAuth 2.0 Client ID para Android existe
- [ ] Android Client tiene el package: com.dreamjournal.app
- [ ] Android Client tiene el SHA-1 correcto
- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (si está en Testing)
- [ ] Esperado 5-10 minutos para propagación

---

## 🔍 Verificación Final

### En Firebase Console también verifica:

🔗 https://console.firebase.google.com/project/dream-journal-32932/authentication/providers

1. Ve a **Authentication** → **Sign-in method**
2. **Google** debe estar **Enabled** (toggle verde)
3. Click en **Google** para editar
4. **Web SDK configuration** debe mostrar:
   - Client ID: `998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com`

---

## ⚠️ Error Común

El error `Something went wrong` en Android usualmente significa:

1. ❌ **SHA-1 no agregado en Google Cloud Console** ← Más probable
2. ❌ **APIs no habilitadas en Google Cloud Console**
3. ❌ **OAuth Consent Screen no configurado**

---

## 🎯 Resumen Visual

```
Google Cloud Console
  ↓
APIs & Services → Enabled APIs
  ↓
Habilitar: Google Sign-In API
  ↓
APIs & Services → Credentials
  ↓
Verificar Android OAuth Client
  ↓
Agregar SHA-1 si falta
  ↓
OAuth Consent Screen
  ↓
Configurar y agregar test users
  ↓
Esperar 5-10 minutos
  ↓
Reinstalar app
  ↓
✅ Funciona
```

---

## 🔗 Links Directos

- **Google Cloud Console:** https://console.cloud.google.com/
- **APIs Habilitadas:** https://console.cloud.google.com/apis/dashboard
- **Credenciales:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent:** https://console.cloud.google.com/apis/credentials/consent
- **Firebase Auth:** https://console.firebase.google.com/project/dream-journal-32932/authentication/providers

---

**Ve a Google Cloud Console AHORA y verifica esos pasos. El código está funcionando, solo falta la configuración de Google.**
