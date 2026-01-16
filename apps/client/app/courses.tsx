import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';

interface Course {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

interface Access {
  accessId: string;
  resourceId: string;
  resourceName?: string;
  clickfunnelsCourseId?: string;
  grantedAt: number;
}

export default function Courses() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myAccesses, setMyAccesses] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accessesRes] = await Promise.all([
        apiFetch<Access[]>('access?accessType=course', 'GET', undefined, token || undefined),
      ]);

      if (accessesRes.success && accessesRes.data) {
        setMyAccesses(accessesRes.data);
        // Convertir accesos a cursos
        const accessibleCourses: Course[] = accessesRes.data.map(access => ({
          id: access.clickfunnelsCourseId || access.resourceId,
          name: access.resourceName || 'Curso',
          description: 'Tienes acceso a este curso',
        }));
        setCourses(accessibleCourses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCourse = async (courseId: string) => {
    // Construir URL del curso en ClickFunnels
    // Ajusta según la estructura de URLs de ClickFunnels
    const courseUrl = `https://app.clickfunnels.com/courses/${courseId}`;
    
    try {
      const canOpen = await Linking.canOpenURL(courseUrl);
      if (canOpen) {
        await Linking.openURL(courseUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir el curso. Verifica tu acceso en ClickFunnels.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el curso');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Cursos</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <View style={styles.content}>
          {courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes acceso a ningún curso</Text>
              <Text style={styles.emptySubtext}>
                Contacta con un administrador para obtener acceso a cursos
              </Text>
            </View>
          ) : (
            courses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <Text style={styles.courseTitle}>{course.name}</Text>
                {course.description && (
                  <Text style={styles.courseDescription}>{course.description}</Text>
                )}
                <TouchableOpacity
                  style={styles.openButton}
                  onPress={() => handleOpenCourse(course.id)}
                >
                  <Text style={styles.openButtonText}>Abrir Curso</Text>
                </TouchableOpacity>
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
  content: {
    padding: theme.spacing.md,
  },
  loading: {
    ...theme.typography.body,
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  courseTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  courseDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  openButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  openButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});

