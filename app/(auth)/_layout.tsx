import { Stack } from "expo-router";
import React from 'react'

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ title: "Sign In" }} />
      <Stack.Screen name="signup" />
    </Stack>
  )
}

export default AuthLayout