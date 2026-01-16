import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

interface Birthday {
  birthdayId: string;
  userId: string;
  name: string;
  dateOfBirth: number;
  email?: string;
  phone?: string;
}

export default function Birthdays() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadBirthdays();
  }, []);

  const loadBirthdays = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Birthday[]>('birthdays?upcoming=30', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setBirthdays(response.data);
      }
    } catch (error) {
      console.error('Error loading birthdays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBirthday = async () => {
    try {
      const date = new Date(formData.dateOfBirth);
      const timestamp = date.getTime();

      const response = await apiFetch<Birthday>('birthdays', 'POST', {
        ...formData,
        dateOfBirth: timestamp,
      }, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Cumpleaños agregado correctamente');
        setShowAddForm(false);
        setFormData({ userId: '', name: '', dateOfBirth: '', email: '', phone: '' });
        loadBirthdays();
      } else {
        Alert.alert('Error', response.error || 'No se pudo agregar el cumpleaños');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el cumpleaños');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cumpleaños</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={formData.userId}
            onChangeText={(text) => setFormData({ ...formData, userId: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email (opcional)"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono (opcional)"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddBirthday}>
            <Text style={styles.submitButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Cumpleaños (30 días)</Text>
        {loading ? (
          <Text style={styles.loading}>Cargando...</Text>
        ) : (
          <View style={styles.list}>
            {birthdays.length === 0 ? (
              <Text style={styles.empty}>No hay cumpleaños próximos</Text>
            ) : (
              birthdays.map((birthday) => (
                <View key={birthday.birthdayId} style={styles.birthdayCard}>
                  <Text style={styles.birthdayName}>{birthday.name}</Text>
                  <Text style={styles.birthdayDate}>
                    🎂 {formatDate(birthday.dateOfBirth)}
                  </Text>
                  {birthday.email && (
                    <Text style={styles.birthdayEmail}>{birthday.email}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.black,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  form: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  input: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  loading: {
    ...theme.typography.body,
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  list: {
    gap: theme.spacing.md,
  },
  empty: {
    ...theme.typography.body,
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  birthdayCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  birthdayName: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  birthdayDate: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  birthdayEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

