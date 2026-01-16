#!/usr/bin/env node

/**
 * Script de prueba para el flujo de Magic Link
 * 
 * Uso: 
 *   node test-magic-link.js <email>                    # Envía email y muestra el token
 *   node test-magic-link.js <email> <token>            # Verifica un token específico
 */

const https = require('https');
const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const API_BASE_URL = process.env.API_BASE_URL || 'https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev';
const EMAIL = process.argv[2] || 'soporte@edgardohernandez.com';
const TOKEN_TO_VERIFY = process.argv[3];

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'edgardo-hernandez-api-auth-challenges-dev';

// Función para hacer requests HTTP
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE_URL}/${path}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function findLatestChallenge(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Math.floor(Date.now() / 1000);
  
  console.log(`🔍 Buscando challenge para: ${normalizedEmail}`);
  console.log(`   Timestamp actual: ${now} (${new Date(now * 1000).toISOString()})`);
  console.log('');
  
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':email': normalizedEmail,
        ':type': 'magic_link',
      },
      Limit: 5,
      ScanIndexForward: false, // Más reciente primero
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  // Filtrar los que no han expirado y no han sido consumidos
  const validChallenges = result.Items.filter(item => {
    const notExpired = item.expiresAt > now;
    const notConsumed = !item.consumedAt;
    return notExpired && notConsumed;
  });

  return validChallenges.length > 0 ? validChallenges[0] : result.Items[0]; // Retornar el más reciente
}

async function testMagicLink() {
  try {
    console.log('🧪 Test de Magic Link');
    console.log('===================');
    console.log(`API: ${API_BASE_URL}`);
    console.log(`Email: ${EMAIL}`);
    console.log('');

    if (TOKEN_TO_VERIFY) {
      // Modo 2: Verificar un token específico
      console.log('🔐 Modo: Verificación de token');
      console.log(`Token a verificar: ${TOKEN_TO_VERIFY}`);
      console.log('');

      const challenge = await findLatestChallenge(EMAIL);
      
      if (!challenge) {
        console.error('❌ No se encontró un challenge para este email');
        console.log('   Ejecuta primero sin el token para crear uno:');
        console.log(`   node test-magic-link.js ${EMAIL}`);
        return;
      }

      console.log('✅ Challenge encontrado:');
      console.log(`   Challenge ID: ${challenge.challengeId}`);
      console.log(`   Creado: ${new Date(challenge.createdAt * 1000).toISOString()}`);
      console.log(`   Expira: ${new Date(challenge.expiresAt * 1000).toISOString()}`);
      console.log(`   Consumido: ${challenge.consumedAt ? new Date(challenge.consumedAt * 1000).toISOString() : 'No'}`);
      console.log(`   Tiene tokenHash: ${!!challenge.tokenHash}`);
      console.log('');

      // Verificar formato del token
      const token = TOKEN_TO_VERIFY.trim();
      console.log('📊 Análisis del token:');
      console.log(`   Longitud: ${token.length} (esperado: 64)`);
      console.log(`   Es hexadecimal: ${/^[0-9a-f]{64}$/i.test(token)}`);
      console.log(`   Prefix: ${token.substring(0, 10)}`);
      console.log(`   Suffix: ${token.substring(token.length - 10)}`);
      console.log('');

      if (token.length !== 64) {
        console.error('❌ Token tiene longitud incorrecta');
        return;
      }

      if (!/^[0-9a-f]{64}$/i.test(token)) {
        console.error('❌ Token no es hexadecimal válido');
        return;
      }

      // Verificar con bcrypt
      console.log('🔐 Verificando token con bcrypt...');
      const isValid = await bcrypt.compare(token, challenge.tokenHash);
      
      console.log(`   Resultado: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
      console.log('');

      if (!isValid) {
        console.error('❌ El token no coincide con el hash almacenado');
        console.log('');
        console.log('🔍 Debugging:');
        console.log(`   Token recibido: ${token}`);
        console.log(`   Hash almacenado (prefix): ${challenge.tokenHash.substring(0, 30)}...`);
        console.log('');
        console.log('   Posibles causas:');
        console.log('   - El token es de un email diferente');
        console.log('   - El token fue modificado durante la codificación/decodificación');
        console.log('   - Hay espacios o caracteres extra en el token');
        return;
      }

      console.log('✅ Token verificado correctamente!');
      console.log('');
      console.log('📤 Intercambiando token por JWT...');
      
      const exchangeResponse = await makeRequest('auth/exchange-magic', 'POST', {
        email: EMAIL,
        token: token,
      });

      console.log(`Status: ${exchangeResponse.statusCode}`);
      
      if (exchangeResponse.statusCode === 200 && exchangeResponse.body.success) {
        console.log('✅ ¡Éxito! Token intercambiado correctamente');
        console.log(`   JWT (prefix): ${exchangeResponse.body.data?.token?.substring(0, 50)}...`);
        console.log(`   User ID: ${exchangeResponse.body.data?.user?.userId}`);
        console.log(`   Email: ${exchangeResponse.body.data?.user?.email}`);
      } else {
        console.error('❌ Error al intercambiar token');
        console.log(`   Error: ${exchangeResponse.body.error || 'Unknown error'}`);
        console.log('   Response:', JSON.stringify(exchangeResponse.body, null, 2));
      }

    } else {
      // Modo 1: Enviar email y mostrar información
      console.log('📧 Modo: Envío de email');
      console.log('');

      console.log('📤 Enviando email de acceso...');
      const startResponse = await makeRequest('auth/start', 'POST', {
        email: EMAIL,
      });

      console.log(`Status: ${startResponse.statusCode}`);
      
      if (startResponse.statusCode !== 200 || !startResponse.body.success) {
        console.error('❌ Error al enviar email');
        console.log('Response:', JSON.stringify(startResponse.body, null, 2));
        return;
      }

      console.log('✅ Email enviado exitosamente');
      console.log('');
      console.log('⏳ Esperando 2 segundos para que se cree el challenge...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('');

      const challenge = await findLatestChallenge(EMAIL);
      
      if (!challenge) {
        console.error('❌ No se encontró el challenge después de enviar el email');
        console.log('   Esto puede indicar un problema con DynamoDB o el índice');
        return;
      }

      console.log('✅ Challenge encontrado:');
      console.log(`   Challenge ID: ${challenge.challengeId}`);
      console.log(`   Creado: ${new Date(challenge.createdAt * 1000).toISOString()}`);
      console.log(`   Expira: ${new Date(challenge.expiresAt * 1000).toISOString()}`);
      console.log(`   Tiempo restante: ${Math.floor((challenge.expiresAt - Math.floor(Date.now() / 1000)) / 60)} minutos`);
      console.log(`   Tiene tokenHash: ${!!challenge.tokenHash}`);
      console.log(`   Hash (prefix): ${challenge.tokenHash?.substring(0, 30)}...`);
      console.log('');
      console.log('📧 Revisa tu email para obtener el token del magic link.');
      console.log('   El token está en la URL: /auth/callback?token=<TOKEN>&email=...');
      console.log('');
      console.log('   Para verificar el token, ejecuta:');
      console.log(`   node test-magic-link.js ${EMAIL} <TOKEN>`);
      console.log('');
      console.log('   O revisa los logs de CloudWatch en:');
      console.log('   /aws/lambda/edgardo-hernandez-api-dev-authStart');
      console.log('   Busca "tokenFull" en los logs para ver el token generado.');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error(error.stack);
  }
}

// Ejecutar la prueba
testMagicLink();
