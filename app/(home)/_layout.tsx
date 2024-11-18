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
      <Stack.Screen name="search" options={{ headerShown: true, title: "Search" }} />
      <Stack.Screen name="cat" options={{ headerShown: true, title: "California Trail" }} />
      <Stack.Screen name="africa" options={{ headerShown: true, title: "African Savanna" }} />
      <Stack.Screen name="cz" options={{ headerShown: true, title: "Children's Zoo" }} />
      <Stack.Screen name="rainforest" options={{ headerShown: true, title: "Tropical Rainforest" }} />
      <Stack.Screen name="australia" options={{ headerShown: true, title: "Wild Australia" }} />
    </Stack>
  )
}

export default HomeLayout