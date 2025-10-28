# 🔴 ERROR CODE 10 - DEVELOPER_ERROR

## ✅ IDENTIFICADO EL PROBLEMA EXACTO

```
{message: 'Something went wrong', code: '10'}
```

**Error Code 10 = DEVELOPER_ERROR**

Este error específico significa **AL 100%**:

- ❌ El SHA-1 NO está en Google Cloud Console (solo tenerlo en Firebase NO es suficiente)
- ❌ O el package name no coincide

---

## 🎯 SOLUCIÓN DEFINITIVA

### PASO 1: Ve a Google Cloud Console - Credentials

🔗 **https://console.cloud.google.com/apis/credentials?project=dream-journal-32932**

### PASO 2: Busca el "Android client" OAuth 2.0

En la lista de "OAuth 2.0 Client IDs" debes ver:

- ✅ Web client (Web application)
- ❓ **Android client (Android)** ← **ESTE ES EL CRÍTICO**

### PASO 3A: Si NO VES "Android client"

**Necesitas CREARLO:**

1. Click en **"+ CREATE CREDENTIALS"** (arriba)
2. Selecciona **"OAuth client ID"**
3. Application type: **"Android"**
4. Name: `Dream Journal Android`
5. Package name: **`com.dreamjournal.app`** (cópialo exactamente)
6. SHA-1 certificate fingerprint: **`3fbed546be7e47c77fbe007362872819097730ab`** (cópialo exactamente)
   - O puedes usar: `3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB` (con mayúsculas y dos puntos)
7. Click **"CREATE"**

### PASO 3B: Si YA EXISTE "Android client"

1. **Click en el nombre** del Android client para abrirlo
2. **VERIFICA que tenga EXACTAMENTE:**

   - Package name: `com.dreamjournal.app`
   - SHA-1 certificate fingerprints: `3fbed546be7e47c77fbe007362872819097730ab`

3. **Si el SHA-1 NO está o es diferente:**
   - Click en **"Add fingerprint"**
   - Pega: `3fbed546be7e47c77fbe007362872819097730ab`
   - Click **"DONE"**
   - Click **"SAVE"** (arriba)

---

## ⏰ PASO 4: ESPERA (CRÍTICO)

**Después de crear/modificar el Android OAuth Client:**

1. **Espera 15-20 minutos** (Google tarda en propagar los cambios)
2. **NO reinstales la app todavía**
3. Toma un café ☕
4. Después de 15-20 minutos, continúa al paso 5

---

## 🔧 PASO 5: Limpia y Reconstruye

```bash
cd android
.\gradlew.bat clean
cd ..
npx cap sync android
```

---

## 🚀 PASO 6: Reinstala desde Android Studio

1. Desinstala la app del móvil (manualmente)
2. `npx cap open android`
3. En Android Studio: Build → Clean Project
4. Build → Rebuild Project
5. Click ▶️ Run
6. Prueba el login de Google

---

## 📋 Checklist Específico para Error Code 10

- [ ] Google Cloud Console → APIs & Services → Credentials
- [ ] OAuth 2.0 Client ID para **Android** existe o creado
- [ ] Android Client tiene package: `com.dreamjournal.app`
- [ ] Android Client tiene SHA-1: `3fbed546be7e47c77fbe007362872819097730ab`
- [ ] Esperado **15-20 minutos** después de crear/modificar
- [ ] Build limpio con `gradlew.bat clean`
- [ ] App reinstalada desde Android Studio
- [ ] Probado el login

---

## 💡 Diferencia Crítica

### ❌ INCORRECTO (causa Error Code 10):

```
Firebase Console: SHA-1 agregado ✅
Google Cloud Console: SHA-1 NO agregado ❌
Resultado: Error Code 10
```

### ✅ CORRECTO:

```
Firebase Console: SHA-1 agregado ✅
Google Cloud Console: SHA-1 agregado en Android OAuth Client ✅
Resultado: Funciona
```

---

## 🔗 Link Directo

**Ve AQUÍ AHORA:**
https://console.cloud.google.com/apis/credentials?project=dream-journal-32932

**Busca "OAuth 2.0 Client IDs"**

**Si NO ves un "Android" client, créalo.**
**Si SÍ ves un "Android" client, ábrelo y verifica que tenga el SHA-1.**

---

## ⚠️ Valores Exactos a Usar

```
Package name: com.dreamjournal.app
SHA-1: 3fbed546be7e47c77fbe007362872819097730ab
```

O con formato alternativo:

```
SHA-1: 3F:BE:D5:46:BE:7E:47:C7:7F:BE:00:73:62:87:28:19:09:77:30:AB
```

(Ambos formatos son válidos, usa el que prefieras)

---

## 🎯 Después de Hacer Esto

El error Code 10 desaparecerá y verás:

```
Platform: android
Using native authentication flow
GoogleAuth.signIn() called
✅ User signed in successfully
```

---

## 📸 Si Necesitas Ayuda

Toma una captura de pantalla de:

- La página de Credentials en Google Cloud Console
- Mostrando la lista de OAuth 2.0 Client IDs

Y muéstramela para verificar que esté todo bien.

---

**IMPORTANTE: El Error Code 10 SIEMPRE significa que falta el SHA-1 en Google Cloud Console. No es otro problema.**
