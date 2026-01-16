import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'soporte@edgardohernandez.com';
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://main.dk25r0mbxd2eb.amplifyapp.com';

export async function sendOtpEmail(email: string, code: string): Promise<void> {
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

  const command = new SendEmailCommand({
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

export async function sendMagicLinkEmail(email: string, token: string): Promise<void> {
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

  const command = new SendEmailCommand({
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

export async function sendCombinedAuthEmail(email: string, otp: string, token: string): Promise<void> {
  const magicLink = `${APP_BASE_URL}/auth/callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const subject = 'Edgardo Hernandez - Magic Link Request ✨';
  const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body {
        width: 100% !important;
        height: 100%;
        margin: 0;
        -webkit-text-size-adjust: none;
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
        background-color: #FFF;
        color: #333;
      }
      @media only screen and (max-width: 500px) {
        .button {
          width: 100% !important;
          text-align: center !important;
        }
      }
      @media only screen and (max-width: 600px) {
        .email-body_inner {
          width: 100% !important;
        }
        .email-footer {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; color: #333; margin: 0;" bgcolor="#FFF">
    <span class="preheader" style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;"></span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0; padding: 0;">
      <tr>
        <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0; padding: 0;">
            <tr>
              <td class="email-masthead" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 25px 0 0;" align="center">
                <div style="color: #3F5E78; font-size: 24px; font-weight: bold; text-decoration: none;">
                  EDGARDO HERNÁNDEZ
                </div>
                <div style="color: #A5A5A5; font-size: 12px; margin-top: 5px;">
                  ACELERANDO TU NEGOCIO
                </div>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="width: 570px; margin: 0 auto; padding: 0;">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <h1 style="margin-top: 0; color: #333333; font-size: 22px; font-weight: bold;" align="left">Aquí está tu enlace de acceso mágico ✨</h1>
                      <p style="font-size: 16px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">Tu enlace de inicio de sesión de un clic está listo. ¡Empecemos!</p>

                      <h2 style="margin-top: 0; color: #333333; font-size: 16px; font-weight: bold;" align="left">¿Qué sigue?</h2>
                      <p style="font-size: 16px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">Puedes usar el siguiente enlace para iniciar sesión en tu cuenta:</p>
                      
                      <!-- Action -->
                      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; text-align: center; margin: 30px auto; padding: 0;">
                        <tr>
                          <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                      <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                                        <a href="${magicLink}" class="button button--contacts" target="_blank" style="color: #FFF; background-color: #3F5E78; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3F5E78; border-style: solid; border-width: 10px 18px;">Iniciar Sesión</a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                                        <p class="sub" style="font-size: 13px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">Nota: el enlace expirará en 15 minutos.</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                                        <br />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                                        <p style="font-size: 16px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">O usa el código de 6 dígitos a continuación para iniciar sesión en tu navegador:</p>
                                        <h1 data-testid="short-token" style="background-color: #eeeeee; margin-top: 0; color: #333333; font-size: 32px; font-weight: bold; padding: 20px; letter-spacing: 8px; font-family: 'Courier New', monospace;" align="center">${otp}</h1>
                                        <p style="font-size: 13px; line-height: 1.625; color: #666; margin: .4em 0 1.1875em;">Este código expira en 10 minutos.</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="font-size: 16px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">Si tienes alguna pregunta o encuentras algún problema, no dudes en <a href="mailto:soporte@edgardohernandez.com" style="color: #3F5E78;">contactarnos por email</a>.</p>
                      <p style="font-size: 16px; line-height: 1.625; color: #333; margin: .4em 0 1.1875em;">¡Hagámoslo juntos!<br /></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="width: 570px; text-align: center; margin: 0 auto; padding: 0;">
                  <tr>
                    <td class="content-cell" align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <p class="sub align-center" style="font-size: 13px; line-height: 1.625; color: #A8AAAF; margin: .4em 0 1.1875em;" align="center">© 2026 Edgardo Hernández. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
  
  const textBody = `Aquí está tu enlace de acceso mágico ✨\n\n` +
    `Tu enlace de inicio de sesión de un clic está listo. ¡Empecemos!\n\n` +
    `¿Qué sigue?\n` +
    `Puedes usar el siguiente enlace para iniciar sesión en tu cuenta:\n\n` +
    `Iniciar Sesión: ${magicLink}\n\n` +
    `Nota: el enlace expirará en 15 minutos.\n\n` +
    `O usa el código de 6 dígitos a continuación para iniciar sesión:\n\n` +
    `Código: ${otp}\n\n` +
    `Este código expira en 10 minutos.\n\n` +
    `Si tienes alguna pregunta o encuentras algún problema, no dudes en contactarnos por email: soporte@edgardohernandez.com\n\n` +
    `¡Hagámoslo juntos!\n\n` +
    `© 2026 Edgardo Hernández. Todos los derechos reservados.`;

  const command = new SendEmailCommand({
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

