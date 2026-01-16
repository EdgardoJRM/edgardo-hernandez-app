import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme';
import { ASSETS } from '../src/constants/assets';
import { useResponsive } from '../src/utils/responsive';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDesktop, width } = useResponsive();
  
  const maxWidth = isDesktop ? 1200 : '100%';
  const cardLayout = isDesktop ? 'row' : 'column';
  const isEmployee = user?.role === 'employee' || user?.role === 'admin';

  // Si es usuario normal, mostrar vista personal
  if (!isEmployee) {
    return (
      <ScrollView style={styles.container}>
        <View style={[styles.contentWrapper, { maxWidth }]}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>EDGARDO HERNÁNDEZ</Text>
              <Text style={styles.logoSubtext}>ACELERANDO TU NEGOCIO</Text>
            </View>
            <Text style={styles.greeting}>Hola{user?.name ? `, ${user.name}` : ''}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mi Información</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ID de Usuario</Text>
              <Text style={styles.infoValue}>{user?.userId}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            {user?.name && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            )}

            {user?.business && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Empresa</Text>
                <Text style={styles.infoValue}>{user.business}</Text>
              </View>
            )}

            {user?.tags && user.tags.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Tags</Text>
                <Text style={styles.infoValue}>{user.tags.join(', ')}</Text>
              </View>
            )}

            {user?.clickfunnelsStatus && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Estado ClickFunnels</Text>
                <Text style={styles.infoValue}>{user.clickfunnelsStatus}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileButton, { marginTop: theme.spacing.md, backgroundColor: theme.colors.accent }]}
              onPress={() => router.push('/courses')}
            >
              <Text style={styles.profileButtonText}>📚 Mis Cursos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Vista de empleado - Centro de Control completo
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.contentWrapper, { maxWidth }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>EDGARDO HERNÁNDEZ</Text>
            <Text style={styles.logoSubtext}>ACELERANDO TU NEGOCIO</Text>
          </View>
          <Text style={styles.greeting}>Hola{user?.name ? `, ${user.name}` : ''}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>👔 Empleado</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centro de Control</Text>
          
          <View style={[styles.cardsContainer, { flexDirection: cardLayout }]}>
            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/materials')}
            >
              <Text style={styles.cardTitle}>📦 Materiales</Text>
              <Text style={styles.cardDescription}>
                Gestiona inventario y materiales de la empresa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/projects')}
            >
              <Text style={styles.cardTitle}>🚀 Proyectos</Text>
              <Text style={styles.cardDescription}>
                Administra proyectos y asignaciones
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/attendance')}
            >
              <Text style={styles.cardTitle}>✅ Asistencia</Text>
              <Text style={styles.cardDescription}>
                Control de asistencia con código QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/emails')}
            >
              <Text style={styles.cardTitle}>📧 Emails</Text>
              <Text style={styles.cardDescription}>
                Envía emails y revisa vitacora
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/sms')}
            >
              <Text style={styles.cardTitle}>💬 Mensajes</Text>
              <Text style={styles.cardDescription}>
                Envía mensajes de texto SMS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/birthdays')}
            >
              <Text style={styles.cardTitle}>🎂 Cumpleaños</Text>
              <Text style={styles.cardDescription}>
                Gestiona y celebra cumpleaños
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/events')}
            >
              <Text style={styles.cardTitle}>🎪 Eventos y Talleres</Text>
              <Text style={styles.cardDescription}>
                Gestiona eventos, registros y check-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/events/scanner')}
            >
              <Text style={styles.cardTitle}>📷 Scanner Check-in</Text>
              <Text style={styles.cardDescription}>
                Escanea códigos QR para check-in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/access')}
            >
              <Text style={styles.cardTitle}>🔐 Gestión de Accesos</Text>
              <Text style={styles.cardDescription}>
                Otorga acceso a materiales y cursos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.cardTitle}>👤 Mi Perfil</Text>
              <Text style={styles.cardDescription}>
                Actualiza tu información personal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      paddingHorizontal: 0,
    }),
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    ...theme.typography.titleLarge,
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  logoSubtext: {
    ...theme.typography.subtitleSmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  greeting: {
    ...theme.typography.title,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  cardsContainer: {
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    flex: 1,
  },
  cardDesktop: {
    marginBottom: 0,
    minHeight: 150,
  },
  cardTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    ...theme.typography.bodyLarge,
    color: theme.colors.black,
    fontWeight: '600',
  },
  profileButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  profileButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  roleBadge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
  },
  roleText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
