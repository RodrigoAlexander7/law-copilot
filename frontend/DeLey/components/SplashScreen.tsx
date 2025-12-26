import React, { useRef, useEffect } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  Animated,
  Image as RNImage,
  Easing,
} from "react-native";

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const AnimatedView = Animated.View as any;

const LogoImage = require("../assets/images/LogoImage.png");

interface SplashScreenProps {
  progress: number;
  isComplete: boolean;
}

export default function SplashScreen({ progress, isComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, pulseAnim]);

  useEffect(() => {
    if (isComplete) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isComplete, fadeAnim]);

  if (isComplete && fadeAnim._value === 0) {
    return null;
  }

  return (
    <AnimatedView style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.stars}>
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              },
            ]}
          />
        ))}
      </View>

      <AnimatedView
        style={[
          styles.content,
          {
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
      >
        <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>De Ley</Text>
        <Text style={styles.subtitle}>Your Legal Assistant</Text>
      </AnimatedView>

      <View style={styles.progressContainer}>
        <Text style={styles.loadingText}>Loading assets...</Text>
        <View style={styles.progressBarContainer}>
          <AnimatedView
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  stars: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#ffffff",
    borderRadius: 1,
  },
  content: {
    alignItems: "center",
    marginBottom: 80,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textShadowColor: "rgba(78, 205, 196, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    opacity: 0.8,
  },
  progressContainer: {
    position: "absolute",
    bottom: 80,
    width: "80%",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4ecdc4",
    borderRadius: 2,
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  percentText: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
});
