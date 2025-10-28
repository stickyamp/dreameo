# ⚠️ ERROR: Device Unauthorized

## 🔍 Qué Significa

```
adb.exe: device unauthorized.
Otherwise check for a confirmation dialog on your device.
```

Esto significa que tu móvil **está esperando que aceptes** un mensaje de autorización.

---

## ✅ SOLUCIÓN (3 PASOS)

### 📱 PASO 1: Mira tu móvil AHORA

**En la pantalla de tu móvil debe aparecer un mensaje:**

```
¿Permitir depuración USB?
La huella digital RSA de la computadora es:
[código largo]

[ ] Permitir siempre desde este ordenador
[Cancelar] [Aceptar]
```

**Haz esto:**

1. ✅ Marca la casilla **"Permitir siempre desde este ordenador"**
2. ✅ Toca **"Aceptar"**

### 💻 PASO 2: Reinicia el servidor ADB

**En tu PC, ejecuta estos comandos:**

```bash
# Mata el servidor ADB actual
adb kill-server

# Inicia el servidor ADB de nuevo
adb start-server

# Verifica que el dispositivo está autorizado
adb devices
```

Deberías ver algo como:

```
List of devices attached
XXXXXXXXXX    device
```

Si dice `device` (sin "unauthorized"), ¡está listo!

### 🚀 PASO 3: Reinstala la app

```bash
npx cap run android
```

---

## ⚠️ Si No Ves el Mensaje en el Móvil

Si no aparece el diálogo de autorización:

1. **Desconecta y reconecta el cable USB**
2. **Ejecuta:**
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```
3. **MIRA TU MÓVIL** - el mensaje debería aparecer ahora

---

## 🔧 Si Aún No Funciona

**Opción 1: Revoca y vuelve a autorizar**

En tu móvil:

1. Ajustes → Opciones de desarrollador
2. Busca "Revocar autorizaciones de depuración USB"
3. Toca en esa opción
4. Desconecta y reconecta el cable USB
5. El mensaje de autorización aparecerá de nuevo
6. Acéptalo

**Opción 2: Cambia el modo USB**

En tu móvil, al conectar el cable USB aparece una notificación:

1. Toca la notificación "USB conectado"
2. Selecciona **"Transferencia de archivos"** o **"MTP"**
3. El mensaje de autorización debería aparecer

---

## ⚡ COMANDOS EN ORDEN

```bash
# 1. Mira tu móvil y acepta el mensaje de autorización

# 2. En tu PC:
adb kill-server
adb start-server
adb devices

# 3. Verifica que dice "device" (no "unauthorized")

# 4. Instala la app:
npx cap run android
```

---

## 🎯 Resultado Esperado

Después de aceptar la autorización:

```bash
PS C:\Users\alibe\Desktop\dreameo> adb devices
List of devices attached
di7lylu4ijugduca    device
```

Y `npx cap run android` funcionará correctamente.
