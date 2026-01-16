# Deploy Frontend - Edgardo Hernandez "The App"

## Logo Subido a S3 ✅

**URL del Logo:**
```
https://edgardohernandez-public.s3.amazonaws.com/assets/logo-edgardo-hernandez-2025-amarillo.pdf
```

## Opciones de Deploy

### Opción 1: Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Build del frontend:
```bash
cd apps/client
npm run build:web
```

3. Deploy:
```bash
cd web-build
vercel --prod
```

### Opción 2: Netlify

1. Build:
```bash
cd apps/client
npm run build:web
```

2. Arrastra la carpeta `web-build/` a Netlify Drop
3. O usa Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=web-build
```

### Opción 3: AWS S3 + CloudFront

1. Build:
```bash
cd apps/client
npm run build:web
```

2. Subir a S3:
```bash
aws s3 sync web-build/ s3://tu-bucket-frontend --delete
```

3. Configurar CloudFront para distribución

### Opción 4: GitHub Pages / GitLab Pages

1. Build:
```bash
cd apps/client
npm run build:web
```

2. Configurar GitHub Actions o GitLab CI para deploy automático

## Variables de Entorno

Asegúrate de configurar en tu hosting:
- `EXPO_PUBLIC_API_BASE_URL`: URL del backend API

## Logo

El logo está disponible en:
- S3: `https://edgardohernandez-public.s3.amazonaws.com/assets/logo-edgardo-hernandez-2025-amarillo.pdf`
- Integrado en las pantallas principales del frontend

## Notas

- El logo PDF se muestra como texto estilizado en las pantallas
- Para usar el PDF directamente como imagen, convierte a PNG/JPG primero
- El frontend está configurado para usar el brand kit completo


