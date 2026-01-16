/**
 * ClickFunnels API Integration
 * Verifica el estado, tags y otra información del usuario en ClickFunnels
 */

interface ClickFunnelsContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  status?: string;
  customFields?: Record<string, any>;
}

interface ClickFunnelsApiResponse {
  contact?: ClickFunnelsContact;
  error?: string;
}

const CLICKFUNNELS_CLIENT_ID = process.env.CLICKFUNNELS_CLIENT_ID || '_NH9cr55huOJbUNvcLk-MYRKhQ_h1JyEEAGalc10da8';
const CLICKFUNNELS_CLIENT_SECRET = process.env.CLICKFUNNELS_CLIENT_SECRET || 'LzEJNuCFcYNc1LWfM05C51Hb54xAbdJPz51mHCK60Xs';
const CLICKFUNNELS_API_KEY = process.env.CLICKFUNNELS_API_KEY; // Para compatibilidad con API key directa
const CLICKFUNNELS_SUBDOMAIN = process.env.CLICKFUNNELS_SUBDOMAIN || 'edgardohernandez';
const CLICKFUNNELS_WORKSPACE_ID = process.env.CLICKFUNNELS_WORKSPACE_ID || 'jwRGrB';
const CLICKFUNNELS_API_URL = process.env.CLICKFUNNELS_API_URL || `https://${process.env.CLICKFUNNELS_SUBDOMAIN || 'edgardohernandez'}.myclickfunnels.com/api/v2`;
const CLICKFUNNELS_OAUTH_URL = process.env.CLICKFUNNELS_OAUTH_URL || 'https://accounts.clickfunnels.com/oauth/token';

// Cache para el access token
let accessTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Obtiene un access token usando OAuth2
 */
