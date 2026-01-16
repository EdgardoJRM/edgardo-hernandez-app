# 🚀 Quick Start - Desarrollo Local

## Opción Recomendada: Docker

### 1. Inicia Docker Desktop
Asegúrate de que Docker Desktop esté corriendo.

### 2. Ejecuta el setup automático
```bash
npm run setup:local
```

O manualmente:
```bash
# Inicia DynamoDB Local
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# Ejecuta el seed
AWS_ENDPOINT_URL=http://localhost:8000 npm run seed
```

### 3. Inicia el backend
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 4. Inicia el frontend (en otra terminal)
```bash
cd ../../apps/client
npm start
```

## Verificar que todo funciona

1. Backend: `curl http://localhost:3000/dev/forms` (debería requerir auth)
2. DynamoDB: `curl http://localhost:8000` (debería responder)
3. Frontend: Abre en el navegador (Expo lo abrirá automáticamente)

## Troubleshooting

### Docker no está corriendo
- Inicia Docker Desktop
- Espera a que esté completamente iniciado
- Vuelve a ejecutar `npm run setup:local`

### DynamoDB no responde
```bash
# Verificar que el contenedor está corriendo
docker ps | grep dynamodb-local

# Si no está, inícialo
docker start dynamodb-local

# O créalo de nuevo
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

### Seed falla
- Asegúrate de que DynamoDB Local esté corriendo
- Verifica: `curl http://localhost:8000`
- Ejecuta: `AWS_ENDPOINT_URL=http://localhost:8000 npm run seed`


