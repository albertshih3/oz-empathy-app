import { Stack } from "expo-router";
import React from 'react'

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: true, title: "Home" }} />
      <Stack.Screen name="welcome" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="cat" options={{ headerShown: true, title: "California Trail" }} />
    </Stack>
  )
}

export default HomeLayout