import React, { useRef } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const View = RNView as any;
const Text = RNText as any;

export interface LegalAdvisor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialties: string[];
  rating: number;
  languages: string[];
  tags: string[];
  description: string;
}

interface AdvisorCardProps {
  advisor: LegalAdvisor;
  onPress: (advisor: LegalAdvisor) => void;
  index: number;
}

export default function AdvisorCard({
  advisor,
  onPress,
  index,
}: AdvisorCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  return (
    <View>
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
          onPress={() => onPress(advisor)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={["rgba(251, 191, 36, 0.1)", "rgba(245, 158, 11, 0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBg}
          />

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{advisor.avatar}</Text>
            </View>
            <Text style={styles.name}>{advisor.name}</Text>
            <Text style={styles.title}>{advisor.title}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{advisor.description}</Text>
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesContainer}>
            <Text style={styles.specialtiesLabel}>Specialties</Text>
            <View style={styles.specialtiesList}>
              {advisor.specialties.map((specialty, idx) => (
                <View key={idx} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View style={styles.languagesContainer}>
            <Text style={styles.languagesLabel}>Languages</Text>
            <Text style={styles.languagesText}>{advisor.languages.join(", ")}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(30, 30, 40, 0.95)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    minHeight: 500,
    padding: 24,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  avatar: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(251, 191, 36, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 14,
    color: "#fbbf24",
    fontWeight: "600",
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 20,
    textAlign: "center",
  },
  specialtiesContainer: {
    marginBottom: 20,
  },
  specialtiesLabel: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  specialtyText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  languagesContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(251, 191, 36, 0.2)",
  },
  languagesLabel: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  languagesText: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "600",
    textAlign: "center",
  },
});
