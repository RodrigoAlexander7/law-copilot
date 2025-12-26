import { Stack } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0a0a0a",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitle: "Back",
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="education"
        options={{
          title: "Education Module",
          headerStyle: {
            backgroundColor: "#ff6b6b",
          },
        }}
      />
      <Stack.Screen
        name="debate"
        options={{
          title: "Debate Module",
          headerStyle: {
            backgroundColor: "#4ecdc4",
          },
        }}
      />
      <Stack.Screen
        name="advisor"
        options={{
          title: "Advisor Module",
          headerStyle: {
            backgroundColor: "#45b7d1",
          },
        }}
      />
    </Stack>
  );
}
