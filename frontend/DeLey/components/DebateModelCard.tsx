import React, { useRef, useEffect } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { MotiView } from "moti";

const View = RNView as any;
const Text = RNText as any;

export interface DebateModel {
  id: string;
  name: string;
  avatar: string;
  category: string;
  description: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
}

interface DebateModelCardProps {
  model: DebateModel;
  onPress: (model: DebateModel) => void;
  index: number;
}

export default function DebateModelCard({
  model,
  onPress,
  index,
}: DebateModelCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getDifficultyColor = () => {
    switch (model.difficulty) {
      case "Beginner":
        return "#4ade80";
      case "Intermediate":
        return "#facc15";
      case "Advanced":
        return "#f87171";
      default:
        return "#94a3b8";
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 600,
        delay: index * 100,
      }}
    >
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => onPress(model)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* Animated glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          <View style={styles.cardContent}>
            {/* Avatar with gradient background */}
            <MotiView
              from={{ rotate: "0deg" }}
              animate={{ rotate: "360deg" }}
              transition={{
                type: "timing",
                duration: 20000,
                loop: true,
              }}
              style={styles.avatarWrapper}
            >
              <View style={styles.avatarGradient}>
                <Text style={styles.avatar}>{model.avatar}</Text>
              </View>
            </MotiView>

            <View style={styles.infoContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {model.name}
                </Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor() + "30" },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: getDifficultyColor() },
                    ]}
                  >
                    {model.difficulty}
                  </Text>
                </View>
              </View>

              <Text style={styles.category}>{model.category}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {model.description}
              </Text>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {model.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {model.tags.length > 3 && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>+{model.tags.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Shine effect */}
          <View style={styles.shineEffect} />

          {/* Configure button hint */}
          <View style={styles.configHint}>
            <Text style={styles.configText}>Tap to Configure</Text>
            <Text style={styles.configIcon}>⚙️</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(20, 25, 35, 0.9)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.3)",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  glowEffect: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(78, 205, 196, 0.5)",
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(78, 205, 196, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(78, 205, 196, 0.4)",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  avatar: {
    fontSize: 45,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(78, 205, 196, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "700",
  },
  category: {
    fontSize: 14,
    color: "#4ecdc4",
    fontWeight: "600",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(78, 205, 196, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.3)",
  },
  tagText: {
    fontSize: 10,
    color: "#4ecdc4",
    fontWeight: "600",
  },
  shineEffect: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 50,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ skewX: "-20deg" }],
  },
  configHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    borderTopWidth: 1,
    borderTopColor: "rgba(78, 205, 196, 0.2)",
    gap: 8,
  },
  configText: {
    fontSize: 13,
    color: "#4ecdc4",
    fontWeight: "600",
  },
  configIcon: {
    fontSize: 16,
  },
});
