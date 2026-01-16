# Brand Kit - Edgardo Hernandez "The App"

## Paleta de Colores

| Color | Nombre | Hex | Uso |
|-------|--------|-----|-----|
| Blanco | White Smoke | `#f2f2f2` | Backgrounds, superficies |
| Negro | Shadow Grey | `#222022` | Texto principal |
| Gris | Silver | `#A5A5A5` | Texto secundario, bordes |
| Azul claro | Blue Slate | `#3F5E78` | Primary, botones principales |
| Azul oscuro | Blue Slate | `#4C5C68` | Primary dark, hover states |
| Amarillo | Bright Amber | `#FFC907` | Accent, destacados |

## Tipografía

### Títulos
- **Fuente**: Bebas Neue Regular
- **Uso**: Títulos principales, headers
- **Tamaños**: 24px, 32px, 40px

### Subtítulos
- **Fuente**: Mark Pro Medium Italics
- **Uso**: Subtítulos, descripciones
- **Tamaños**: 16px, 18px, 20px

### Cuerpo
- **Fuente**: Mark Pro Regular
- **Uso**: Texto de cuerpo, labels, botones
- **Tamaños**: 14px, 16px, 18px

## Uso en el Código

```typescript
import { theme } from '../src/theme';

// Colores
theme.colors.primary      // #3F5E78
theme.colors.accent       // #FFC907
theme.colors.text         // #222022

// Tipografía
theme.typography.title    // Bebas Neue Regular, 32px
theme.typography.subtitle // Mark Pro Medium Italics, 18px
theme.typography.body     // Mark Pro Regular, 16px

// Espaciado
theme.spacing.md          // 16px
theme.borderRadius.md     // 8px
theme.shadows.md          // Sombra media
```

## Fuentes - Setup

### Para Desarrollo Web
Las fuentes se cargan automáticamente desde Google Fonts (Bebas Neue).
Mark Pro usa fallback de sistema.

### Para Producción Móvil
1. Descarga las fuentes:
   - Bebas Neue Regular: `BebasNeue-Regular.ttf`
   - Mark Pro (todas las variaciones): `.otf` files

2. Coloca las fuentes en: `apps/client/assets/fonts/`

3. Las fuentes se cargarán automáticamente al iniciar la app.

## Componentes con Brand Kit

- ✅ Pantalla de autenticación (`app/auth/index.tsx`)
- ✅ Layout principal (`app/_layout.tsx`)
- ⏳ Pantalla de verificación OTP
- ⏳ Dashboard
- ⏳ Perfil
- ⏳ Formularios
- ⏳ Submissions


