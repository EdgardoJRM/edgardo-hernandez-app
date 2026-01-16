import { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/theme';
import { useResponsive } from '../../src/utils/responsive';

export default function AuthVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setAuth } = useAuthStore();
  const { isDesktop, width } = useResponsive();
  
  // Manejar email que puede venir como string o array
  const getEmail = (): string => {
    const emailParam = params.email;
    if (Array.isArray(emailParam)) {
      return emailParam[0] || '';
    }
    return (emailParam as string) || '';
  };
  
  const email = getEmail();
  const maxWidth = isDesktop ? 500 : '100%';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(value) && value !== '') return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ token: string; user: any }>(
        'auth/verify-otp',
        'POST',
        {
          email,
          code: codeString,
        }
      );

      if (response.success && response.data) {
        await setAuth(response.data.token, response.data.user);
        router.replace('/dashboard');
      } else {
        Alert.alert('Error', response.error || 'Código inválido');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit cuando se completa el código
  useEffect(() => {
    const codeString = code.join('');
    if (codeString.length === 6 && !loading && email) {
      handleVerify();
    }
  }, [code]);

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <Text style={styles.title}>Verifica tu código</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de 6 dígitos que enviamos a{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>
      <Text style={styles.alternativeText}>
        O usa el Magic Link que también enviamos por email
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(value) => handleCodeChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>Verificar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.linkText}>Volver</Text>
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
  title: {
    ...theme.typography.title,
    textAlign: 'center',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  email: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.black,
  },
  alternativeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  codeInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.titleSmall,
    textAlign: 'center',
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
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
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
  },
});
