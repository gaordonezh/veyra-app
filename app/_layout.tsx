import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";

import "react-native-reanimated";
import { StyleSheet } from "react-native";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={StyleSheet.absoluteFill} edges={["top"]}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="transaction/new"
            options={{ title: "Nuevo movimiento" }}
          />

          <Stack.Screen
            name="receivable/new"
            options={{ title: "Nueva cuenta por cobrar" }}
          />

          <Stack.Screen
            name="receivable/[id]"
            options={{ title: "Detalle por cobrar" }}
          />

          <Stack.Screen
            name="receivable/edit/[id]"
            options={{ title: "Editar cuenta por cobrar" }}
          />

          <Stack.Screen
            name="payable/new"
            options={{ title: "Nuevo pago fijo" }}
          />

          <Stack.Screen
            name="payable/[id]"
            options={{ title: "Detalle por pagar" }}
          />

          <Stack.Screen
            name="payable/edit/[id]"
            options={{ title: "Editar pago fijo" }}
          />

          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}
