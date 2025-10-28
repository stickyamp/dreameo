# 📱 Cómo Ver Logs en Android

## 🔍 Opción 1: Chrome DevTools (MÁS FÁCIL)

### Pasos:

1. **Conecta tu móvil al PC con USB**
2. **Habilita "Depuración USB"** en tu móvil:

   - Ve a Ajustes → Acerca del teléfono
   - Toca 7 veces en "Número de compilación"
   - Vuelve atrás → Opciones de desarrollador
   - Activa "Depuración USB"

3. **Abre Chrome en tu PC**

4. **Ve a:** `chrome://inspect#devices`

5. **Abre la app en tu móvil**

6. **En Chrome verás tu dispositivo y la app**

   - Click en "inspect" debajo de tu app

7. **Ve a la pestaña "Console"**

   - Aquí verás todos los logs con `[GoogleAuth]`

8. **Haz login con Google y copia TODOS los logs que aparezcan**

---

## 🔍 Opción 2: Android Studio Logcat

### Si tienes Android Studio:

1. Abre Android Studio
2. Ejecuta: `npx cap open android`
3. Click en el botón ▶️ (Run) para compilar e instalar
4. En la parte inferior, abre la pestaña **"Logcat"**
5. En el filtro, escribe: `GoogleAuth`
6. Haz login con Google
7. Copia todos los logs que aparezcan

---

## 🔍 Opción 3: Terminal con ADB

### Desde la terminal:

```bash
# Ver logs en tiempo real
adb logcat | findstr "GoogleAuth"

# O para ver todo:
adb logcat -v time
```

---

## 📋 Qué Buscar

Busca mensajes que contengan:

- `[GoogleAuth]`
- `GoogleSignIn`
- `FirebaseAuth`
- `Error`
- `Exception`

---

## ⚠️ IMPORTANTE ANTES DE VER LOGS

Asegúrate de que el build se hizo DESPUÉS del cambio en MainActivity:

```bash
cd android
.\gradlew.bat clean
cd ..
npx cap sync android
npx cap run android
```

Si no hiciste estos pasos después de modificar MainActivity.java, el cambio NO se aplicó.
