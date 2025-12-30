import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * LoadingOverlay - Componente de carga que bloquea interacciones
 * 
 * Características:
 * - Bloquea todas las interacciones con la pantalla
 * - Animación suave con moti
 * - Efecto blur en el fondo
 * - Mensaje personalizable
 */
export default function LoadingOverlay({
  visible,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      // Previene el cierre con botón de atrás en Android
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        {/* Blur background for iOS */}
        {Platform.OS === "ios" ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill}>
            <View style={styles.overlayBackground} />
          </BlurView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.overlayBackground]} />
        )}

        {/* Loading Card */}
        <MotiView
          from={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "spring",
            duration: 400,
          }}
          style={styles.loadingCard}
        >
          <LinearGradient
            colors={["rgba(30, 41, 59, 0.98)", "rgba(15, 23, 42, 0.98)"]}
            style={styles.gradient}
          >
            {/* Animated spinner container */}
            <MotiView
              from={{ rotate: "0deg" }}
              animate={{ rotate: "360deg" }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
            >
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#fbbf24" />
              </View>
            </MotiView>

            {/* Loading text */}
            <Text style={styles.loadingText}>{message}</Text>

            {/* Animated dots */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "timing",
                    duration: 600,
                    delay: index * 200,
                    loop: true,
                  }}
                  style={styles.dot}
                />
              ))}
            </View>
          </LinearGradient>

          {/* Glow effect */}
          <View style={styles.glowEffect} />
        </MotiView>

        {/* Pulsating ring effect */}
        <MotiView
          from={{
            scale: 0.8,
            opacity: 0.5,
          }}
          animate={{
            scale: 1.5,
            opacity: 0,
          }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
          }}
          style={styles.pulseRing}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  overlayBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingCard: {
    width: 280,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradient: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: 24,
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fbbf24",
    marginTop: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
  },
  pulseRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: "#fbbf24",
  },
});
