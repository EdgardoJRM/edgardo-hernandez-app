# Setup DynamoDB Local - Opción Recomendada

## Opción 1: Docker (Más fácil y recomendado)

```bash
# Iniciar DynamoDB Local con Docker
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# Verificar que está corriendo
docker ps | grep dynamodb-local
```

Luego ejecuta el seed:
```bash
AWS_ENDPOINT_URL=http://localhost:8000 npm run seed
```

## Opción 2: Descarga Manual

1. Descarga DynamoDB Local desde: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html

2. Extrae el archivo en `services/api/.dynamodb/`

3. Inicia DynamoDB Local:
```bash
npm run dynamodb:start
```

4. En otra terminal, ejecuta el seed:
```bash
AWS_ENDPOINT_URL=http://localhost:8000 npm run seed
```

## Opción 3: Usar AWS (Para producción/testing real)

```bash
# Deploy a AWS primero
npm run deploy

# Luego ejecuta el seed
npm run seed
```

## Verificar que funciona

```bash
# Verificar que DynamoDB Local está corriendo
curl http://localhost:8000

# Debería responder con información de DynamoDB
```


