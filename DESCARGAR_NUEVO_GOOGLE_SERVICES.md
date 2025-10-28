# ⚠️ IMPORTANTE: Descargar Nuevo google-services.json

## 🔴 Problema Identificado

Ya tienes el SHA-1 agregado en Firebase Console, pero el error persiste porque **necesitas descargar un NUEVO google-services.json** después de agregar el SHA-1.

## ✅ Solución

### Paso 1: Descargar el nuevo google-services.json

1. En la pantalla que ya tienes abierta en Firebase Console
2. Baja hasta encontrar el botón **"google-services.json"** (con el ícono de descarga)
3. Click en **"google-services.json"** para descargarlo
4. Se descargará el archivo actualizado con la configuración del SHA-1

### Paso 2: Reemplazar el archivo en tu proyecto

1. Ve a la carpeta `android/app/` de tu proyecto
2. **REEMPLAZA** el archivo `google-services.json` existente con el que acabas de descargar
3. Asegúrate de que el archivo esté exactamente en: `android/app/google-services.json`

### Paso 3: Sincronizar y limpiar

```bash
# Limpia el build anterior
cd android
.\gradlew.bat clean
cd ..

# Sincroniza Capacitor
npx cap sync android

# Ejecuta la app
npx cap run android
```

## 🔍 Verificación

El nuevo `google-services.json` debe contener tu SHA-1. Puedes verificarlo abriendo el archivo y buscando la sección `oauth_client` que contenga información del certificado.

## ⏱️ Tiempo de Espera

A veces Firebase tarda unos minutos en propagar los cambios. Si después de reemplazar el archivo aún falla:

- Espera 2-3 minutos
- Limpia el build: `cd android && .\gradlew.bat clean && cd ..`
- Vuelve a sincronizar: `npx cap sync android`
- Prueba de nuevo

## 🎯 Siguiente Paso

Después de hacer esto, la app debería funcionar correctamente.
