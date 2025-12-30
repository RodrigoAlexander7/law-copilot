import React, { useRef, useEffect } from "react";
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
  rating: number; // 1-5
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
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer effect for premium feel
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= advisor.rating ? "⭐" : "☆"}
        </Text>
      );
    }
    return stars;
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

          {/* Shimmer Effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{advisor.avatar}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{advisor.name}</Text>
                <Text style={styles.title}>{advisor.title}</Text>
                <View style={styles.ratingContainer}>{renderStars()}</View>
              </View>
            </View>
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesContainer}>
            <Text style={styles.specialtiesLabel}>Specialties:</Text>
            <View style={styles.specialtiesList}>
              {advisor.specialties.slice(0, 3).map((specialty, idx) => (
                <View key={idx} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
              {advisor.specialties.length > 3 && (
                <View style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>
                    +{advisor.specialties.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.consultButton}>
              <Text style={styles.consultButtonText}>View Profile →</Text>
            </View>
          </View>

          {/* Premium Badge if high rating */}
          {advisor.rating >= 4.5 && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Top Rated</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
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
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    width: 100,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ skewX: "-20deg" }],
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  avatar: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
    textShadowColor: "rgba(251, 191, 36, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  specialtiesContainer: {
    padding: 16,
    paddingTop: 12,
  },
  specialtiesLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  specialtyText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
  },
  consultButton: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  consultButtonText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "700",
  },
  premiumBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(251, 191, 36, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 20,
  },
  premiumText: {
    fontSize: 11,
    color: "#0a0a0a",
    fontWeight: "800",
  },
});
