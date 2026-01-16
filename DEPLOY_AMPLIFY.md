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

**Requeridas:**
```
EXPO_PUBLIC_API_BASE_URL=https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev
```

**Cómo agregar:**
1. En Amplify Console, ve a tu app
2. Click en "Environment variables" en el menú lateral
3. Click en "Manage variables"
4. Agrega cada variable:
   - Key: `EXPO_PUBLIC_API_BASE_URL`
   - Value: `https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev`
5. Click en "Save"
6. Amplify hará un nuevo deploy automáticamente

**Nota:** Reemplaza la URL con la URL real de tu backend API después de hacer deploy del backend.

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

1. **Error: "dist folder not found"**
   - Verifica que el comando `npm run build:web` se ejecute correctamente
   - Revisa los logs de build en Amplify Console
   - Asegúrate de que `expo export` esté funcionando

2. **Error: "Module not found"**
   - Verifica que `node_modules` esté en `.gitignore`
   - Verifica que las dependencias estén en `package.json`
   - Limpia el cache en Amplify y vuelve a hacer build

3. **Error: "Command failed"**
   - Revisa los logs completos en Amplify Console
   - Verifica que Node.js 18+ esté configurado en Amplify
   - Asegúrate de que todas las dependencias estén instaladas

### Variables de entorno no funcionan

1. Asegúrate de que las variables estén configuradas en Amplify Console
2. Las variables deben empezar con `EXPO_PUBLIC_` para ser accesibles en el frontend
3. Después de agregar variables, Amplify hará un nuevo deploy automáticamente
4. Verifica en los logs de build que las variables estén disponibles

### El sitio no carga correctamente

1. Verifica que el `baseDirectory` en `amplify.yml` sea correcto (`apps/client/dist`)
2. Asegúrate de que el build genere archivos en la carpeta `dist`
3. Verifica que el `index.html` esté en la raíz de `dist`
4. Revisa la configuración de rewrites/redirects en Amplify Console si es necesario

### Backend no responde

1. Verifica que el backend esté desplegado correctamente
2. Actualiza `EXPO_PUBLIC_API_BASE_URL` con la URL correcta del API Gateway
3. Verifica que CORS esté configurado correctamente en el backend


