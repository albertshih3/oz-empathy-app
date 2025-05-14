import { Stack } from 'expo-router';
import React from 'react';

export default function DetailLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' },
    }}>
      <Stack.Screen
        name="[detail]"
        options={{
          headerShown: false,
          title: '',
        }}
      />
    </Stack>
  );
}
