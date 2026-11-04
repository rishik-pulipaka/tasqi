import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans"
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AppProvider, useApp } from "../context/AppContext"

function RootStack() {
  const { username } = useApp()

  // Stack.Protected handles the redirects: logged out -> login, logged in -> tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!username}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!username}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  })

  if (!loaded) return null

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppProvider>
  )
}
