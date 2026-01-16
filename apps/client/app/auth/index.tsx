import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { theme } from '../../src/theme';
import { useResponsive } from '../../src/utils/responsive';

export default function AuthStart() {
  const router = useRouter();
  const { isDesktop, width } = useResponsive();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const maxWidth = isDesktop ? 500 : '100%';

  const handleStart = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('auth/start', 'POST', {
        email: email.toLowerCase().trim(),
      });

      if (response.success) {
        // Redirigir a la página de confirmación
        router.push({
          pathname: '/auth/sent',
          params: { email: email.toLowerCase().trim() },
        });
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar el email');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EDGARDO HERNÁNDEZ</Text>
          <Text style={styles.logoSubtext}>ACELERANDO TU NEGOCIO</Text>
        </View>
        <Text style={styles.title}>The App</Text>

        <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />

        <Text style={styles.infoText}>
          Te enviaremos un email con un Magic Link y un código de 6 dígitos. Puedes usar cualquiera de los dos para iniciar sesión.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Acceder</Text>
          )}
        </TouchableOpacity>
        </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoText: {
    ...theme.typography.titleLarge,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  logoSubtext: {
    ...theme.typography.subtitleSmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  title: {
    ...theme.typography.subtitle,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  form: {
    width: '100%',
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
