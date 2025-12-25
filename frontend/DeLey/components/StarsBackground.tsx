import React, { useEffect, useRef } from "react";
import { View as RNView, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const View = RNView as any;
const AnimatedView = Animated.View as any;

const { width, height } = Dimensions.get("window");

// Función para generar posiciones aleatorias en un rango
const generateShadows = (n: number, size: number, yOffset: number) => {
  const shadows = [];
  for (let i = 0; i < n; i++) {
    shadows.push({
      left: Math.random() * 100, // porcentaje
      top: yOffset + Math.random() * 100, // porcentaje
      size,
    });
  }
  return shadows;
};

const StarsLayer = ({ shadows1, shadows2, duration }: { shadows1: any[], shadows2: any[], duration: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, [duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });

  return (
    <AnimatedView style={[styles.layer, { transform: [{ translateY }] }]}>
      {shadows1.map((shadow, index) => (
        <View
          key={`1-${index}`}
          style={[
            styles.star,
            {
              left: `${shadow.left}%`,
              top: `${shadow.top}%`,
              width: shadow.size,
              height: shadow.size,
              backgroundColor: "white",
            },
          ]}
        />
      ))}
      {shadows2.map((shadow, index) => (
        <View
          key={`2-${index}`}
          style={[
            styles.star,
            {
              left: `${shadow.left}%`,
              top: `${shadow.top}%`,
              width: shadow.size,
              height: shadow.size,
              backgroundColor: "white",
            },
          ]}
        />
      ))}
    </AnimatedView>
  );
};

export default function StarsBackground() {
  const shadowsSmall1 = generateShadows(100, 1, 0);
  const shadowsSmall2 = generateShadows(100, 1, 100); // 100% para el segundo layer
  const shadowsMedium1 = generateShadows(50, 2, 0);
  const shadowsMedium2 = generateShadows(50, 2, 100);
  const shadowsBig1 = generateShadows(25, 3, 0);
  const shadowsBig2 = generateShadows(25, 3, 100);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1B2735", "#090A0F"]}
        style={styles.gradient}
      />
      <StarsLayer shadows1={shadowsSmall1} shadows2={shadowsSmall2} duration={50000} />
      <StarsLayer shadows1={shadowsMedium1} shadows2={shadowsMedium2} duration={100000} />
      <StarsLayer shadows1={shadowsBig1} shadows2={shadowsBig2} duration={150000} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  layer: {
    position: "absolute",
    width: "100%",
    height: "200%", // Para cubrir el scroll
  },
  star: {
    position: "absolute",
    borderRadius: 50,
  },
});
