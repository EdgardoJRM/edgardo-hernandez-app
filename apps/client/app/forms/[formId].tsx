import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { theme } from '../../src/theme';

interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'single' | 'multi' | 'scale';
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface FormSection {
  id: string;
  title: string;
  questions: FormQuestion[];
}

interface FormDefinition {
  sections: FormSection[];
}

interface Form {
  formId: string;
  title: string;
  version: string;
  definitionJSON: FormDefinition;
}

export default function FormRunner() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<Form>(`forms/${formId}`, 'GET');
      if (response.success && response.data) {
        setForm(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudo cargar el formulario');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!form) return;

    for (const section of form.definitionJSON.sections) {
      for (const question of section.questions) {
        if (question.required && !answers[question.id]) {
          Alert.alert('Error', `Por favor responde: ${question.label}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await apiFetch<{ submissionId: string; result: any }>(
        `forms/${formId}/submit`,
        'POST',
        { answers }
      );

      if (response.success && response.data) {
        router.push(`/submissions/${response.data.submissionId}`);
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar el formulario');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    const value = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <TextInput
            key={question.id}
            style={styles.input}
            value={value || ''}
            onChangeText={(text) => handleAnswer(question.id, text)}
            placeholder={question.label}
            placeholderTextColor={theme.colors.textSecondary}
            editable={!submitting}
          />
        );

      case 'textarea':
        return (
          <TextInput
            key={question.id}
            style={[styles.input, styles.textarea]}
            value={value || ''}
            onChangeText={(text) => handleAnswer(question.id, text)}
            placeholder={question.label}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            editable={!submitting}
          />
        );

      case 'single':
        return (
          <View key={question.id} style={styles.optionsContainer}>
            {question.options?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.option, value === option && styles.optionSelected]}
                onPress={() => handleAnswer(question.id, option)}
                disabled={submitting}
              >
                <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multi':
        return (
          <View key={question.id} style={styles.optionsContainer}>
            {question.options?.map((option) => {
              const isSelected = Array.isArray(value) && value.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    const current = Array.isArray(value) ? value : [];
                    const newValue = isSelected
                      ? current.filter((v) => v !== option)
                      : [...current, option];
                    handleAnswer(question.id, newValue);
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'scale':
        return (
          <View key={question.id} style={styles.scaleContainer}>
            <Text style={styles.scaleLabel}>
              {question.min || 1} - {question.max || 5}
            </Text>
            <View style={styles.scaleButtons}>
              {Array.from(
                { length: (question.max || 5) - (question.min || 1) + 1 },
                (_, i) => (question.min || 1) + i
              ).map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.scaleButton, value === num && styles.scaleButtonSelected]}
                  onPress={() => handleAnswer(question.id, num)}
                  disabled={submitting}
                >
                  <Text style={[styles.scaleButtonText, value === num && styles.scaleButtonTextSelected]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{form.title}</Text>
        <Text style={styles.version}>Versión {form.version}</Text>
      </View>

      <View style={styles.form}>
        {form.definitionJSON.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.questions.map((question) => (
              <View key={question.id} style={styles.question}>
                <Text style={styles.questionLabel}>
                  {question.label}
                  {question.required && <Text style={styles.required}> *</Text>}
                </Text>
                {renderQuestion(question)}
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Formulario</Text>
          )}
        </TouchableOpacity>
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
  version: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  form: {
    padding: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  question: {
    marginBottom: theme.spacing.lg,
  },
  questionLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.blueLight + '15',
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  scaleContainer: {
    marginTop: theme.spacing.md,
  },
  scaleLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  scaleButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  scaleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  scaleButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  scaleButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scaleButtonTextSelected: {
    color: theme.colors.white,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
