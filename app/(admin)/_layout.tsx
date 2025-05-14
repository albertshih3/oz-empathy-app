import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { isAdminUser } from '../../src/firebase/config';

export default function AdminLayout() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      // Check if user is authorized admin
      if (isAdminUser()) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        // Redirect unauthorized users
        router.replace('/home');
      }
    };

    checkAdmin();
  }, []);

  // Show loading indicator while checking authorization
  if (authorized === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#183152" />
      </View>
    );
  }

  // Only render admin content if authorized
  return (
    <Stack>
      <Stack.Screen name="notifications" options={{ title: "Send Notifications" }} />
    </Stack>
  );
}