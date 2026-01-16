import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

interface EmailLog {
  emailLogId: string;
  to: string;
  subject: string;
  status: string;
  sentAt?: number;
}

export default function Emails() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<EmailLog[]>('emails/logs', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await apiFetch('emails/send', 'POST', formData, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Email enviado correctamente');
        setShowSendForm(false);
        setFormData({ to: '', subject: '', body: '' });
        loadLogs();
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar el email');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el email');
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Pendiente';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emails</Text>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => setShowSendForm(!showSendForm)}
        >
          <Text style={styles.sendButtonText}>✉️ Enviar</Text>
        </TouchableOpacity>
      </View>

      {showSendForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Para"
            value={formData.to}
            onChangeText={(text) => setFormData({ ...formData, to: text })}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Asunto"
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mensaje"
            value={formData.body}
            onChangeText={(text) => setFormData({ ...formData, body: text })}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSendEmail}>
            <Text style={styles.submitButtonText}>Enviar Email</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vitacora de Emails</Text>
        {loading ? (
          <Text style={styles.loading}>Cargando...</Text>
        ) : (
          <View style={styles.list}>
            {logs.length === 0 ? (
              <Text style={styles.empty}>No hay registros de emails</Text>
            ) : (
              logs.map((log) => (
                <View key={log.emailLogId} style={styles.logCard}>
                  <Text style={styles.logTo}>Para: {log.to}</Text>
                  <Text style={styles.logSubject}>{log.subject}</Text>
                  <View style={styles.logFooter}>
                    <Text style={styles.logDate}>{formatDate(log.sentAt)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: log.status === 'sent' ? '#27ae60' : '#e74c3c' }]}>
                      <Text style={styles.statusText}>{log.status}</Text>
                    </View>
                  </View>
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
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  sendButtonText: {
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
    minHeight: 120,
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
  logCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  logTo: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  logSubject: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

