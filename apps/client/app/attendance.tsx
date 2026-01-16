import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';

interface Attendance {
  attendanceId: string;
  userId: string;
  qrCode: string;
  checkInTime: number;
  checkOutTime?: number;
  location?: string;
}

export default function Attendance() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Attendance[]>('attendance', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setAttendance(response.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'No se pudo cargar la asistencia');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await apiFetch<Attendance>('attendance/check-in', 'POST', {}, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Check-in registrado correctamente');
        loadAttendance();
      } else {
        Alert.alert('Error', response.error || 'No se pudo registrar el check-in');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el check-in');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Asistencia</Text>
      </View>

      <View style={styles.checkInSection}>
        <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
          <Text style={styles.checkInButtonText}>✓ Registrar Check-in</Text>
        </TouchableOpacity>
        {user && (
          <Text style={styles.qrInfo}>
            Tu código QR: {user.userId.substring(0, 8)}...
          </Text>
        )}
      </View>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <View style={styles.list}>
          {attendance.length === 0 ? (
            <Text style={styles.empty}>No hay registros de asistencia</Text>
          ) : (
            attendance.map((record) => (
              <View key={record.attendanceId} style={styles.attendanceCard}>
                <View style={styles.attendanceHeader}>
                  <Text style={styles.attendanceDate}>
                    {formatDate(record.checkInTime)}
                  </Text>
                  {record.checkOutTime ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Completo</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: '#f39c12' }]}>
                      <Text style={styles.statusText}>En oficina</Text>
                    </View>
                  )}
                </View>
                {record.location && (
                  <Text style={styles.attendanceLocation}>Ubicación: {record.location}</Text>
                )}
                {record.checkOutTime && (
                  <Text style={styles.checkOutTime}>
                    Check-out: {formatDate(record.checkOutTime)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
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
  checkInSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  checkInButtonText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.white,
    fontWeight: '600',
  },
  qrInfo: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  loading: {
    ...theme.typography.body,
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  list: {
    padding: theme.spacing.md,
  },
  empty: {
    ...theme.typography.body,
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  attendanceCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  attendanceDate: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
  },
  attendanceLocation: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  checkOutTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

