import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity } from 'react-native';
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
  const [resending, setResending] = useState(false);

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

        console.log('Exchange response:', {
          success: response.success,
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user,
          error: response.error
        });

        if (response.success && response.data) {
          console.log('Setting auth with token length:', response.data.token?.length);
          console.log('User data:', response.data.user);
          
          try {
            await setAuth(response.data.token, response.data.user);
            console.log('Auth set successfully, redirecting to dashboard');
            setStatus('success');
            setTimeout(() => {
              router.replace('/dashboard');
            }, 1000);
          } catch (authError: any) {
            console.error('Error setting auth:', authError);
            setStatus('error');
            setError('Error al guardar la sesión. Por favor intenta de nuevo.');
          }
        } else {
          setStatus('error');
          const errorMsg = response.error || 'Token inválido o expirado';
          setError(errorMsg);
          console.error('Exchange failed:', {
            success: response.success,
            error: response.error,
            fullResponse: response
          });
          
          // No redirigir automáticamente, dejar que el usuario elija
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Ocurrió un error');
        console.error('Exchange error:', err);
      }
    };

    exchangeToken();
  }, [params]);

  const handleResendEmail = async () => {
    const getParam = (key: string): string => {
      const value = params[key];
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return (value as string) || '';
    };

    let email = getParam('email');
    try {
      email = decodeURIComponent(email);
    } catch (e) {
      // Si ya está decodificado, continuar
    }

    if (!email) {
      router.replace('/auth');
      return;
    }

    setResending(true);
    try {
      const response = await apiFetch('auth/start', 'POST', {
        email: email.toLowerCase().trim(),
      });

      if (response.success) {
        router.push({
          pathname: '/auth/sent',
          params: { email: email.toLowerCase().trim() },
        });
      } else {
        setError(response.error || 'No se pudo enviar el email. Por favor intenta de nuevo.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al enviar el email.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.text}>Verificando enlace...</Text>
      </View>
    );
  }

  if (status === 'error') {
    const isExpired = error.includes('expirado') || error.includes('inválido');
    
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        {isExpired && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, resending && styles.buttonDisabled]}
              onPress={handleResendEmail}
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Solicitar nuevo enlace</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/auth')}
              disabled={resending}
            >
              <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!isExpired && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/auth')}
          >
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
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
  actionContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    maxWidth: 400,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
