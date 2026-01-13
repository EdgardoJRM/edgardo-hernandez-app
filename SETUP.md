# Guía de Setup - Edgardo Hernandez "The App"

## Requisitos Previos

- Node.js 18+
- npm o yarn
- AWS CLI configurado (para deployment)
- Expo CLI: `npm install -g expo-cli`

## Setup Inicial

### 1. Backend (services/api)

```bash
cd services/api
npm install
```

Crea un archivo `.env`:
```
JWT_SECRET=tu-secreto-jwt-cambiar-en-produccion
SES_FROM_EMAIL=noreply@edgardohernandez.com
APP_BASE_URL=http://localhost:8081
AWS_REGION=us-east-1
```

**Nota importante sobre SES:**
- Para desarrollo local, puedes usar AWS SES en modo "sandbox" o configurar un servicio de email alternativo
- En producción, verifica tu dominio/email en SES

Inicia el servidor local:
```bash
npm run dev
```

En otra terminal, ejecuta el seed:
```bash
npm run seed
```

### 2. Frontend (apps/client)

```bash
cd apps/client
npm install
```

Crea un archivo `.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/dev
```

Inicia Expo:
```bash
npm start
```

Presiona `w` para abrir en web, o escanea el QR para móvil.

### 3. Assets (Opcional para desarrollo)

Para desarrollo, Expo puede funcionar sin assets personalizados, pero para producción necesitarás:
- `apps/client/assets/icon.png` (1024x1024)
- `apps/client/assets/splash.png` (1242x2436)
- `apps/client/assets/adaptive-icon.png` (1024x1024)
- `apps/client/assets/favicon.png` (48x48)

## Verificación

1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo (web en `http://localhost:8081` o similar)
3. Puedes probar el flujo de autenticación:
   - Ingresa un email
   - Elige OTP o Magic Link
   - Completa el flujo

## Troubleshooting

### Error: "Table not found"
- Asegúrate de haber ejecutado `serverless offline` al menos una vez para crear las tablas localmente
- O deploya primero: `npm run deploy` (en modo dev)

### Error: SES email
- En desarrollo local, puedes mockear el envío de emails temporalmente
- O configura SES en modo sandbox y verifica un email de prueba

### Error: CORS
- Verifica que `EXPO_PUBLIC_API_BASE_URL` apunte al backend correcto
- El backend debe tener CORS habilitado (ya está configurado en serverless.yml)

## Próximos Pasos

1. Configurar SES para producción
2. Agregar assets personalizados
3. Configurar dominio (app.edgardohernandez.com)
4. Deploy a producción

