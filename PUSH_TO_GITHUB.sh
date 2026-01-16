#!/bin/bash

# Script para subir cambios a GitHub
# Ejecuta: bash PUSH_TO_GITHUB.sh

echo "📦 Agregando todos los archivos..."
git add .

echo "📝 Haciendo commit..."
git commit -m "feat: Enterprise Control Center - Complete Implementation

- Added ClickFunnels API integration with OAuth2 authentication
- Implemented role-based access control (user, employee, admin)
- Added materials management system
- Added projects management system
- Added office attendance tracking with QR codes
- Added email logging and sending capabilities
- Added SMS logging and sending capabilities
- Added birthday tracking and notifications
- Added events and workshops management
- Added event registration and ticket system with QR codes
- Added event check-in scanner
- Added access management system (grant/revoke access to materials and courses)
- Added courses management with ClickFunnels integration
- Updated dashboard with role-based views
- Added protected routes for employee-only features
- Configured AWS Amplify deployment
- Updated documentation and setup guides"

echo "🚀 Subiendo a GitHub..."
git push origin main

echo "✅ ¡Listo! Los cambios han sido subidos a GitHub."
echo "📋 Próximo paso: Conectar con AWS Amplify (ver GITHUB_SETUP.md)"

