"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = require("fs");
const path_1 = require("path");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'edgardohernandez-public';
const LOGO_PATH = (0, path_1.join)(__dirname, '../../..', 'Logo Edgardo hernandez 2025 Amarillo.pdf');
async function uploadLogo() {
    try {
        console.log('📤 Subiendo logo a S3...');
        console.log('Bucket:', BUCKET_NAME);
        console.log('Archivo:', LOGO_PATH);
        const fileContent = (0, fs_1.readFileSync)(LOGO_PATH);
        const fileName = 'logo-edgardo-hernandez-2025-amarillo.pdf';
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `assets/${fileName}`,
            Body: fileContent,
            ContentType: 'application/pdf',
            CacheControl: 'max-age=31536000',
        });
        await s3Client.send(command);
        const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/assets/${fileName}`;
        console.log('✅ Logo subido exitosamente!');
        console.log('URL pública:', publicUrl);
        return publicUrl;
    }
    catch (error) {
        if (error.name === 'NoSuchBucket') {
            console.error('❌ Error: El bucket no existe. Creando bucket...');
            console.error('   Por favor crea el bucket manualmente:');
            console.error(`   aws s3 mb s3://${BUCKET_NAME} --region ${process.env.AWS_REGION || 'us-east-1'}`);
            console.error('   O usa un bucket existente configurando S3_BUCKET_NAME');
        }
        else {
            console.error('❌ Error subiendo logo:', error.message);
        }
        throw error;
    }
}
uploadLogo()
    .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
//# sourceMappingURL=upload-logo.js.map