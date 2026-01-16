import { sendEmail } from './email';
import { Event } from '../models/event';
import { createEmailLog, updateEmailLogStatus } from '../models/emailLog';

/**
 * Genera un código único para el ticket
 */
export function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin 0, O, I, 1 para evitar confusión
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Envía el email con la entrada del evento
 */
export async function sendEventTicketEmail(
  email: string,
  name: string,
  event: Event,
  ticketCode: string
): Promise<void> {
  const fromEmail = process.env.SES_FROM_EMAIL || 'soporte@edgardohernandez.com';
  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:8081';
  
  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const qrCodeUrl = `${appBaseUrl}/events/ticket/${ticketCode}`;
  
  const subject = `Tu entrada para: ${event.title}`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Entrada para ${event.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; margin-top: 20px;">
        <h1 style="color: #3F5E78; text-align: center; margin-bottom: 30px;">¡Tu entrada está lista!</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FFC907;">
          <h2 style="color: #222022; margin-top: 0;">${event.title}</h2>
          ${event.description ? `<p style="color: #666;">${event.description}</p>` : ''}
          
          <div style="margin-top: 20px;">
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
            ${event.location ? `<p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> ${event.location}</p>` : ''}
            ${event.locationUrl ? `<p style="margin: 5px 0;"><strong>🔗 Link:</strong> <a href="${event.locationUrl}">${event.locationUrl}</a></p>` : ''}
            <p style="margin: 5px 0;"><strong>👤 Nombre:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>🎫 Código de entrada:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #3F5E78;">${ticketCode}</span></p>
          </div>
        </div>

        <div style="background-color: #222022; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #FFC907; font-family: 'Courier New', monospace; margin-bottom: 10px;">
            ${ticketCode}
          </div>
          <p style="color: #A5A5A5; font-size: 12px; margin: 0;">Muestra este código al llegar al evento</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${qrCodeUrl}" style="background-color: #3F5E78; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Ver entrada completa
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            Guarda este email o toma una captura de pantalla para mostrarlo al llegar al evento.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `¡Tu entrada está lista!\n\n` +
    `Evento: ${event.title}\n` +
    `${event.description ? `Descripción: ${event.description}\n` : ''}` +
    `Fecha: ${formattedDate}\n` +
    `${event.location ? `Ubicación: ${event.location}\n` : ''}` +
    `Nombre: ${name}\n` +
    `Código de entrada: ${ticketCode}\n\n` +
    `Muestra este código al llegar al evento.\n\n` +
    `Ver entrada completa: ${qrCodeUrl}`;

  // Crear log del email
  const emailLog = await createEmailLog({
    to: email,
    from: fromEmail,
    subject,
    body: htmlBody,
    status: 'pending',
    templateId: 'event_ticket',
    metadata: {
      eventId: event.eventId,
      ticketCode,
      eventTitle: event.title,
    },
  });

  try {
    // Enviar email
    await sendEmail(email, subject, htmlBody, true);
    await updateEmailLogStatus(emailLog.emailLogId, 'sent', Date.now());
  } catch (error: any) {
    await updateEmailLogStatus(emailLog.emailLogId, 'failed', undefined, error.message);
    throw error;
  }
}

