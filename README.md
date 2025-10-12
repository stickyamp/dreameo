# Dream Journal

Una aplicación móvil multiplataforma para organizar y registrar tus sueños, construida con Ionic + Angular + Capacitor.

## 🎯 Características

- 📅 **Calendario Mensual**: Visualiza y navega por tus sueños organizados por fecha
- ✍️ **Registro de Sueños**: Registra tus sueños con título y descripción detallada
- 🎤 **Grabación de Voz**: Añade grabaciones de audio como alternativa al texto
- 🌙 **Tema Nocturno**: Diseño oscuro optimizado para el tema de sueños
- 💾 **Almacenamiento Local**: Todos los datos se guardan de forma segura en tu dispositivo
- 📤 **Exportación**: Exporta todos tus sueños en formato JSON
- 🗑️ **Gestión de Datos**: Elimina datos individuales o limpia todo el almacenamiento

## 🛠️ Stack Tecnológico

- **Frontend**: Ionic Framework 7 + Angular 17 (Standalone Components)
- **Mobile Bridge**: Capacitor 5
- **Persistencia**: Capacitor Preferences API
- **Audio**: Web Audio API
- **Styling**: SCSS con variables CSS personalizadas

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Ionic CLI: `npm install -g @ionic/cli`
- Para desarrollo móvil: Android Studio y/o Xcode

### Configuración del Proyecto

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo web**:
   ```bash
   ionic serve
   ```

3. **Construir para producción**:
   ```bash
   ionic build
   ```

### Configuración Móvil

1. **Añadir plataformas**:
   ```bash
   ionic capacitor add android
   ionic capacitor add ios
   ```

2. **Sincronizar archivos**:
   ```bash
   ionic capacitor sync
   ```

3. **Ejecutar en dispositivo/emulador**:
   ```bash
   ionic capacitor run android
   ionic capacitor run ios
   ```

## 📱 Estructura de la Aplicación

### Páginas Principales

- **Splash**: Pantalla de bienvenida con logo y navegación al calendario
- **Calendario**: Vista mensual con días marcados que contienen sueños
- **Lista de Sueños**: Visualización de sueños por fecha seleccionada
- **Agregar/Editar Sueño**: Modal para crear o modificar entradas de sueños
- **Detalle de Sueño**: Vista completa de un sueño individual
- **Perfil/Configuración**: Gestión de configuraciones y datos

### Navegación

- **Tabs Bottom**: Calendario, Sueños Recientes, Perfil
- **Modales**: Para agregar/editar sueños y visualizar detalles
- **Navegación Gestos**: Soporte completo para gestos nativos

## 🎨 Diseño y UX

### Tema Visual

- **Colores Primarios**: Violeta (#8a2be2) y gradientes nocturnos
- **Fondo**: Gradiente oscuro (#2d1b69 → #1a0f3d)
- **Iconografía**: Elementos relacionados con sueños (🌙, ✨, 💤)
- **Tipografía**: Segoe UI con jerarquía clara

### Interacciones

- **Animaciones Suaves**: Transiciones de 300ms para elementos interactivos
- **Feedback Táctil**: Estados hover y active para botones
- **Indicadores Visuales**: Días con sueños marcados con íconos luna
- **Estados de Carga**: Feedback durante grabación y reproducción de audio

## 🗂️ Estructura del Código

```
src/app/
├── models/
│   └── dream.model.ts           # Interfaces y tipos
├── services/
│   ├── dream.service.ts         # Gestión de sueños y almacenamiento
│   └── audio.service.ts         # Grabación y reproducción de audio
├── pages/
│   ├── splash/                  # Pantalla de bienvenida
│   ├── calendar/                # Vista de calendario
│   ├── dreams/                  # Lista de sueños recientes
│   ├── dream-list/              # Lista de sueños por fecha
│   ├── add-dream/               # Modal añadir/editar sueño
│   ├── dream-detail/            # Vista detalle de sueño
│   └── profile/                 # Configuración y perfil
├── tabs/
│   └── tabs.component.ts        # Navegación por tabs
├── app.component.ts             # Componente raíz
└── app.routes.ts                # Configuración de rutas
```

## 💾 Almacenamiento de Datos

### Modelo de Datos

```typescript
interface Dream {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  description?: string;
  audioPath?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Persistencia

- **Capacitor Preferences**: Para datos estructurados JSON
- **Local Blob URLs**: Para archivos de audio temporales
- **Sin servidor**: Todos los datos permanecen en el dispositivo

## 🎤 Funcionalidades de Audio

### Grabación

- **MediaRecorder API**: Grabación nativa del navegador
- **Formato WebM**: Compatible con la mayoría de navegadores modernos
- **Permisos**: Solicitud automática de permisos de micrófono

### Reproducción

- **Audio Element**: Reproducción mediante elemento HTML5 Audio
- **Estados Visuales**: Indicadores de grabación y reproducción en curso
- **Gestión de Errores**: Manejo robusto de errores de audio

## 🔧 Personalización

### Colores

Los colores principales se pueden modificar en `src/theme/variables.scss`:

```scss
:root {
  --ion-color-primary: #8a2be2;
  --ion-color-dream: #2d1b69;
  --ion-color-moon: #ffd700;
}
```

### Configuraciones

- **Modo Oscuro**: Habilitado por defecto, configurable en perfil
- **Límites de Texto**: Título 100 chars, descripción 1000 chars
- **Exportación**: Formato JSON estructurado

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Audio no funciona**: Verificar permisos de micrófono
2. **Datos no se guardan**: Comprobar capacidad de almacenamiento
3. **App no carga en móvil**: Verificar configuración de Capacitor

### Logs y Debugging

```bash
# Ver logs de la aplicación
ionic capacitor run android -l --external

# Logs específicos de Capacitor
npx cap doctor
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

---

Desarrollado con ❤️ usando Ionic + Angular + Capacitor
