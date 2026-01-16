import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from '../../utils/response';
import { authenticateRequest, requireRole } from '../../utils/auth';
import { getAllMaterials, getMaterialsByCategory } from '../../models/material';
import { getUserAccess, checkUserAccess } from '../../models/access';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authEvent = await authenticateRequest(event);

    // Empleados ven todos los materiales
    if (authEvent.userRole === 'employee' || authEvent.userRole === 'admin') {
      const category = event.queryStringParameters?.category;
      const materials = category
        ? await getMaterialsByCategory(category)
        : await getAllMaterials();
      return successResponse(materials);
    }

    // Usuarios normales solo ven materiales a los que tienen acceso
    const userAccesses = await getUserAccess(authEvent.userId, 'material');
    const accessibleMaterialIds = new Set(userAccesses.map(a => a.resourceId));
    
    const allMaterials = await getAllMaterials();
    const accessibleMaterials = allMaterials.filter(m => accessibleMaterialIds.has(m.materialId));

    return successResponse(accessibleMaterials);
  } catch (error: any) {
    if (error.message === 'Token de autorización faltante' || error.message === 'Token inválido o expirado') {
      return errorResponse(error.message, 401);
    }
    console.error('Error in getMaterials:', error);
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};

