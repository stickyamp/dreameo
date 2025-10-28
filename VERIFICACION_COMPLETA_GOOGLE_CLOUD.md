# 🔍 VERIFICACIÓN COMPLETA - Google Cloud Console

## ⚠️ El Problema Persiste

Error: `Something went wrong` en `GoogleAuth.signIn()`

**Causa más probable:** El SHA-1 NO está en Google Cloud Console (solo en Firebase no es suficiente).

---

## 📋 VERIFICACIÓN PASO A PASO

### ✅ PASO 1: Verifica Google Cloud Console

🔗 https://console.cloud.google.com/apis/credentials

1. **Selecciona el proyecto:** `dream-journal-32932`

2. **Ve a:** APIs & Services → Credentials

3. **Debes ver en "OAuth 2.0 Client IDs":**
   - Un **Web client** (Web application)
   - Un **Android client** (Android) ← **ESTE ES CRÍTICO**

### ⚠️ Si NO VES el "Android client":

**Necesitas crearlo:**

1. Click en **"+ CREATE CREDENTIALS"**
2. Selecciona **"OAuth client ID"**
3. Application type: **"Android"**
4. Name: `Dream Journal Android`
5. Package name: `com.dreamjournal.app`
6. SHA-1 certificate fingerprint: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB`
7. Click **"CREATE"**

### ✅ Si YA EXISTE el "Android client":

1. **Click en el Android client** para editarlo
2. **VERIFICA que tenga:**

   - Package name: `com.dreamjournal.app` ✅
   - SHA-1: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB` ✅

3. **Si el SHA-1 NO está:**
   - Click en "Add fingerprint"
   - Pega: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB`
   - Click "Save"

---

## 📥 PASO 2: Descarga NUEVO google-services.json

**IMPORTANTE:** Después de agregar el SHA-1 en Google Cloud Console:

1. Ve a Firebase Console: https://console.firebase.google.com/project/dream-journal-32932/settings/general
2. Baja hasta "Your apps" → Android app
3. Click en el botón **"google-services.json"** para descargar
4. **REEMPLAZA** el archivo en: `android/app/google-services.json`

---

## 🔧 PASO 3: Limpia y Reconstruye

```bash
cd android
.\gradlew.bat clean
cd ..
npx cap sync android
```

---

## 🚀 PASO 4: Reinstala desde Android Studio

```bash
npx cap open android
```

En Android Studio:

1. Build → Clean Project
2. Build → Rebuild Project
3. Click ▶️ Run

---

## 🔍 PASO 5: Verifica OAuth Consent Screen

🔗 https://console.cloud.google.com/apis/credentials/consent

1. **Publishing status:** Debe estar en "Testing" o "In production"
2. **Test users:** Si está en "Testing", agrega tu email de Google
3. Click en "Edit App"
4. Verifica:
   - App name: Dream Journal
   - User support email: (tu email)
   - Authorized domains: Debe incluir `firebaseapp.com`

---

## 📊 Checklist Completo

### Google Cloud Console:

- [ ] Proyecto seleccionado: dream-journal-32932
- [ ] OAuth 2.0 Client ID para **Android** existe
- [ ] Android Client tiene package: com.dreamjournal.app
- [ ] Android Client tiene SHA-1: 3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB
- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (tu email)

### APIs Habilitadas:

- [ ] Google Sign-In API
- [ ] Google Identity Toolkit API

### Firebase:

- [ ] Google Sign-In habilitado en Authentication
- [ ] Nuevo google-services.json descargado y reemplazado

### Build:

- [ ] gradlew.bat clean ejecutado
- [ ] npx cap sync android ejecutado
- [ ] App reconstruida desde Android Studio

---

## 🎯 Configuración del Web Client ID

Verifica que en `src/environments/google-auth.config.ts` tengas:

```typescript
webClientId: "998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com";
```

Y en `capacitor.config.ts`:

```typescript
GoogleAuth: {
  scopes: ["profile", "email"],
  serverClientId: "998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com",
  forceCodeForRefreshToken: true,
}
```

**IMPORTANTE:** Usa el **Web Client ID**, NO el Android Client ID.

---

## 🔴 Error Común

**El error "Something went wrong" casi siempre significa:**

1. ❌ SHA-1 no está en Google Cloud Console (solo Firebase no es suficiente)
2. ❌ No descargaste el nuevo google-services.json después de agregar SHA-1
3. ❌ OAuth Consent Screen no tiene test users agregados

---

## 💡 Diferencia Importante

**Firebase Console ≠ Google Cloud Console**

- Firebase Console: Muestra el SHA-1 en "Your apps"
- Google Cloud Console: Necesitas agregar el SHA-1 en **Credentials → Android OAuth Client**

**Ambos deben tener el SHA-1.**

---

## 🔗 Links Directos

- **Google Cloud Credentials:** https://console.cloud.google.com/apis/credentials?project=dream-journal-32932
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent?project=dream-journal-32932
- **Firebase Settings:** https://console.firebase.google.com/project/dream-journal-32932/settings/general
- **Firebase Authentication:** https://console.firebase.google.com/project/dream-journal-32932/authentication/providers

---

## ⚡ Haz Esto AHORA

1. Ve a: https://console.cloud.google.com/apis/credentials?project=dream-journal-32932
2. Verifica que exista el "Android client" OAuth 2.0
3. Abre el Android client y verifica que tenga el SHA-1
4. Si no lo tiene, agrégalo
5. Descarga nuevo google-services.json de Firebase
6. Reemplázalo en android/app/
7. Limpia: cd android && .\gradlew.bat clean && cd ..
8. Sincroniza: npx cap sync android
9. Reinstala desde Android Studio
10. Prueba

---

**Si después de esto sigue fallando, dame una captura de pantalla de la página de Credentials en Google Cloud Console para ver qué falta.**
