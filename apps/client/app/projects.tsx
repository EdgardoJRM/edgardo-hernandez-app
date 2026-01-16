import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

interface Project {
  projectId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo: string[];
  dueDate?: number;
}

export default function Projects() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Project[]>('projects', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    try {
      const response = await apiFetch<Project>('projects', 'POST', formData, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Proyecto creado correctamente');
        setShowAddForm(false);
        setFormData({ name: '', description: '', status: 'planning', priority: 'medium' });
        loadProjects();
      } else {
        Alert.alert('Error', response.error || 'No se pudo crear el proyecto');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el proyecto');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: '#3498db',
      in_progress: '#f39c12',
      on_hold: '#95a5a6',
      completed: '#27ae60',
      cancelled: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Proyectos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del proyecto"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddProject}>
            <Text style={styles.submitButtonText}>Crear Proyecto</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <View style={styles.list}>
          {projects.map((project) => (
            <View key={project.projectId} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>
              {project.description && (
                <Text style={styles.projectDescription}>{project.description}</Text>
              )}
              <View style={styles.projectInfo}>
                <Text style={styles.projectPriority}>Prioridad: {project.priority}</Text>
                {project.assignedTo && project.assignedTo.length > 0 && (
                  <Text style={styles.projectAssigned}>
                    Asignado a: {project.assignedTo.length} persona(s)
                  </Text>
                )}
              </View>
            </View>
          ))}
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
  projectCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  projectName: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
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
  projectDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  projectInfo: {
    marginTop: theme.spacing.sm,
  },
  projectPriority: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  projectAssigned: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

