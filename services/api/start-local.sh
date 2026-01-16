#!/bin/bash

# Script para iniciar el entorno de desarrollo local completo

echo "🚀 Iniciando entorno de desarrollo local..."

# Verificar Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop y vuelve a intentar."
    exit 1
fi

# Iniciar DynamoDB Local
echo "📦 Iniciando DynamoDB Local..."
if docker ps -a | grep -q dynamodb-local; then
    echo "   Reiniciando contenedor existente..."
    docker start dynamodb-local > /dev/null 2>&1 || docker rm dynamodb-local && docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
else
    echo "   Creando nuevo contenedor..."
    docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
fi

# Esperar a que DynamoDB esté listo
echo "⏳ Esperando que DynamoDB Local esté listo..."
sleep 3

# Verificar que está corriendo
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ DynamoDB Local está corriendo en http://localhost:8000"
else
    echo "⚠️  DynamoDB Local puede estar aún iniciando..."
fi

# Ejecutar seed
echo "🌱 Ejecutando seed..."
AWS_ENDPOINT_URL=http://localhost:8000 npm run seed

echo ""
echo "✅ Setup completo!"
echo ""
echo "Ahora puedes iniciar el backend con:"
echo "  npm run dev"
echo ""
echo "Y en otra terminal, el frontend con:"
echo "  cd ../../apps/client && npm start"


