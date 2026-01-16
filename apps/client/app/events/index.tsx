import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { theme } from '../../src/theme';
import { apiFetch } from '../../src/utils/api';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';

interface Event {
  eventId: string;
  title: string;
  description?: string;
  type: string;
  startDate: number;
  endDate: number;
  location?: string;
  capacity?: number;
  status: string;
}

export default function Events() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event',
    startDate: '',
    endDate: '',
    location: '',
    capacity: '',
  });

  const isEmployee = user?.role === 'employee' || user?.role === 'admin';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Event[]>('events?upcoming=true', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!isEmployee) {
      Alert.alert('Error', 'Solo los empleados pueden crear eventos');
      return;
    }

    try {
      const startDate = new Date(formData.startDate).getTime();
      const endDate = new Date(formData.endDate).getTime();

      const response = await apiFetch<Event>('events', 'POST', {
        ...formData,
        startDate,
        endDate,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: 'published',
      }, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Evento creado correctamente');
        setShowAddForm(false);
        setFormData({ title: '', description: '', type: 'event', startDate: '', endDate: '', location: '', capacity: '' });
        loadEvents();
      } else {
        Alert.alert('Error', response.error || 'No se pudo crear el evento');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el evento');
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await apiFetch('events/register', 'POST', {
        eventId,
        email: user?.email || '',
        name: user?.name || 'Usuario',
      }, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Te has registrado correctamente. Revisa tu email para la entrada.');
        loadEvents();
      } else {
        Alert.alert('Error', response.error || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar al evento');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute requiredRole={isEmployee ? 'employee' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Eventos y Talleres</Text>
          {isEmployee && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Text style={styles.addButtonText}>+ Nuevo</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEmployee && showAddForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Título del evento"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha inicio (YYYY-MM-DDTHH:mm)"
              value={formData.startDate}
              onChangeText={(text) => setFormData({ ...formData, startDate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha fin (YYYY-MM-DDTHH:mm)"
              value={formData.endDate}
              onChangeText={(text) => setFormData({ ...formData, endDate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ubicación"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Capacidad"
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleCreateEvent}>
              <Text style={styles.submitButtonText}>Crear Evento</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <Text style={styles.loading}>Cargando...</Text>
        ) : (
          <View style={styles.list}>
            {events.length === 0 ? (
              <Text style={styles.empty}>No hay eventos disponibles</Text>
            ) : (
              events.map((event) => (
                <View key={event.eventId} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventDate}>📅 {formatDate(event.startDate)}</Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>📍 {event.location}</Text>
                    )}
                    {event.capacity && (
                      <Text style={styles.eventCapacity}>👥 Capacidad: {event.capacity}</Text>
                    )}
                  </View>
                  {!isEmployee && (
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={() => handleRegister(event.eventId)}
                    >
                      <Text style={styles.registerButtonText}>Registrarse</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  eventCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  eventTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  eventDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  eventInfo: {
    marginTop: theme.spacing.sm,
  },
  eventDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventCapacity: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  registerButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  registerButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});

