# Firebase Setup Guide

## 🚀 Configuración de Firebase para Dream Journal

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "dream-journal-app")
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

### 2. Configurar Authentication

1. En el panel izquierdo, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Correo electrónico/contraseña"
5. Guarda los cambios

### 3. Configurar Firestore Database

1. En el panel izquierdo, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (para desarrollo)
4. Elige una ubicación (ej: us-central1)
5. Crea la base de datos

### 4. Configurar Storage

1. En el panel izquierdo, ve a "Storage"
2. Haz clic en "Comenzar"
3. Revisa las reglas de seguridad
4. Elige una ubicación (misma que Firestore)
5. Crea el bucket

### 5. Obtener Configuración del Proyecto

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. Desplázate hasta "Tus apps"
3. Haz clic en "Agregar app" y selecciona "Web" (</>)
4. Registra tu app con un nombre (ej: "dream-journal-web")
5. Copia la configuración de Firebase

### 6. Actualizar Variables de Entorno

Reemplaza los valores en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "tu-api-key-aqui",
    authDomain: "tu-proyecto-id.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto-id.appspot.com",
    messagingSenderId: "tu-sender-id",
    appId: "tu-app-id"
  }
};
```

### 7. Reglas de Seguridad

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a sus propios sueños
    match /dreams/{dreamId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuarios solo pueden acceder a sus propios archivos de audio
    match /audio/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8. Límites del Plan Gratuito

- **Firestore**: 1GB almacenamiento, 50K operaciones/día
- **Storage**: 1GB almacenamiento, 1GB/día de descarga
- **Authentication**: Ilimitado
- **Hosting**: 10GB almacenamiento, 10GB/mes de transferencia

### 9. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar en dispositivo
ionic capacitor run android
ionic capacitor run ios
```

### 10. Estructura de Datos

#### Colección: dreams
```typescript
{
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'good' | 'bad' | 'neutral';
  date: string; // YYYY-MM-DD
  audioPath?: string; // URL de Firebase Storage
  createdAt: string;
  updatedAt?: string;
}
```

#### Estructura de Storage
```
/audio/
  /{userId}/
    /audio_timestamp_random.wav
```

### 11. Funcionalidades Implementadas

✅ **Autenticación**
- Registro con email/contraseña
- Login con email/contraseña
- Logout
- Persistencia de sesión

✅ **Almacenamiento Híbrido**
- Datos locales (Capacitor Preferences)
- Sincronización con Firebase
- Respaldo automático
- Funcionamiento offline

✅ **Archivos de Audio**
- Subida a Firebase Storage
- URLs de descarga
- Eliminación automática

✅ **Sincronización**
- Tiempo real
- Resolución de conflictos
- Sincronización automática

### 12. Próximos Pasos

1. Configurar Firebase con tus credenciales
2. Probar la autenticación
3. Verificar la sincronización
4. Configurar reglas de seguridad
5. Desplegar a producción

### 13. Solución de Problemas

#### Error de CORS
- Verifica que el dominio esté en la lista de dominios autorizados

#### Error de permisos
- Revisa las reglas de Firestore y Storage
- Verifica que el usuario esté autenticado

#### Error de red
- La app funciona offline con datos locales
- Se sincroniza automáticamente cuando hay conexión

### 14. Monitoreo

- Ve a Firebase Console > Analytics para ver estadísticas
- Revisa los logs en Firebase Console > Functions
- Monitorea el uso en Firebase Console > Usage

¡Tu app de sueños ahora tiene sincronización en la nube! 🌙✨
