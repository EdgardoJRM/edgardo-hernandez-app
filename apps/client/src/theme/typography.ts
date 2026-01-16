/**
 * Brand Kit - Tipografía
 * Edgardo Hernandez "The App"
 * 
 * Títulos: BEBAS NEUE REGULAR
 * Subtítulos: Mark Pro Medium Italics
 * Cuerpo: Mark Pro Regular
 */

export const typography = {
  // Títulos - Bebas Neue Regular
  title: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 1,
    lineHeight: 40,
  },
  titleLarge: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 40,
    fontWeight: '400' as const,
    letterSpacing: 1.5,
    lineHeight: 48,
  },
  titleSmall: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 32,
  },

  // Subtítulos - Mark Pro Medium Italics
  subtitle: {
    fontFamily: 'MarkPro-MediumItalic',
    fontSize: 18,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
    lineHeight: 24,
  },
  subtitleLarge: {
    fontFamily: 'MarkPro-MediumItalic',
    fontSize: 20,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
    lineHeight: 28,
  },
  subtitleSmall: {
    fontFamily: 'MarkPro-MediumItalic',
    fontSize: 16,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
    lineHeight: 22,
  },

  // Cuerpo - Mark Pro Regular
  body: {
    fontFamily: 'MarkPro-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'MarkPro-Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontFamily: 'MarkPro-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Variaciones Mark Pro
  hairline: {
    fontFamily: 'MarkPro-Hairline',
    fontWeight: '100' as const,
  },
  medium: {
    fontFamily: 'MarkPro-Medium',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'MarkPro-Bold',
    fontWeight: '700' as const,
  },
  boldItalic: {
    fontFamily: 'MarkPro-BoldItalic',
    fontWeight: '700' as const,
    fontStyle: 'italic' as const,
  },
  black: {
    fontFamily: 'MarkPro-Black',
    fontWeight: '900' as const,
  },
  heavy: {
    fontFamily: 'MarkPro-Heavy',
    fontWeight: '800' as const,
  },
  heavyItalic: {
    fontFamily: 'MarkPro-HeavyItalic',
    fontWeight: '800' as const,
    fontStyle: 'italic' as const,
  },
};

export type Typography = typeof typography;


