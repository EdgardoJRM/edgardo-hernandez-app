import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/theme';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    // En web, los query params pueden venir como string o array
    const getParam = (key: string): string => {
      const value = params[key];
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return (value as string) || '';
    };

    let token = getParam('token');
    let email = getParam('email');

    // Decodificar si viene codificado
    try {
      token = decodeURIComponent(token);
      email = decodeURIComponent(email);
    } catch (e) {
      // Si ya está decodificado, continuar
    }

    if (!token || !email) {
      setStatus('error');
      setError('Parámetros inválidos. Token o email faltante.');
      console.error('Missing params:', { token: !!token, email: !!email, params });
      return;
    }

    const exchangeToken = async () => {
      try {
        const trimmedToken = token.trim();
        const trimmedEmail = email.toLowerCase().trim();
        console.log('Exchanging token for:', { 
          email: trimmedEmail, 
          tokenLength: trimmedToken.length,
          tokenPrefix: trimmedToken.substring(0, 10),
          tokenSuffix: trimmedToken.substring(trimmedToken.length - 10),
          fullToken: trimmedToken
        });
        
        const response = await apiFetch<{ token: string; user: any }>(
          'auth/exchange-magic',
          'POST',
          {
            email: trimmedEmail,
            token: trimmedToken,
          }
        );

        console.log('Exchange response:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          await setAuth(response.data.token, response.data.user);
          setStatus('success');
          setTimeout(() => {
            router.replace('/dashboard');
          }, 1000);
        } else {
          setStatus('error');
          const errorMsg = response.error || 'Token inválido o expirado';
          setError(errorMsg);
          console.error('Exchange failed:', {
            success: response.success,
            error: response.error,
            fullResponse: response
          });
          
          // Si el error es que el enlace expiró, ofrecer opción de solicitar uno nuevo
          if (errorMsg.includes('expirado') || errorMsg.includes('inválido')) {
            setTimeout(() => {
              router.replace('/auth');
            }, 3000);
          }
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Ocurrió un error');
        console.error('Exchange error:', err);
      }
    };

    exchangeToken();
  }, [params]);

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
        {(error.includes('expirado') || error.includes('inválido')) && (
          <Text style={styles.redirectText}>
            Redirigiendo a la página de inicio de sesión...
          </Text>
        )}
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
    marginBottom: theme.spacing.md,
  },
  redirectText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
