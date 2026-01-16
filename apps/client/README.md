# Edgardo Hernandez The App - Frontend

Frontend Expo app con soporte web y móvil.

## Setup

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env` con:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/dev
```

3. Iniciar desarrollo:
```bash
npm start
```

Luego presiona `w` para abrir en web, o escanea el QR para móvil.

## Estructura

- `app/` - Pantallas usando expo-router
- `src/` - Utilidades y stores
  - `utils/` - Helpers (API, storage)
  - `store/` - Estado global (Zustand)

## Pantallas

- `/auth` - Inicio de sesión (Magic Link / OTP)
- `/auth/verify` - Verificación de código OTP
- `/auth/callback` - Callback para Magic Link
- `/dashboard` - Pantalla principal
- `/profile` - Perfil de usuario
- `/forms` - Lista de formularios
- `/forms/[formId]` - Ejecutar formulario
- `/submissions` - Historial de respuestas
- `/submissions/[id]` - Detalle de respuesta


