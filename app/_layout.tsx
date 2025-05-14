import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import SignIn from "./(auth)/signin";
import { initializeFirestore } from '../src/firebase/config';
import { ConnectionProvider } from '../src/utils/ConnectionManager';
import { NotificationManager } from '../src/notifications';

export default function RootLayout() {
  // Initialize Firebase persistence on app startup
  useEffect(() => {
    // Enable unlimited offline persistence
    initializeFirestore();
  }, []);

  return (
    <ConnectionProvider>
      <NotificationManager>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false, title: "Back" }} />
          <Stack.Screen name="(animal)" options={{ headerShown: false }} />
          <Stack.Screen name="(detail)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: true, title: "Admin" }} />
        </Stack>
      </NotificationManager>
    </ConnectionProvider>
  );
}
