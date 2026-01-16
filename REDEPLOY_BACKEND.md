# Guía para Redeploy del Backend

## Problema Actual

El backend está devolviendo error 502, lo que significa que el Lambda está crasheando. Necesitamos hacer redeploy para aplicar los cambios recientes.

## Pasos para Redeploy

### 1. Verificar que estás en el directorio correcto

```bash
cd services/api
```

### 2. Verificar que las dependencias estén instaladas

```bash
npm install
```

### 3. Verificar configuración de AWS

```bash
aws configure list
```

Si no está configurado:
```bash
aws configure
```

### 4. Hacer deploy

```bash
npm run deploy
```

O si no existe el script:
```bash
npx serverless deploy
```

### 5. Verificar el deploy

Después del deploy, deberías ver la URL del API Gateway. Verifica que sea:
```
https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev
```

### 6. Probar el endpoint

```bash
curl -X POST https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev/auth/start \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Deberías recibir una respuesta con `{"success": true, "data": {"message": "sent"}}`

## Si el deploy falla

### Verificar variables de entorno

Asegúrate de tener configuradas:
- `AWS_REGION` (default: us-east-1)
- `JWT_SECRET`
- `SES_FROM_EMAIL`
- `APP_BASE_URL`

### Verificar permisos de AWS

El usuario de AWS necesita permisos para:
- Lambda
- API Gateway
- DynamoDB
- SES
- IAM (para crear roles)

### Ver logs de CloudWatch

Si el deploy funciona pero sigue dando 502, revisa los logs:

```bash
aws logs tail /aws/lambda/edgardo-hernandez-api-dev-authStart --follow
```

## Notas

- El deploy puede tomar varios minutos
- Después del deploy, puede tomar unos segundos para que los cambios se propaguen
- Si cambias la estructura de las tablas DynamoDB, puede ser necesario recrearlas

