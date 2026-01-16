# Configuración de Webhook de ClickFunnels para Envío Automático de Tickets

## Descripción

Este sistema permite que cuando un cliente compre un producto en ClickFunnels que esté asociado a un evento o taller, se le envíe automáticamente el ticket de entrada por email.

## Funcionamiento

1. **Asociar Producto con Evento**: Al crear un evento, puedes asociarlo con un producto de ClickFunnels usando el campo `clickfunnelsProductId`.

2. **Webhook de ClickFunnels**: Cuando se completa una orden en ClickFunnels, se envía un webhook a nuestro sistema.

3. **Procesamiento Automático**:
   - El sistema verifica si algún producto de la orden está asociado a un evento
   - Si encuentra una asociación, registra automáticamente al usuario en el evento
   - Genera un código único de ticket
   - Envía el ticket por email con el QR code

## Configuración del Evento

### 1. Crear Evento con Producto de ClickFunnels

Al crear un evento, incluye el `clickfunnelsProductId`:

```json
{
  "title": "Taller de Marketing Digital",
  "type": "workshop",
  "startDate": 1704067200000,
  "endDate": 1704074400000,
  "location": "Oficina Principal",
  "capacity": 50,
  "price": 99,
  "status": "published",
  "clickfunnelsProductId": "123456"  // ID del producto en ClickFunnels
}
```

### 2. Obtener el ID del Producto en ClickFunnels

1. Ve a tu cuenta de ClickFunnels
2. Navega a "Products" o "Productos"
3. Selecciona el producto que quieres asociar
4. El ID del producto está en la URL o en los detalles del producto

## Configuración del Webhook en ClickFunnels

### Paso 1: Obtener la URL del Webhook

Después de hacer deploy del backend, obtén la URL del endpoint:

```
https://TU_API_ID.execute-api.us-east-1.amazonaws.com/dev/webhooks/clickfunnels/order
```

### Paso 2: Configurar Webhook en ClickFunnels

1. **Opción A: Desde la API de ClickFunnels**
   - Ve a la documentación de webhooks de ClickFunnels
   - Crea un webhook endpoint apuntando a tu URL
   - Selecciona el evento: `order.completed` o `order.paid`

2. **Opción B: Desde el Dashboard de ClickFunnels**
   - Ve a Settings > Integrations > Webhooks
   - Click en "Add Webhook"
   - URL: `https://TU_API_ID.execute-api.us-east-1.amazonaws.com/dev/webhooks/clickfunnels/order`
   - Evento: `order.completed` o `order.paid`
   - Método: `POST`
   - Guarda la configuración

### Paso 3: Verificar el Webhook

Puedes probar el webhook enviando una petición de prueba:

```bash
curl -X POST https://TU_API_ID.execute-api.us-east-1.amazonaws.com/dev/webhooks/clickfunnels/order \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "order.completed",
    "order": {
      "id": "test-123",
      "contact": {
        "email": "test@example.com",
        "name": "Test User",
        "first_name": "Test",
        "last_name": "User"
      },
      "products": [
        {
          "product_id": "123456",
          "name": "Taller de Marketing"
        }
      ]
    }
  }'
```

## Estructura del Webhook

El webhook espera recibir datos en uno de estos formatos:

### Formato 1:
```json
{
  "event_type": "order.completed",
  "order": {
    "id": "order-123",
    "contact": {
      "email": "cliente@example.com",
      "name": "Juan Pérez",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+1234567890"
    },
    "products": [
      {
        "product_id": "123456",
        "name": "Taller de Marketing Digital"
      }
    ]
  }
}
```

### Formato 2:
```json
{
  "type": "order.completed",
  "data": {
    "order": {
      "id": "order-123",
      "email": "cliente@example.com",
      "name": "Juan Pérez",
      "products": [
        {
          "id": "123456"
        }
      ]
    }
  }
}
```

## Flujo Completo

1. **Cliente compra producto en ClickFunnels**
   - El producto tiene ID: `123456`
   - ClickFunnels procesa el pago

2. **ClickFunnels envía webhook**
   - Evento: `order.completed`
   - Datos de la orden y productos

3. **Nuestro sistema procesa el webhook**
   - Busca eventos asociados al producto `123456`
   - Encuentra el evento "Taller de Marketing Digital"
   - Obtiene o crea el usuario con el email del cliente
   - Crea el registro en el evento
   - Genera código de ticket único
   - Envía email con el ticket

4. **Cliente recibe email**
   - Email con todos los detalles del evento
   - Código de ticket único
   - QR code para check-in
   - Link para ver la entrada completa

## Manejo de Errores

El sistema maneja varios casos:

- **Producto no asociado a evento**: Se ignora silenciosamente
- **Evento lleno**: Se registra el error pero no se crea el registro
- **Usuario ya registrado**: Se reenvía el ticket existente
- **Error enviando email**: El registro se crea pero se marca el error

## Logs y Monitoreo

Todos los webhooks se registran en CloudWatch. Puedes monitorear:

- Webhooks recibidos
- Eventos procesados
- Registros creados
- Emails enviados
- Errores

## Seguridad

**Nota importante**: El endpoint del webhook actualmente no tiene autenticación. Para producción, deberías:

1. **Agregar verificación de firma**: ClickFunnels puede enviar una firma en el header
2. **Agregar API Key**: Validar que las peticiones vengan de ClickFunnels
3. **Rate limiting**: Limitar el número de peticiones por IP

Ejemplo de verificación de firma:

```typescript
// En el handler
const signature = event.headers['x-clickfunnels-signature'];
const expectedSignature = calculateSignature(event.body, CLICKFUNNELS_WEBHOOK_SECRET);
if (signature !== expectedSignature) {
  return errorResponse('Invalid signature', 401);
}
```

## Pruebas

Para probar localmente:

1. Inicia el servidor local:
```bash
cd services/api
npm run dev
```

2. El webhook estará disponible en:
```
http://localhost:3001/dev/webhooks/clickfunnels/order
```

3. Usa ngrok o similar para exponer el endpoint local:
```bash
ngrok http 3001
```

4. Configura el webhook en ClickFunnels apuntando a la URL de ngrok

## Troubleshooting

### El webhook no se recibe

1. Verifica que la URL esté correcta
2. Verifica que el endpoint esté desplegado
3. Revisa los logs de CloudWatch
4. Verifica que ClickFunnels esté enviando el webhook

### El ticket no se envía

1. Verifica que el `clickfunnelsProductId` coincida exactamente
2. Verifica que el evento esté en estado `published`
3. Revisa los logs de email en CloudWatch
4. Verifica que SES esté configurado correctamente

### Usuario no se registra

1. Verifica que el email esté presente en el webhook
2. Verifica que el evento tenga capacidad disponible
3. Revisa los logs para ver errores específicos

