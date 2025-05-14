import { Stack } from "expo-router";
import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const AuthLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: theme.background
        },
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};

export default AuthLayout;