import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

interface Material {
  materialId: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
  status: string;
}

export default function Materials() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    location: '',
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<Material[]>('materials', 'GET', undefined, token || undefined);
      if (response.success && response.data) {
        setMaterials(response.data);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      Alert.alert('Error', 'No se pudieron cargar los materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    try {
      const response = await apiFetch<Material>('materials', 'POST', {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
      }, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Material agregado correctamente');
        setShowAddForm(false);
        setFormData({ name: '', description: '', category: '', quantity: '', unit: '', location: '' });
        loadMaterials();
      } else {
        Alert.alert('Error', response.error || 'No se pudo agregar el material');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el material');
    }
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Materiales</Text>
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
            placeholder="Nombre"
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
          <TextInput
            style={styles.input}
            placeholder="Categoría"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Cantidad"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Unidad (kg, litros, unidades)"
            value={formData.unit}
            onChangeText={(text) => setFormData({ ...formData, unit: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddMaterial}>
            <Text style={styles.submitButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <View style={styles.list}>
          {materials.map((material) => (
            <View key={material.materialId} style={styles.materialCard}>
              <Text style={styles.materialName}>{material.name}</Text>
              {material.description && (
                <Text style={styles.materialDescription}>{material.description}</Text>
              )}
              <View style={styles.materialInfo}>
                <Text style={styles.materialQuantity}>
                  Cantidad: {material.quantity} {material.unit || 'unidades'}
                </Text>
                {material.category && (
                  <Text style={styles.materialCategory}>Categoría: {material.category}</Text>
                )}
                {material.location && (
                  <Text style={styles.materialLocation}>Ubicación: {material.location}</Text>
                )}
                <Text style={styles.materialStatus}>Estado: {material.status}</Text>
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
  materialCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  materialName: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  materialDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  materialInfo: {
    marginTop: theme.spacing.sm,
  },
  materialQuantity: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  materialCategory: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  materialLocation: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  materialStatus: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

