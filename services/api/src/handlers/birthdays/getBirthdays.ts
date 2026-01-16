import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAllBirthdays, getUpcomingBirthdays, getTodayBirthdays, getBirthdayByUser } from '../../models/birthday';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);
    requireRole(authEvent, ['employee', 'admin']);

    const today = event.queryStringParameters?.today === 'true';
    const upcoming = event.queryStringParameters?.upcoming;
    const userId = event.queryStringParameters?.userId;

    let birthdays;
    if (userId) {
      const birthday = await getBirthdayByUser(userId);
      birthdays = birthday ? [birthday] : [];
    } else if (today) {
      birthdays = await getTodayBirthdays();
    } else if (upcoming) {
      const daysAhead = parseInt(upcoming) || 30;
      birthdays = await getUpcomingBirthdays(daysAhead);
    } else {
      birthdays = await getAllBirthdays();
    }

    return successResponse(birthdays);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getBirthdays:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

