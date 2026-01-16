import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/theme';
import { apiFetch } from '../../src/utils/api';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';

export default function EventScanner() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);

  const handleCheckIn = async () => {
    if (!ticketCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de ticket');
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();

      const response = await apiFetch('events/check-in', 'POST', {
        ticketCode: ticketCode.trim().toUpperCase(),
      }, token || undefined);

      if (response.success && response.data) {
        setLastCheckIn(response.data);
        if (response.data.alreadyCheckedIn) {
          Alert.alert('Ya registrado', `Este ticket ya fue registrado anteriormente.\n\nNombre: ${response.data.registration.name}\nEvento: ${response.data.event.title}`);
        } else {
          Alert.alert('✅ Check-in exitoso', `Nombre: ${response.data.registration.name}\nEvento: ${response.data.event.title}\nEmail: ${response.data.registration.email}`);
          setTicketCode('');
        }
      } else {
        Alert.alert('Error', response.error || 'No se pudo hacer el check-in');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo hacer el check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scanner Check-in</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.instruction}>
            Ingresa o escanea el código del ticket
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Código del ticket (ej: ABC12345)"
            value={ticketCode}
            onChangeText={(text) => setTicketCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            onSubmitEditing={handleCheckIn}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[styles.checkInButton, loading && styles.checkInButtonDisabled]}
            onPress={handleCheckIn}
            disabled={loading}
          >
            <Text style={styles.checkInButtonText}>
              {loading ? 'Procesando...' : '✓ Hacer Check-in'}
            </Text>
          </TouchableOpacity>

          {lastCheckIn && (
            <View style={styles.lastCheckIn}>
              <Text style={styles.lastCheckInTitle}>Último check-in:</Text>
              <Text style={styles.lastCheckInName}>{lastCheckIn.registration.name}</Text>
              <Text style={styles.lastCheckInEvent}>{lastCheckIn.event.title}</Text>
              <Text style={styles.lastCheckInTime}>
                {new Date(lastCheckIn.registration.checkedInAt || Date.now()).toLocaleString('es-ES')}
              </Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Tip: Puedes ingresar el código manualmente o usar un escáner QR externo
            </Text>
          </View>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.black,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  instruction: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    color: theme.colors.black,
    marginBottom: theme.spacing.xl,
  },
  input: {
    ...theme.typography.bodyLarge,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 18,
  },
  lastCheckIn: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  lastCheckInTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  lastCheckInName: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  lastCheckInEvent: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  lastCheckInTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

