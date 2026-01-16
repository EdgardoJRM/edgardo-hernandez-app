import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { loadFonts } from '../src/utils/fonts';

export default function RootLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadFonts();
      checkAuth();
    };
    init();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3F5E78', // Blue Slate claro
        },
        headerTintColor: '#f2f2f2', // White Smoke
        headerTitleStyle: {
          fontFamily: 'BebasNeue-Regular',
          fontSize: 20,
          letterSpacing: 1,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/index" options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="auth/verify" options={{ title: 'Verificar Código' }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="forms/index" options={{ title: 'Formularios' }} />
      <Stack.Screen name="forms/[formId]" options={{ title: 'Formulario' }} />
      <Stack.Screen name="submissions/index" options={{ title: 'Mis Respuestas' }} />
      <Stack.Screen name="submissions/[id]" options={{ title: 'Resultado' }} />
      <Stack.Screen name="materials" options={{ title: 'Materiales' }} />
      <Stack.Screen name="projects" options={{ title: 'Proyectos' }} />
      <Stack.Screen name="attendance" options={{ title: 'Asistencia' }} />
      <Stack.Screen name="emails" options={{ title: 'Emails' }} />
      <Stack.Screen name="sms" options={{ title: 'Mensajes SMS' }} />
      <Stack.Screen name="birthdays" options={{ title: 'Cumpleaños' }} />
      <Stack.Screen name="access" options={{ title: 'Gestión de Accesos' }} />
      <Stack.Screen name="courses" options={{ title: 'Mis Cursos' }} />
    </Stack>
  );
}

