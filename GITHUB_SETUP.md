# Guía para Subir a GitHub y Conectar con Amplify

## Paso 1: Preparar el Repositorio Local

### 1.1 Verificar que Git esté inicializado

```bash
# Verificar si ya hay un repositorio git
git status
```

Si no está inicializado, ejecuta:
```bash
git init
```

### 1.2 Verificar .gitignore

Asegúrate de que `.gitignore` incluya:
- `node_modules/`
- `dist/`
- `.env`
- `.expo/`
- `.serverless/`

## Paso 2: Agregar Archivos y Hacer Commit

```bash
# Ver qué archivos se van a agregar
git status

# Agregar todos los archivos (excepto los ignorados)
git add .

# Hacer commit inicial
git commit -m "Initial commit: Edgardo Hernandez The App - Enterprise Control Center"
```

## Paso 3: Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en el botón "+" (arriba a la derecha) > "New repository"
3. Configura el repositorio:
   - **Name:** `edgardo-hernandez-app` (o el nombre que prefieras)
   - **Description:** "Enterprise Control Center - Edgardo Hernandez The App"
   - **Visibility:** Private (recomendado) o Public
   - **NO marques** "Initialize with README" (ya tenemos uno)
   - **NO agregues** .gitignore ni license (ya los tenemos)
4. Click en "Create repository"

## Paso 4: Conectar Repositorio Local con GitHub

GitHub te mostrará instrucciones, pero aquí están los comandos:

```bash
# Agregar el remote (reemplaza TU_USUARIO y TU_REPO con tus datos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# O si prefieres SSH:
# git remote add origin git@github.com:TU_USUARIO/TU_REPO.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código a GitHub
git branch -M main
git push -u origin main
```

## Paso 5: Verificar que el Código esté en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que todos los archivos estén presentes
3. Verifica que `amplify.yml` esté en la raíz del repositorio

## Paso 6: Conectar con AWS Amplify

### 6.1 Crear App en Amplify

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click en "New app" > "Host web app"
3. Selecciona "GitHub" como fuente
4. Autoriza AWS Amplify a acceder a tu cuenta de GitHub
5. Selecciona tu repositorio: `TU_USUARIO/TU_REPO`
6. Selecciona la rama: `main` (o `master` si usas esa)
7. Amplify detectará automáticamente `amplify.yml`

### 6.2 Configurar Variables de Entorno

Antes del primer build, configura las variables:

1. En Amplify Console, ve a tu app
2. Click en "Environment variables" en el menú lateral
3. Click en "Manage variables"
4. Agrega:

   **Key:** `EXPO_PUBLIC_API_BASE_URL`
   **Value:** `https://13n353lry8.execute-api.us-east-1.amazonaws.com/dev`

   (Reemplaza con la URL real de tu backend después de hacer deploy)

5. Click en "Save"

### 6.3 Configurar Build Settings (Opcional)

Amplify debería detectar automáticamente `amplify.yml`, pero puedes verificar:

1. Ve a "Build settings"
2. Verifica que esté usando `amplify.yml`
3. Si no, puedes editarlo manualmente o dejar que Amplify lo detecte

### 6.4 Iniciar el Primer Build

1. Click en "Save and deploy"
2. Amplify comenzará el build automáticamente
3. Puedes ver el progreso en tiempo real
4. El build tomará unos minutos

## Paso 7: Verificar el Deploy

1. Una vez completado el build, Amplify te dará una URL
2. Abre la URL en tu navegador
3. Verifica que la app cargue correctamente
4. Prueba hacer login para verificar que la conexión con el backend funcione

## Paso 8: Deploy Automático

Después de la configuración inicial:
- Cada vez que hagas `git push` a la rama `main`, Amplify hará deploy automáticamente
- Puedes ver el estado de los deploys en Amplify Console
- Puedes configurar notificaciones por email

## Troubleshooting

### Error: "Repository not found"
- Verifica que el nombre del repositorio sea correcto
- Verifica que tengas permisos para acceder al repositorio
- Verifica que hayas autorizado a Amplify a acceder a GitHub

### Error: "Build failed"
- Revisa los logs de build en Amplify Console
- Verifica que `amplify.yml` esté en la raíz del repositorio
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el backend esté desplegado y funcionando

### Error: "Variables not found"
- Verifica que las variables empiecen con `EXPO_PUBLIC_`
- Asegúrate de haber guardado las variables en Amplify Console
- Haz un nuevo deploy después de agregar variables

## Notas Importantes

1. **Backend primero:** Asegúrate de que el backend esté desplegado antes de configurar la variable `EXPO_PUBLIC_API_BASE_URL`
2. **Variables sensibles:** No subas archivos `.env` a GitHub
3. **Branch protection:** Considera proteger la rama `main` en GitHub
4. **Custom domain:** Puedes configurar un dominio personalizado en Amplify después del primer deploy

## Comandos Útiles

```bash
# Ver estado de git
git status

# Ver commits
git log --oneline

# Ver remotes
git remote -v

# Hacer cambios y subir
git add .
git commit -m "Descripción de los cambios"
git push

# Ver branches
git branch

# Crear nueva branch
git checkout -b feature/nueva-funcionalidad
```

