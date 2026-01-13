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
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          
          <View style={[styles.cardsContainer, { flexDirection: cardLayout }]}>
            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/forms')}
            >
              <Text style={styles.cardTitle}>📋 Formularios</Text>
              <Text style={styles.cardDescription}>
                Completa formularios y obtén resultados personalizados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onPress={() => router.push('/submissions')}
            >
              <Text style={styles.cardTitle}>📊 Mis Respuestas</Text>
              <Text style={styles.cardDescription}>
                Revisa tus respuestas anteriores y resultados
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
});
