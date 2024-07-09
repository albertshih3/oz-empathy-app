import { Stack } from "expo-router";
import React from 'react'
import Account from "@/components/Account";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: true, title: "Home", headerRight: () => <Account /> }} />
      <Stack.Screen name="info" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="welcome" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="learn" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="resources" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="cat" options={{ headerShown: true, title: "California Trail" }} />
    </Stack>
  )
}

export default HomeLayout