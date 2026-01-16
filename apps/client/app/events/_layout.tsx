import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Eventos y Talleres'
        }} 
      />
      <Stack.Screen 
        name="scanner" 
        options={{ 
          title: 'Scanner Check-in',
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}

