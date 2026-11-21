import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "house.fill",
                android: "home",
                web: "home",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Movimientos",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "arrow.left.arrow.right",
                android: "swap_horiz",
                web: "swap_horiz",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="receivables"
        options={{
          title: "Por cobrar",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "hand.raised.fill",
                android: "payments",
                web: "payments",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="payables"
        options={{
          title: "Por pagar",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "calendar",
                android: "event",
                web: "event",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
