import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme';
import { useResponsive } from '../../src/utils/responsive';

export default function AuthSent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDesktop } = useResponsive();
  const email = (params.email as string) || '';
  
  const maxWidth = isDesktop ? 500 : '100%';

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✉️</Text>
        </View>
        
        <Text style={styles.title}>¡Email enviado!</Text>
        
        <Text style={styles.message}>
          Hemos enviado un email a:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Qué sigue?</Text>
          <Text style={styles.infoText}>
            Revisa tu correo. Recibirás tanto un Magic Link como un código de 6 dígitos. Puedes usar cualquiera de los dos para iniciar sesión.
          </Text>
        </View>

        <View style={styles.optionsBox}>
          <Text style={styles.optionsTitle}>Opciones:</Text>
          <Text style={styles.optionsText}>
            • Haz clic en el Magic Link del email para iniciar sesión automáticamente
          </Text>
          <Text style={styles.optionsText}>
            • O ingresa el código de 6 dígitos manualmente
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: '/auth/verify',
              params: { email },
            });
          }}
        >
          <Text style={styles.buttonText}>Ingresar código manualmente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            router.push('/auth');
          }}
        >
          <Text style={styles.secondaryButtonText}>Volver a intentar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  contentWrapper: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      alignSelf: 'center',
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...theme.typography.titleLarge,
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  email: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xl,
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  infoTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  optionsBox: {
    backgroundColor: '#f8f9fa',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  optionsTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  optionsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});

