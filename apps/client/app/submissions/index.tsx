import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { theme } from '../../src/theme';

interface Submission {
  submissionId: string;
  formId: string;
  createdAt: number;
}

export default function SubmissionsList() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<Submission[]>('submissions', 'GET');
      if (response.success && response.data) {
        setSubmissions(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar las respuestas');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (submissions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No tienes respuestas guardadas</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/forms')}
        >
          <Text style={styles.buttonText}>Ver Formularios</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        {submissions.map((submission) => (
          <TouchableOpacity
            key={submission.submissionId}
            style={styles.card}
            onPress={() => router.push(`/submissions/${submission.submissionId}`)}
          >
            <Text style={styles.cardTitle}>Formulario: {submission.formId}</Text>
            <Text style={styles.cardDate}>{formatDate(submission.createdAt)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  list: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  cardDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 200,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
