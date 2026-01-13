"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
exports.sendMagicLinkEmail = sendMagicLinkEmail;
exports.sendCombinedAuthEmail = sendCombinedAuthEmail;
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'soporte@edgardohernandez.com';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:8081';
async function sendOtpEmail(email, code) {
    const subject = 'Tu código de verificación';
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Código de verificación</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Código de verificación</h1>
        <p>Tu código de verificación es:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expira en 10 minutos.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Si no solicitaste este código, puedes ignorar este email.
        </p>
      </div>
    </body>
    </html>
  `;
    const textBody = `Tu código de verificación es: ${code}\n\nEste código expira en 10 minutos.`;
    const command = new client_ses_1.SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: htmlBody,
                    Charset: 'UTF-8',
                },
                Text: {
                    Data: textBody,
                    Charset: 'UTF-8',
                },
            },
        },
    });
    await sesClient.send(command);
}
async function sendMagicLinkEmail(email, token) {
    const link = `${APP_BASE_URL}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = 'Inicia sesión en Edgardo Hernandez The App';
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inicia sesión</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Inicia sesión</h1>
        <p>Haz clic en el siguiente enlace para iniciar sesión:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Iniciar sesión
          </a>
        </div>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">${link}</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Este enlace expira en 15 minutos. Si no solicitaste este enlace, puedes ignorar este email.
        </p>
      </div>
    </body>
    </html>
  `;
    const textBody = `Inicia sesión haciendo clic en este enlace:\n\n${link}\n\nEste enlace expira en 15 minutos.`;
    const command = new client_ses_1.SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: htmlBody,
                    Charset: 'UTF-8',
                },
                Text: {
                    Data: textBody,
                    Charset: 'UTF-8',
                },
            },
        },
    });
    await sesClient.send(command);
}
async function sendCombinedAuthEmail(email, otp, token) {
    const magicLink = `${APP_BASE_URL}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`;
    const subject = 'Inicia sesión en Edgardo Hernandez The App';
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inicia sesión</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; margin-top: 20px;">
        <h1 style="color: #3F5E78; text-align: center; margin-bottom: 30px;">Inicia sesión</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #FFC907;">
          <h2 style="color: #222022; margin-top: 0; font-size: 18px;">Opción 1: Magic Link (Más rápido)</h2>
          <p style="margin-bottom: 15px;">Haz clic en el siguiente botón para iniciar sesión automáticamente:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${magicLink}" style="background-color: #3F5E78; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Iniciar sesión
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 15px; margin-bottom: 0;">
            O copia y pega este enlace: <span style="word-break: break-all; color: #3F5E78;">${magicLink}</span>
          </p>
          <p style="color: #A5A5A5; font-size: 11px; margin-top: 10px; margin-bottom: 0;">
            Este enlace expira en 15 minutos.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3F5E78;">
          <h2 style="color: #222022; margin-top: 0; font-size: 18px;">Opción 2: Código de 6 dígitos</h2>
          <p style="margin-bottom: 15px;">Si prefieres usar un código, ingresa este código en la aplicación:</p>
          <div style="background-color: #222022; padding: 25px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #FFC907; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 15px; margin-bottom: 0;">
            Este código expira en 10 minutos.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            Puedes usar cualquiera de los dos métodos para iniciar sesión.<br>
            Si no solicitaste este email, puedes ignorarlo de forma segura.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
    const textBody = `Inicia sesión en Edgardo Hernandez The App\n\n` +
        `OPCIÓN 1: Magic Link (Más rápido)\n` +
        `Haz clic en este enlace para iniciar sesión:\n${magicLink}\n` +
        `Este enlace expira en 15 minutos.\n\n` +
        `OPCIÓN 2: Código de 6 dígitos\n` +
        `Ingresa este código en la aplicación: ${otp}\n` +
        `Este código expira en 10 minutos.\n\n` +
        `Puedes usar cualquiera de los dos métodos para iniciar sesión.\n` +
        `Si no solicitaste este email, puedes ignorarlo de forma segura.`;
    const command = new client_ses_1.SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: htmlBody,
                    Charset: 'UTF-8',
                },
                Text: {
                    Data: textBody,
                    Charset: 'UTF-8',
                },
            },
        },
    });
    await sesClient.send(command);
}
//# sourceMappingURL=email.js.map