import { Stack } from "expo-router";
import SignIn from "./(auth)/signin";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(home)" options={{ headerShown: false, title: "Back" }} />
    </Stack>
  );
}
