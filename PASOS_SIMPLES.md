# 📱 PASOS SIMPLES PARA SOLUCIONAR

## ⚠️ El Error

```
device unauthorized
Otherwise check for a confirmation dialog on your device.
```

---

## ✅ SOLUCIÓN RÁPIDA

### 📱 PASO 1: MIRA TU MÓVIL **AHORA**

**En la pantalla de tu móvil debe aparecer un mensaje emergente:**

```
╔════════════════════════════════════╗
║  ¿Permitir depuración USB?         ║
║                                    ║
║  La huella digital RSA es:         ║
║  XX:XX:XX:XX:XX:XX:XX...           ║
║                                    ║
║  ☑ Permitir siempre                ║
║                                    ║
║  [Cancelar]      [Aceptar]         ║
╚════════════════════════════════════╝
```

**HAZ ESTO:**

1. ✅ **Marca la casilla** "Permitir siempre desde este ordenador"
2. ✅ **Toca "Aceptar"**

---

### 🔍 ¿NO VES EL MENSAJE?

Si no aparece el mensaje:

**Opción A: Desconecta y reconecta el cable USB**

- Quita el cable USB del móvil
- Espera 3 segundos
- Vuelve a conectarlo
- El mensaje debería aparecer

**Opción B: Cambia el modo USB**
Cuando conectes el cable, en tu móvil aparece una notificación:

- Toca la notificación "Cargando este dispositivo por USB"
- Selecciona **"Transferencia de archivos"**
- El mensaje de autorización debería aparecer

---

### 💻 PASO 2: Verifica que está autorizado

**En tu PC, ejecuta:**

```bash
C:\Users\alibe\AppData\Local\Android\Sdk\platform-tools\adb devices
```

**Debe decir:**

```
List of devices attached
di7lylu4ijugduca    device
```

✅ Si dice `device` → ¡Perfecto! Continúa al paso 3

❌ Si dice `unauthorized` → Vuelve al paso 1, el mensaje aún no se aceptó

---

### 🚀 PASO 3: Instala la app

```bash
npx cap run android
```

---

## 📋 Resumen Visual

```
1. [MÓVIL] → Acepta el mensaje de autorización
              ↓
2. [PC]     → Verifica: adb devices
              ↓
3. [PC]     → Ejecuta: npx cap run android
              ↓
4. ✅       → La app se instala y abre
```

---

## ⚡ Si Necesitas Ayuda

**Dime qué ves cuando ejecutas:**

```bash
C:\Users\alibe\AppData\Local\Android\Sdk\platform-tools\adb devices
```

Y te diré exactamente qué hacer.
