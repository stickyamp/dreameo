# 🔍 PASO A PASO: Ver Logs y Debuggear

## ✅ Build Actualizado

Acabo de:

1. ✅ Limpiar el build: `gradlew.bat clean`
2. ✅ Sincronizar Capacitor: `npx cap sync android`

Ahora el cambio de MainActivity.java está aplicado.

---

## 📱 MÉTODO 1: Chrome DevTools (RECOMENDADO - MÁS FÁCIL)

### Paso 1: Preparar el móvil

1. **Conecta tu móvil al PC con cable USB**

2. **Habilita "Depuración USB":**
   - Ajustes → Acerca del teléfono
   - Toca **7 veces** en "Número de compilación"
   - Vuelve → Opciones de desarrollador
   - Activa **"Depuración USB"**
   - Acepta el mensaje que aparece en el móvil

### Paso 2: Ejecutar la app

```bash
npx cap run android
```

(La app se instalará y abrirá en tu móvil)

### Paso 3: Ver los logs

1. **Abre Google Chrome en tu PC**

2. **En la barra de direcciones escribe:**

   ```
   chrome://inspect#devices
   ```

3. **Deberías ver tu dispositivo** con una lista de apps

4. **Busca "Dream Journal" o "com.dreamjournal.app"**

5. **Click en "inspect"** (aparecerá debajo de tu app)

6. **Se abre DevTools → Pestaña "Console"**

### Paso 4: Reproducir el error

1. En tu móvil, **ve a Login**
2. **Click en "Continue with Google"**
3. **Observa la consola de Chrome en tu PC**
4. **Busca mensajes con `[GoogleAuth]`**

### Paso 5: Copiar los logs

**COPIA TODOS los mensajes que aparezcan**, especialmente:

- Los que empiecen con `[GoogleAuth]`
- Los que digan `Error` o `❌`

Y pégamelos aquí para que pueda ver exactamente qué está fallando.

---

## 📱 MÉTODO 2: Android Studio Logcat

Si prefieres usar Android Studio:

```bash
npx cap open android
```

1. En Android Studio, click en ▶️ (Run)
2. Espera a que la app se instale
3. En la parte inferior, abre **"Logcat"**
4. En el filtro escribe: `GoogleAuth`
5. Reproduce el error en el móvil
6. Copia los logs que aparezcan

---

## 🎯 Qué Esperar en los Logs

### ✅ Si funciona correctamente:

```
[GoogleAuth] Initializing for native platform...
[GoogleAuth] Platform: android
[GoogleAuth] Client ID: 998030673719-ns2js6lqoaac12aicev3ser2v3n0m8lo.apps.googleusercontent.com
[GoogleAuth] ✅ Initialized successfully
[GoogleAuth] Using native authentication flow
[GoogleAuth] Calling GoogleAuth.signIn()...
[GoogleAuth] signIn() completed
[GoogleAuth] ✅ Google user obtained
[GoogleAuth] Creating Firebase credential...
[GoogleAuth] Signing in to Firebase...
[GoogleAuth] ✅ Google sign-in successful (native)
```

### ❌ Si falla, verás algo como:

```
[GoogleAuth] ❌ Error initializing: ...
[GoogleAuth] ❌ Native flow error: ...
[GoogleAuth] Error details: { message: "...", code: "..." }
```

---

## ⚡ Ejecuta Ahora

```bash
npx cap run android
```

Luego sigue el **MÉTODO 1** (Chrome DevTools) para ver los logs.

---

## 📋 Información que Necesito

Una vez que reproduzcas el error, **cópiame:**

1. **TODOS los mensajes de la consola** (especialmente los `[GoogleAuth]`)
2. **El mensaje de error exacto** que aparece en la app
3. **Cualquier mensaje que diga "Error" o tenga ❌**

Con esa información sabré exactamente qué está fallando y cómo solucionarlo.
