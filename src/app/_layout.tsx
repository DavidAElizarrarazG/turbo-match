import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Turbo Match" }} />
        <Stack.Screen
          name="game"
          options={{ title: "Juego", headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="gameover"
          options={{ title: "Fin del juego", headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="credits" options={{ title: "Créditos" }} />
      </Stack>
    </>
  );
}
