import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { theme } from '../../src/theme';
import { useResponsive } from '../../src/utils/responsive';

interface Form {
  formId: string;
  title: string;
  version: string;
  isActive: boolean;
}

export default function FormsList() {
  const router = useRouter();
  const { isDesktop, width } = useResponsive();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  
  const maxWidth = isDesktop ? 1000 : '100%';
  const cardLayout = isDesktop ? 'row' : 'column';

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<Form[]>('forms', 'GET');
      if (response.success && response.data) {
        setForms(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar los formularios');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (forms.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay formularios disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <View style={[styles.list, isDesktop && styles.listDesktop]}>
          {forms.map((form) => (
            <TouchableOpacity
              key={form.formId}
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push(`/forms/${form.formId}`)}
            >
              <Text style={styles.cardTitle}>{form.title}</Text>
              <Text style={styles.cardVersion}>Versión {form.version}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      paddingHorizontal: 0,
    }),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.lg,
  },
  listDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardDesktop: {
    flex: 1,
    minWidth: 300,
    maxWidth: 400,
    marginBottom: 0,
  },
  cardTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  cardVersion: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
