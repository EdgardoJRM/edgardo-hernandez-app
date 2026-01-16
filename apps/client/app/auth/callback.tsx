import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useSearchParams } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/theme';

export default function AuthCallback() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    // En web, usar searchParams; en móvil, usar localParams
    const params = Platform.OS === 'web' ? searchParams : localParams;
    const token = (params.get?.('token') || params.token) as string;
    const email = (params.get?.('email') || params.email) as string;

    if (!token || !email) {
      setStatus('error');
      setError('Parámetros inválidos. Token o email faltante.');
      console.error('Missing params:', { token: !!token, email: !!email, params });
      return;
    }

    const exchangeToken = async () => {
      try {
        const decodedEmail = decodeURIComponent(email);
        console.log('Exchanging token for:', { email: decodedEmail, tokenLength: token.length });
        
        const response = await apiFetch<{ token: string; user: any }>(
          'auth/exchange-magic',
          'POST',
          {
            email: decodedEmail,
            token: token.trim(),
          }
        );

        if (response.success && response.data) {
          await setAuth(response.data.token, response.data.user);
          setStatus('success');
          setTimeout(() => {
            router.replace('/dashboard');
          }, 1000);
        } else {
          setStatus('error');
          setError(response.error || 'Token inválido o expirado');
          console.error('Exchange failed:', response);
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Ocurrió un error');
        console.error('Exchange error:', err);
      }
    };

    exchangeToken();
  }, [localParams, searchParams]);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.text}>Verificando enlace...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>¡Bienvenido!</Text>
      <Text style={styles.text}>Redirigiendo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  text: {
    marginTop: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  successText: {
    ...theme.typography.title,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.title,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
