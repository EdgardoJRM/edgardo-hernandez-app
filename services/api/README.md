# Edgardo Hernandez The App - Backend API

Backend serverless con AWS Lambda, API Gateway, DynamoDB y SES.

## Setup

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env` con:
```
JWT_SECRET=your-secret-key-change-this-in-production
SES_FROM_EMAIL=noreply@edgardohernandez.com
APP_BASE_URL=http://localhost:8081
AWS_REGION=us-east-1
```

3. Iniciar desarrollo local:
```bash
npm run dev
```

Esto inicia Serverless Offline en `http://localhost:3000`

4. Seed inicial de datos:
```bash
npm run seed
```

## Estructura

- `src/handlers/` - Lambda handlers
  - `auth/` - Autenticación (start, verify-otp, exchange-magic)
  - `users/` - Usuarios (getMe, updateMe)
  - `forms/` - Formularios (getForms, getForm, submitForm)
  - `submissions/` - Respuestas (getSubmissions, getSubmission)
- `src/models/` - Modelos de datos (User, AuthChallenge, Form, Submission)
- `src/utils/` - Utilidades (DynamoDB, JWT, Email, Auth, etc.)
- `src/engines/` - Engines de procesamiento de formularios
- `scripts/` - Scripts de utilidad (seed)

## Endpoints

### Auth (público)
- `POST /auth/start` - Iniciar autenticación (Magic Link o OTP)
- `POST /auth/verify-otp` - Verificar código OTP
- `POST /auth/exchange-magic` - Intercambiar Magic Link por token

### Usuarios (protegido)
- `GET /me` - Obtener perfil
- `PUT /me` - Actualizar perfil

### Formularios (protegido)
- `GET /forms` - Listar formularios
- `GET /forms/{formId}` - Obtener formulario
- `POST /forms/{formId}/submit` - Enviar formulario

### Respuestas (protegido)
- `GET /submissions` - Listar respuestas del usuario
- `GET /submissions/{submissionId}` - Obtener respuesta

## Deployment

```bash
npm run deploy
```


