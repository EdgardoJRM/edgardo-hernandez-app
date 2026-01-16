import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAttendanceByUser, getTodayAttendance } from '../../models/attendance';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);

    const userId = event.queryStringParameters?.userId || authEvent.userId;
    const todayOnly = event.queryStringParameters?.today === 'true';

    // Si el usuario no es empleado, solo puede ver su propia asistencia
    if (authEvent.userRole !== 'employee' && authEvent.userRole !== 'admin') {
      const attendance = await getAttendanceByUser(authEvent.userId);
      return successResponse(attendance);
    }

    // Empleados pueden ver todo
    let attendance;
    if (todayOnly) {
      attendance = await getTodayAttendance();
    } else {
      attendance = await getAttendanceByUser(userId);
    }

    return successResponse(attendance);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getAttendance:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

