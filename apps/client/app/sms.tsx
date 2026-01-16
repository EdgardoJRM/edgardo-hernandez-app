import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { apiFetch } from '../src/utils/api';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

export default function SMS() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    to: '',
    message: '',
  });

  const handleSendSms = async () => {
    if (!formData.to || !formData.message) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const response = await apiFetch('sms/send', 'POST', formData, token || undefined);

      if (response.success) {
        Alert.alert('Éxito', 'Mensaje SMS enviado correctamente');
        setFormData({ to: '', message: '' });
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar el SMS');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el SMS');
    }
  };

  return (
    <ProtectedRoute requiredRole="employee">
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mensajes SMS</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Número de teléfono (ej: +1234567890)"
          value={formData.to}
          onChangeText={(text) => setFormData({ ...formData, to: text })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mensaje"
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
          multiline
          numberOfLines={8}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSendSms}>
          <Text style={styles.submitButtonText}>Enviar SMS</Text>
        </TouchableOpacity>
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
    minHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
});

