import { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'admin';
}

export function ProtectedRoute({ children, requiredRole = 'employee' }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth');
        return;
      }

      const userRole = user?.role || 'user';
      const isEmployee = userRole === 'employee' || userRole === 'admin';
      
      if (requiredRole && !isEmployee) {
        Alert.alert(
          'Acceso Restringido',
          'Solo los empleados pueden acceder a esta sección.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userRole = user?.role || 'user';
  const isEmployee = userRole === 'employee' || userRole === 'admin';

  if (requiredRole && !isEmployee) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tienes permisos para acceder a esta sección</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

