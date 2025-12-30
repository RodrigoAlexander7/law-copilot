import React, { useRef, useEffect } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Platform,
} from "react-native";

const View = RNView as any;
const Text = RNText as any;

export interface LegalModel {
  id: string;
  name: string;
  avatar: string; // emoji for avatar
  specialty: string;
  personality: string;
  description: string;
  tags: string[];
  experience: string;
  approach: string;
}

interface ModelCardProps {
  model: LegalModel;
  onStart: (model: LegalModel) => void;
}

export default function ModelCard({ model, onStart }: ModelCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  const handlePress = () => {
    if (Platform.OS === 'web') {
      // Web: Use confirm dialog
      const confirmed = window.confirm(
        `${model.name}\n\nSpecialty: ${model.specialty}\n\n${model.description}\n\nPersonality: ${model.personality}\n\nExperience: ${model.experience}\n\nApproach: ${model.approach}\n\nTags: ${model.tags.join(", ")}\n\nStart learning?`
      );
      if (confirmed) {
        onStart(model);
      }
    } else {
      // Mobile: Use Alert.alert
      Alert.alert(
        model.name,
        `Specialty: ${model.specialty}\n\n${model.description}\n\nPersonality: ${model.personality}\n\nExperience: ${model.experience}\n\nApproach: ${model.approach}\n\nTags: ${model.tags.join(", ")}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Start Learning",
            onPress: () => onStart(model),
            style: "default",
          },
        ]
      );
    }
  };

  return (
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
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.cardContent}>
          {/* Avatar */}
          <View
            style={styles.avatarContainer}
          >
            <Text style={styles.avatar}>{model.avatar}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{model.name}</Text>
            <Text style={styles.specialty}>{model.specialty}</Text>
            <Text style={styles.personality} numberOfLines={1}>
              {model.personality}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {model.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                >
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Glowing border effect */}
        <Animated.View
          style={[
            styles.glowBorder,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(20, 20, 30, 0.8)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 107, 107, 0.4)",
  },
  avatar: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textShadowColor: "rgba(255, 107, 107, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  specialty: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "600",
    marginBottom: 4,
  },
  personality: {
    fontSize: 12,
    color: "#cbd5e1",
    marginBottom: 8,
    fontStyle: "italic",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  tagText: {
    fontSize: 10,
    color: "#ffa8a8",
    fontWeight: "600",
  },
  glowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.5)",
    opacity: 0.5,
  },
});
