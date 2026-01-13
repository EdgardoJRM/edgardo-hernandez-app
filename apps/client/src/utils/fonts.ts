/**
 * Configuración de fuentes del Brand Kit
 * 
 * Nota: En producción, estas fuentes deben estar en assets/fonts/
 * Para desarrollo web, usaremos fuentes de Google Fonts como fallback
 */

import * as Font from 'expo-font';
import { Platform } from 'react-native';

export const loadFonts = async (): Promise<void> => {
  // En desarrollo web, las fuentes se cargarán desde Google Fonts
  // En producción móvil, deben estar en assets/fonts/
  
  if (typeof window !== 'undefined' || Platform.OS === 'web') {
    // Web: Cargar desde Google Fonts
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Mark Pro no está en Google Fonts, usaremos una fuente similar como fallback
    // En producción móvil, usar Mark Pro desde assets
    return;
  }
  
  // Mobile: Cargar desde assets (si existen)
  try {
    await Font.loadAsync({
      'BebasNeue-Regular': require('../../assets/fonts/BebasNeue-Regular.ttf'),
      'MarkPro-Regular': require('../../assets/fonts/MarkPro-Regular.otf'),
      'MarkPro-Medium': require('../../assets/fonts/MarkPro-Medium.otf'),
      'MarkPro-MediumItalic': require('../../assets/fonts/MarkPro-MediumItalic.otf'),
      'MarkPro-Bold': require('../../assets/fonts/MarkPro-Bold.otf'),
      'MarkPro-BoldItalic': require('../../assets/fonts/MarkPro-BoldItalic.otf'),
      'MarkPro-Hairline': require('../../assets/fonts/MarkPro-Hairline.otf'),
      'MarkPro-Black': require('../../assets/fonts/MarkPro-Black.otf'),
      'MarkPro-Heavy': require('../../assets/fonts/MarkPro-Heavy.otf'),
      'MarkPro-HeavyItalic': require('../../assets/fonts/MarkPro-HeavyItalic.otf'),
    });
  } catch (error) {
    // Si las fuentes no existen, continuar sin ellas (usará fallbacks)
    console.warn('Fuentes no encontradas, usando fallbacks:', error);
  }
};

// Fallbacks para web (Mark Pro no está en Google Fonts)
export const fontFallbacks = {
  'BebasNeue-Regular': 'Bebas Neue, sans-serif',
  'MarkPro-Regular': 'system-ui, -apple-system, sans-serif',
  'MarkPro-Medium': 'system-ui, -apple-system, sans-serif',
  'MarkPro-MediumItalic': 'system-ui, -apple-system, sans-serif',
  'MarkPro-Bold': 'system-ui, -apple-system, sans-serif',
  'MarkPro-BoldItalic': 'system-ui, -apple-system, sans-serif',
  'MarkPro-Hairline': 'system-ui, -apple-system, sans-serif',
  'MarkPro-Black': 'system-ui, -apple-system, sans-serif',
  'MarkPro-Heavy': 'system-ui, -apple-system, sans-serif',
  'MarkPro-HeavyItalic': 'system-ui, -apple-system, sans-serif',
};

