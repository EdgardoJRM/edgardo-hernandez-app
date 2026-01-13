import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { theme } from '../../src/theme';

interface Submission {
  submissionId: string;
  formId: string;
  answersJSON: Record<string, any>;
  resultJSON: Record<string, any>;
  createdAt: number;
}

export default function SubmissionDetail() {
  const params = useLocalSearchParams();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<Submission>(`submissions/${submissionId}`, 'GET');
      if (response.success && response.data) {
        setSubmission(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudo cargar la respuesta');
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

  const renderResult = (result: any) => {
    if (!result) return null;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.resultTitle}>Resultados</Text>

        {result.archetype && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Arquetipo</Text>
            <Text style={styles.resultValue}>{result.archetype}</Text>
          </View>
        )}

        {result.scoresByCategory && Object.keys(result.scoresByCategory).length > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Puntuaciones por Categoría</Text>
            {Object.entries(result.scoresByCategory).map(([category, score]) => (
              <View key={category} style={styles.scoreRow}>
                <Text style={styles.scoreCategory}>{category}</Text>
                <Text style={styles.scoreValue}>{score as number}</Text>
              </View>
            ))}
          </View>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Recomendaciones</Text>
            {result.recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.recommendation}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {result.calculatedAt && (
          <Text style={styles.calculatedAt}>
            Calculado el: {new Date(result.calculatedAt).toLocaleString('es-ES')}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró la respuesta</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Respuesta del Formulario</Text>
        <Text style={styles.formId}>Formulario: {submission.formId}</Text>
        <Text style={styles.date}>{formatDate(submission.createdAt)}</Text>
      </View>

      {renderResult(submission.resultJSON)}

      <View style={styles.answersSection}>
        <Text style={styles.answersTitle}>Tus Respuestas</Text>
        {Object.entries(submission.answersJSON).map(([key, value]) => (
          <View key={key} style={styles.answerCard}>
            <Text style={styles.answerKey}>{key}</Text>
            <Text style={styles.answerValue}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </Text>
          </View>
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
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  formId: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  resultSection: {
    padding: theme.spacing.lg,
  },
  resultTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  resultLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  resultValue: {
    ...theme.typography.titleSmall,
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  scoreCategory: {
    ...theme.typography.body,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  scoreValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recommendation: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  calculatedAt: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  answersSection: {
    padding: theme.spacing.lg,
  },
  answersTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  answerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  answerKey: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  answerValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
});