async function getAccessToken(): Promise<string | null> {
  // Si hay un token en cache y no ha expirado, usarlo
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  if (!CLICKFUNNELS_CLIENT_ID || !CLICKFUNNELS_CLIENT_SECRET) {
    console.warn('CLICKFUNNELS_CLIENT_ID o CLICKFUNNELS_CLIENT_SECRET no configurados');
    return null;
  }

  try {
    const response = await fetch(CLICKFUNNELS_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: CLICKFUNNELS_CLIENT_ID,
        client_secret: CLICKFUNNELS_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth error: ${response.status}`);
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 3600; // Default 1 hora
    accessTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (expiresIn * 1000) - 60000, // Expira 1 minuto antes
    };

    return data.access_token;
  } catch (error: any) {
    console.error('Error getting ClickFunnels access token:', error);
    return null;
  }
}

/**
 * Hace una petición autenticada a la API de ClickFunnels
 */
async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let authHeader = '';
  
  // Intentar usar API key primero (si está disponible)
  if (CLICKFUNNELS_API_KEY) {
    authHeader = `Bearer ${CLICKFUNNELS_API_KEY}`;
  } else {
    // Usar OAuth2
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No se pudo obtener access token de ClickFunnels');
    }
    authHeader = `Bearer ${token}`;
  }

  // Construir URL base según la documentación
  // Formato: https://{subdomain}.myclickfunnels.com/api/v2
  const subdomain = CLICKFUNNELS_SUBDOMAIN || 'edgardohernandez';
  const baseUrl = CLICKFUNNELS_API_URL || `https://${subdomain}.myclickfunnels.com/api/v2`;

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Busca un contacto en ClickFunnels por email
 */
export async function getClickFunnelsContact(email: string): Promise<ClickFunnelsApiResponse> {
  if (!CLICKFUNNELS_CLIENT_ID && !CLICKFUNNELS_API_KEY) {
    console.warn('CLICKFUNNELS_CLIENT_ID o CLICKFUNNELS_API_KEY no configurados, saltando verificación');
    return {};
  }

  try {
    // Según la documentación: GET /workspaces/{workspace_id}/contacts
    const response = await authenticatedFetch(`/workspaces/${CLICKFUNNELS_WORKSPACE_ID}/contacts?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Contacto no encontrado, no es un error crítico
        return {};
      }
      throw new Error(`ClickFunnels API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Según la documentación: GET /workspaces/{workspace_id}/contacts
    // La API devuelve un objeto con contacts o un array
    let contacts = [];
    if (Array.isArray(data)) {
      contacts = data;
    } else if (data.contacts && Array.isArray(data.contacts)) {
      contacts = data.contacts;
    } else if (data.contact) {
      contacts = [data.contact];
    }

    // Buscar el contacto por email
    const contact = contacts.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
    
    if (contact) {
      return {
        contact: {
          id: contact.id,
          email: contact.email,
          firstName: contact.first_name,
          lastName: contact.last_name,
          tags: contact.tags || [],
          status: contact.status,
          customFields: contact.custom_fields || {},
        },
      };
    }

    return {};
  } catch (error: any) {
    console.error('Error fetching ClickFunnels contact:', error);
    // No lanzamos el error para que el login continúe aunque ClickFunnels falle
    return { error: error.message };
  }
}

/**
 * Actualiza un contacto en ClickFunnels
 */
export async function updateClickFunnelsContact(
  email: string,
  updates: Partial<ClickFunnelsContact>
): Promise<ClickFunnelsApiResponse> {
  if (!CLICKFUNNELS_CLIENT_ID && !CLICKFUNNELS_API_KEY) {
    return {};
  }

  try {
    // Primero obtenemos el contacto
    const contactData = await getClickFunnelsContact(email);
    if (!contactData.contact || !contactData.contact.id) {
      return { error: 'Contacto no encontrado en ClickFunnels' };
    }

    const contactId = contactData.contact.id;
    const payload: any = {};

    if (updates.firstName) payload.first_name = updates.firstName;
    if (updates.lastName) payload.last_name = updates.lastName;
    if (updates.tags) payload.tags = updates.tags;
    if (updates.status) payload.status = updates.status;
    if (updates.customFields) payload.custom_fields = updates.customFields;

    // Según la documentación: PUT /workspaces/{workspace_id}/contacts/{id}
    const response = await authenticatedFetch(`/workspaces/${CLICKFUNNELS_WORKSPACE_ID}/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ClickFunnels API error: ${response.status}`);
    }

    const data = await response.json();
    return { contact: data.contact };
  } catch (error: any) {
    console.error('Error updating ClickFunnels contact:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene los cursos disponibles en ClickFunnels
 */
export async function getClickFunnelsCourses(): Promise<any[]> {
  if (!CLICKFUNNELS_CLIENT_ID && !CLICKFUNNELS_API_KEY) {
    console.warn('CLICKFUNNELS_CLIENT_ID o CLICKFUNNELS_API_KEY no configurados');
    return [];
  }

  try {
    // Según la documentación: GET /courses
    // La API puede devolver cursos del workspace actual
    const response = await authenticatedFetch('/courses', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`ClickFunnels API error: ${response.status}`);
    }

    const data = await response.json();
    // Según la documentación, puede devolver un array o un objeto con courses
    if (Array.isArray(data)) {
      return data;
    }
    return data.courses || [];
  } catch (error: any) {
    console.error('Error fetching ClickFunnels courses:', error);
    return [];
  }
}

/**
 * Da acceso a un curso de ClickFunnels a un usuario
 */
export async function grantCourseAccess(email: string, courseId: string): Promise<{ success: boolean; error?: string }> {
  if (!CLICKFUNNELS_CLIENT_ID && !CLICKFUNNELS_API_KEY) {
    return { success: false, error: 'CLICKFUNNELS_CLIENT_ID o CLICKFUNNELS_API_KEY no configurados' };
  }

  try {
    // Primero obtenemos el contacto
    const contactData = await getClickFunnelsContact(email);
    if (!contactData.contact || !contactData.contact.id) {
      return { success: false, error: 'Contacto no encontrado en ClickFunnels' };
    }

    const contactId = contactData.contact.id;

    // Según la documentación: POST /courses/{course_id}/enrollments
    // El payload debe incluir contact_id
    const response = await authenticatedFetch(`/courses/${courseId}/enrollments`, {
      method: 'POST',
      body: JSON.stringify({
        contact_id: contactId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `ClickFunnels API error: ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error granting course access:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoca el acceso a un curso de ClickFunnels
 */
export async function revokeCourseAccess(email: string, courseId: string): Promise<{ success: boolean; error?: string }> {
  if (!CLICKFUNNELS_CLIENT_ID && !CLICKFUNNELS_API_KEY) {
    return { success: false, error: 'CLICKFUNNELS_CLIENT_ID o CLICKFUNNELS_API_KEY no configurados' };
  }

  try {
    const contactData = await getClickFunnelsContact(email);
    if (!contactData.contact || !contactData.contact.id) {
      return { success: false, error: 'Contacto no encontrado en ClickFunnels' };
    }

    const contactId = contactData.contact.id;

    // Según la documentación: GET /courses/{course_id}/enrollments
    // Listar enrollments para encontrar el del contacto
    const enrollmentsResponse = await authenticatedFetch(`/courses/${courseId}/enrollments`, {
      method: 'GET',
    });

    if (!enrollmentsResponse.ok) {
      // Si no se pueden obtener enrollments, considerar como éxito (el acceso se revocó localmente)
      console.warn(`No se pudieron obtener enrollments: ${enrollmentsResponse.status}`);
      return { success: true };
    }

    const enrollmentsData = await enrollmentsResponse.json();
    const enrollments = Array.isArray(enrollmentsData) 
      ? enrollmentsData 
      : (enrollmentsData.enrollments || []);
    
    // Buscar el enrollment del contacto
    const enrollment = enrollments.find((e: any) => e.contact_id === contactId || e.contact?.id === contactId);
    
    if (!enrollment) {
      // No hay enrollment, considerar como éxito
      return { success: true };
    }

    const enrollmentId = enrollment.id;

    // Según la documentación: PUT /courses/{course_id}/enrollments/{id}
    // Actualizar el enrollment para cancelarlo
    try {
      const response = await authenticatedFetch(`/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'cancelled',
        }),
      });

      if (!response.ok && response.status !== 404) {
        console.warn(`No se pudo actualizar enrollment en ClickFunnels: ${response.status}`);
      }
    } catch (error) {
      // Si falla, continuamos de todas formas ya que el acceso se revocó localmente
      console.warn('Error al revocar enrollment en ClickFunnels:', error);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error revoking course access:', error);
    return { success: false, error: error.message };
  }
}

