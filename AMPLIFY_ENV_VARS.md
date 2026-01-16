# Variables de Entorno para AWS Amplify

## Variables Requeridas

Configura estas variables en AWS Amplify Console:

### 1. EXPO_PUBLIC_API_BASE_URL (Requerida)

**Nombre:** `EXPO_PUBLIC_API_BASE_URL`

**Valor:** `https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev`

**Descripción:** URL base del backend API (AWS Lambda)

**Dónde configurar:**
1. En Amplify Console, ve a tu app
2. Click en "Environment variables" en el menú lateral
3. Click en "Manage variables"
4. Agrega:
   - Key: `EXPO_PUBLIC_API_BASE_URL`
   - Value: `https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev`

## Variables Opcionales

### Para Desarrollo Local (no necesario en Amplify)

Si estás desarrollando localmente, puedes crear un archivo `.env` en `apps/client/`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/dev
```

**Nota:** Este archivo NO debe subirse a GitHub (está en .gitignore)

## Cómo Agregar Variables en Amplify

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona tu app
3. En el menú lateral, click en "Environment variables"
4. Click en "Manage variables"
5. Click en "Add variable"
6. Ingresa:
   - **Key:** `EXPO_PUBLIC_API_BASE_URL`
   - **Value:** `https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev`
7. Click en "Save"
8. Amplify hará un nuevo deploy automáticamente

## Verificación

Después de agregar las variables, verifica que estén disponibles:

1. Ve a la sección "Build settings"
2. Revisa que las variables aparezcan en el log de build
3. O verifica en el código de la app que `process.env.EXPO_PUBLIC_API_BASE_URL` tenga el valor correcto

## Notas Importantes

- Las variables que empiezan con `EXPO_PUBLIC_` son accesibles en el código del frontend
- Las variables sin este prefijo NO estarán disponibles en el cliente
- Después de agregar/modificar variables, Amplify hará un nuevo deploy automáticamente
- Si cambias el backend API, actualiza esta variable


