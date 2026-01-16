import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAllEvents, getUpcomingEvents, getEventsByStatus } from '../../models/event';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);

    const upcoming = event.queryStringParameters?.upcoming === 'true';
    const status = event.queryStringParameters?.status;

    let events;
    if (upcoming) {
      events = await getUpcomingEvents();
    } else if (status) {
      events = await getEventsByStatus(status as any);
    } else {
      // Solo empleados pueden ver todos los eventos
      if (authEvent.userRole !== 'employee' && authEvent.userRole !== 'admin') {
        events = await getUpcomingEvents(); // Usuarios normales solo ven próximos eventos publicados
      } else {
        events = await getAllEvents();
      }
    }

    return successResponse(events);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getEvents:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

