import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

interface Access {
  accessId: string;
  userId: string;
  accessType: string;
  resourceId: string;
  resourceName?: string;
  clickfunnelsCourseId?: string;
  grantedAt: number;
  expiresAt?: number;
}

interface Course {
  id: string;
  name: string;
  description?: string;
}

export default function AccessManagement() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [userAccesses, setUserAccesses] = useState<Access[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: '',
    accessType: 'material',
    resourceId: '',
    resourceName: '',
    clickfunnelsCourseId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accessesRes, coursesRes, materialsRes] = await Promise.all([
        apiFetch<Access[]>('access', 'GET', undefined, token || undefined),
        apiFetch<Course[]>('courses', 'GET', undefined, token || undefined),
        apiFetch<any[]>('materials', 'GET', undefined, token || undefined),
      ]);

      if (accessesRes.success && accessesRes.data) {
        setUserAccesses(accessesRes.data);
      }
      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }
      if (materialsRes.success && materialsRes.data) {
        setMaterials(materialsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    try {
      const response = await apiFetch('access/grant', 'POST', {
        ...formData,
        resourceId: formData.accessType === 'course' ? formData.clickfunnelsCourseId : formData.resourceId,
      }, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Acceso otorgado correctamente');
        setShowGrantForm(false);
        setFormData({
          userEmail: '',
          accessType: 'material',
          resourceId: '',
          resourceName: '',
          clickfunnelsCourseId: '',
        });
        loadData();
      } else {
        Alert.alert('Error', response.error || 'No se pudo otorgar el acceso');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo otorgar el acceso');
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres revocar este acceso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revocar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiFetch('access/revoke', 'POST', { accessId }, token || undefined);
              if (response.success) {
                Alert.alert('Éxito', 'Acceso revocado correctamente');
                loadData();
              } else {
                Alert.alert('Error', response.error || 'No se pudo revocar el acceso');
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo revocar el acceso');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
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
          <Text style={styles.title}>Gestión de Accesos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowGrantForm(!showGrantForm)}
          >
            <Text style={styles.addButtonText}>+ Otorgar</Text>
          </TouchableOpacity>
        </View>

        {showGrantForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email del usuario"
              value={formData.userEmail}
              onChangeText={(text) => setFormData({ ...formData, userEmail: text })}
              keyboardType="email-address"
            />
            <Text style={styles.label}>Tipo de acceso:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radio, formData.accessType === 'material' && styles.radioSelected]}
                onPress={() => setFormData({ ...formData, accessType: 'material' })}
              >
                <Text style={styles.radioText}>Material</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radio, formData.accessType === 'course' && styles.radioSelected]}
                onPress={() => setFormData({ ...formData, accessType: 'course' })}
              >
                <Text style={styles.radioText}>Curso</Text>
              </TouchableOpacity>
            </View>

            {formData.accessType === 'material' && (
              <>
                <Text style={styles.label}>Material:</Text>
                <ScrollView style={styles.resourceList}>
                  {materials.map((material) => (
                    <TouchableOpacity
                      key={material.materialId}
                      style={styles.resourceItem}
                      onPress={() => setFormData({
                        ...formData,
                        resourceId: material.materialId,
                        resourceName: material.name,
                      })}
                    >
                      <Text style={styles.resourceName}>{material.name}</Text>
                      {formData.resourceId === material.materialId && (
                        <Text style={styles.selected}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {formData.accessType === 'course' && (
              <>
                <Text style={styles.label}>Curso de ClickFunnels:</Text>
                <ScrollView style={styles.resourceList}>
                  {courses.map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      style={styles.resourceItem}
                      onPress={() => setFormData({
                        ...formData,
                        clickfunnelsCourseId: course.id,
                        resourceName: course.name,
                      })}
                    >
                      <Text style={styles.resourceName}>{course.name}</Text>
                      {formData.clickfunnelsCourseId === course.id && (
                        <Text style={styles.selected}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleGrantAccess}>
              <Text style={styles.submitButtonText}>Otorgar Acceso</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Otorgados</Text>
          {loading ? (
            <Text style={styles.loading}>Cargando...</Text>
          ) : (
            <View style={styles.list}>
              {userAccesses.length === 0 ? (
                <Text style={styles.empty}>No hay accesos otorgados</Text>
              ) : (
                userAccesses.map((access) => (
                  <View key={access.accessId} style={styles.accessCard}>
                    <View style={styles.accessHeader}>
                      <Text style={styles.accessType}>{access.accessType.toUpperCase()}</Text>
                      <TouchableOpacity
                        style={styles.revokeButton}
                        onPress={() => handleRevokeAccess(access.accessId)}
                      >
                        <Text style={styles.revokeButtonText}>Revocar</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.accessResource}>{access.resourceName || access.resourceId}</Text>
                    <Text style={styles.accessDate}>Otorgado: {formatDate(access.grantedAt)}</Text>
                    {access.expiresAt && (
                      <Text style={styles.accessExpiry}>
                        Expira: {formatDate(access.expiresAt)}
                      </Text>
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
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  radio: {
    flex: 1,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  radioText: {
    ...theme.typography.body,
    color: theme.colors.black,
  },
  resourceList: {
    maxHeight: 200,
    marginBottom: theme.spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  resourceName: {
    ...theme.typography.body,
    color: theme.colors.black,
    flex: 1,
  },
  selected: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
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
  accessCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  accessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  accessType: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  revokeButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  revokeButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
  },
  accessResource: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  accessDate: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  accessExpiry: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

