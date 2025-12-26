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
        animation: "slide_from_right",
        animationDuration: 300,
        customAnimationOnGesture: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="education"
        options={{
          title: "Education Module",
          headerStyle: {
            backgroundColor: "#ff6b6b",
          },
          animation: "fade_from_bottom",
        }}
      />
      <Stack.Screen
        name="debate"
        options={{
          title: "Debate Module",
          headerStyle: {
            backgroundColor: "#4ecdc4",
          },
          animation: "fade_from_bottom",
        }}
      />
      <Stack.Screen
        name="advisor"
        options={{
          title: "Advisor Module",
          headerStyle: {
            backgroundColor: "#45b7d1",
          },
          animation: "fade_from_bottom",
        }}
      />
    </Stack>
  );
}
