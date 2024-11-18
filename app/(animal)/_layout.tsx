import { Stack } from "expo-router";
import React from 'react'
import Account from "@/components/Account";

const AnimalLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="[animal]" options={{ headerShown: true }} />
      <Stack.Screen name="diet" options={{ headerShown: true, title: "Additional Information"}} />
    </Stack>
  )
}

export default AnimalLayout