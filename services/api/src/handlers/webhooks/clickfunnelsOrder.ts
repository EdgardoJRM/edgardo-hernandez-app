import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { getEventByClickFunnelsProductId } from '../../models/event';
import { createRegistration, getRegistrationsByEvent } from '../../models/eventRegistration';
import { generateTicketCode, sendEventTicketEmail } from '../../utils/eventTickets';
import { getClickFunnelsContact } from '../../utils/clickfunnels';
import { getOrCreateUser } from '../../models/user';

/**
 * Handler para recibir webhooks de ClickFunnels cuando se completa una orden
 * 
 * Este handler procesa órdenes de ClickFunnels y si el producto está asociado
 * a un evento, registra automáticamente al usuario y envía el ticket por email.
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Verificar que el webhook tenga el body
    if (!event.body) {
      return errorResponse('El cuerpo de la solicitud es requerido', 400);
    }

    const webhookData = JSON.parse(event.body);

    // Verificar que sea un evento de orden completada
    // La estructura puede variar según ClickFunnels, ajusta según su documentación
    if (webhookData.event_type !== 'order.completed' && webhookData.type !== 'order.completed') {
      return successResponse({ message: 'Evento no procesado' });
    }

    // Extraer información de la orden
    const order = webhookData.order || webhookData.data?.order || webhookData;
    const contactEmail = order.contact?.email || order.email || webhookData.contact?.email;
    const contactName = order.contact?.name || order.name || webhookData.contact?.name || 
                       `${order.contact?.first_name || ''} ${order.contact?.last_name || ''}`.trim();
    
    if (!contactEmail) {
      return errorResponse('Email del contacto no encontrado en la orden', 400);
    }

    // Obtener productos de la orden
    const products = order.products || order.line_items || [];
    
    if (!products || products.length === 0) {
      return successResponse({ message: 'Orden sin productos' });
    }

    const results = [];

    // Procesar cada producto de la orden
    for (const product of products) {
      const productId = product.product_id || product.id;
      
      if (!productId) {
        continue;
      }

      // Buscar si hay un evento asociado a este producto
      const eventData = await getEventByClickFunnelsProductId(String(productId));
      
      if (!eventData) {
        // No hay evento asociado, continuar con el siguiente producto
        continue;
      }

      // Verificar capacidad del evento
      if (eventData.capacity) {
        const existingRegistrations = await getRegistrationsByEvent(eventData.eventId);
        const confirmedCount = existingRegistrations.filter(
          r => r.status === 'confirmed' || r.status === 'checked_in'
        ).length;
        
        if (confirmedCount >= eventData.capacity) {
          results.push({
            productId,
            eventId: eventData.eventId,
            eventTitle: eventData.title,
            status: 'error',
            message: 'El evento está lleno',
          });
          continue;
        }
      }

      // Obtener o crear usuario
      let user = await getOrCreateUser(contactEmail);
      
      // Si no tiene nombre, intentar obtenerlo de ClickFunnels
      if (!user.name && contactName) {
        const { updateUser } = await import('../../models/user');
        user = await updateUser(user.userId, { name: contactName });
      }

      // Verificar si ya está registrado en el evento
      const existingRegistrations = await getRegistrationsByEvent(eventData.eventId);
      const existingRegistration = existingRegistrations.find(
        r => r.email === contactEmail || r.userId === user.userId
      );

      if (existingRegistration) {
        // Ya está registrado, reenviar el ticket
        try {
          await sendEventTicketEmail(
            contactEmail,
            user.name || contactName || 'Usuario',
            eventData,
            existingRegistration.ticketCode
          );
          results.push({
            productId,
            eventId: eventData.eventId,
            eventTitle: eventData.title,
            status: 'success',
            message: 'Ticket reenviado',
            registrationId: existingRegistration.registrationId,
          });
        } catch (emailError: any) {
          console.error('Error reenviando ticket:', emailError);
          results.push({
            productId,
            eventId: eventData.eventId,
            eventTitle: eventData.title,
            status: 'error',
            message: 'Error reenviando ticket',
          });
        }
        continue;
      }

      // Generar código único de ticket
      const ticketCode = generateTicketCode();

      // Crear registro automático
      try {
        const registration = await createRegistration({
          eventId: eventData.eventId,
          userId: user.userId,
          email: contactEmail,
          name: user.name || contactName || 'Usuario',
          phone: order.contact?.phone || order.phone,
          ticketCode,
          status: 'confirmed',
          paymentStatus: 'paid', // Ya pagó en ClickFunnels
          metadata: {
            orderId: order.id || order.order_id,
            productId,
            source: 'clickfunnels_webhook',
            purchasedAt: Date.now(),
          },
        });

        // Enviar email con la entrada
        try {
          await sendEventTicketEmail(
            contactEmail,
            user.name || contactName || 'Usuario',
            eventData,
            ticketCode
          );
          
          results.push({
            productId,
            eventId: eventData.eventId,
            eventTitle: eventData.title,
            status: 'success',
            message: 'Registro automático exitoso y ticket enviado',
            registrationId: registration.registrationId,
          });
        } catch (emailError: any) {
          console.error('Error enviando ticket email:', emailError);
          // El registro se creó pero el email falló
          results.push({
            productId,
            eventId: eventData.eventId,
            eventTitle: eventData.title,
            status: 'partial',
            message: 'Registro creado pero error enviando email',
            registrationId: registration.registrationId,
          });
        }
      } catch (registrationError: any) {
        console.error('Error creando registro:', registrationError);
        results.push({
          productId,
          eventId: eventData.eventId,
          eventTitle: eventData.title,
          status: 'error',
          message: registrationError.message || 'Error creando registro',
        });
      }
    }

    return successResponse({
      message: 'Webhook procesado',
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error processing ClickFunnels webhook:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

