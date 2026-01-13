import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { useResponsive } from '../src/utils/responsive';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { isDesktop, width } = useResponsive();
  const [name, setName] = useState(user?.name || '');
  const [business, setBusiness] = useState(user?.business || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [loading, setLoading] = useState(false);
  
  const maxWidth = isDesktop ? 600 : '100%';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBusiness(user.business || '');
      setIndustry(user.industry || '');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({
        name: name.trim() || undefined,
        business: business.trim() || undefined,
        industry: industry.trim() || undefined,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailValue}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={theme.colors.textSecondary}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Negocio</Text>
          <TextInput
            style={styles.input}
            value={business}
            onChangeText={setBusiness}
            placeholder="Nombre de tu negocio"
            placeholderTextColor={theme.colors.textSecondary}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Industria</Text>
          <TextInput
            style={styles.input}
            value={industry}
            onChangeText={setIndustry}
            placeholder="Tu industria"
            placeholderTextColor={theme.colors.textSecondary}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
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
  form: {
    padding: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  emailValue: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
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
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
