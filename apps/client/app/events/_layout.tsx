import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack>
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

