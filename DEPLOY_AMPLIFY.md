# Deploy a AWS Amplify

## Configuración del Proyecto

Este proyecto está configurado para deploy automático en AWS Amplify.

### Archivos de Configuración

- `amplify.yml` - Configuración de build para Amplify
- `.github/workflows/deploy.yml` - GitHub Actions (opcional)

## Pasos para Deploy

### 1. Subir a GitHub

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: Edgardo Hernandez The App"

# Crear repositorio en GitHub y agregar remote
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir código
git push -u origin main
```

### 2. Conectar con AWS Amplify

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click en "New app" > "Host web app"
3. Selecciona "GitHub" como fuente
4. Autoriza AWS Amplify a acceder a tu repositorio
5. Selecciona el repositorio y la rama (main/master)
6. Amplify detectará automáticamente `amplify.yml`

### 3. Variables de Entorno

En la configuración de Amplify, agrega estas variables de entorno:

```
EXPO_PUBLIC_API_BASE_URL=https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev
```

### 4. Build Settings

Amplify usará automáticamente el archivo `amplify.yml` que está en la raíz del proyecto.

### 5. Deploy

Una vez conectado, Amplify hará deploy automáticamente en cada push a la rama principal.

## Estructura del Proyecto

```
.
├── apps/
│   └── client/          # Frontend (Expo/React Native Web)
│       └── dist/        # Build output (generado por Amplify)
├── services/
│   └── api/             # Backend (AWS Lambda)
├── amplify.yml          # Configuración de build para Amplify
└── .gitignore
```

## Notas

- El frontend se build en `apps/client/dist`
- El backend debe desplegarse por separado usando `serverless deploy`
- Amplify solo maneja el frontend (web app)

## Troubleshooting

### Build falla

1. Verifica que `node_modules` esté en `.gitignore`
2. Verifica que las dependencias estén en `package.json`
3. Revisa los logs de build en Amplify Console

### Variables de entorno no funcionan

1. Asegúrate de que las variables estén configuradas en Amplify Console
2. Las variables deben empezar con `EXPO_PUBLIC_` para ser accesibles en el frontend

