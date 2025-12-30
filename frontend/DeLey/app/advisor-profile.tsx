import React, { useState } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import StarsBackground from "../components/StarsBackground";
import { LegalAdvisor } from "../components/AdvisorCard";
import { saveConsultation } from "../components/ConsultationHistory";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;
const TextInput = RNTextInput as any;

export default function AdvisorProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const advisor: LegalAdvisor = params.advisor
    ? JSON.parse(params.advisor as string)
    : null;

  if (!advisor) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Advisor not found</Text>
      </View>
    );
  }

  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Contract Review",
    "Legal Dispute",
    "Business Law",
    "Family Law",
    "Real Estate",
    "Employment",
    "Other",
  ];

  const handleStartConsultation = async () => {
    if (!topic.trim()) {
      Alert.alert("Missing Information", "Please describe your legal matter.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Missing Category", "Please select a consultation category.");
      return;
    }

    try {
      await saveConsultation({
        advisorName: advisor.name,
        advisorAvatar: advisor.avatar,
        topic: topic,
        category: selectedCategory,
        status: "Active",
        startedAt: new Date(),
        lastMessage: "Consultation started",
        messageCount: 0,
        priority: "Medium",
      });

      Alert.alert(
        "Consultation Started! 🎯",
        `${advisor.name} will assist you with your legal matter.`,
        [
          {
            text: "Continue",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to start consultation.");
    }
  };

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
    <View style={styles.container}>
      <StarsBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View>
          <LinearGradient
            colors={["rgba(251, 191, 36, 0.15)", "rgba(245, 158, 11, 0.05)"]}
            style={styles.profileHeader}
          >
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{advisor.avatar}</Text>
            </View>
            <Text style={styles.nameText}>{advisor.name}</Text>
            <Text style={styles.titleText}>{advisor.title}</Text>
            <View style={styles.ratingRow}>{renderStars()}</View>
            <Text style={styles.ratingText}>
              {advisor.rating} / 5.0
            </Text>
          </LinearGradient>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 About</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{advisor.description}</Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Specialties</Text>
          <View style={styles.card}>
            <View style={styles.specialtiesGrid}>
              {advisor.specialties.map((specialty, index) => (
                <View
                  key={index}
                >
                  <View style={styles.specialtyTag}>
                    <Text style={styles.specialtyTagText}>{specialty}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Languages</Text>
          <View style={styles.card}>
            <Text style={styles.languagesText}>
              {advisor.languages.join(" • ")}
            </Text>
          </View>
        </View>

        {/* Start Consultation Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Start Consultation</Text>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Select Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === cat &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Describe Your Legal Matter</Text>
            <TextInput
              style={styles.topicInput}
              placeholder="Explain your situation in detail..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={topic}
              onChangeText={setTopic}
              multiline
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartConsultation}
          >
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.startButtonText}>Start Consultation 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Back to Advisors</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251, 191, 36, 0.2)",
  },
  avatarLarge: {
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
  avatarText: {
    fontSize: 50,
  },
  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
    textShadowColor: "rgba(251, 191, 36, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleText: {
    fontSize: 16,
    color: "#fbbf24",
    fontWeight: "600",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  star: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 13,
    color: "#cbd5e1",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textShadowColor: "rgba(251, 191, 36, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: "rgba(30, 30, 40, 0.8)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  description: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 22,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specialtyTag: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  specialtyTagText: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "600",
  },
  languagesText: {
    fontSize: 14,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  categoryButtonActive: {
    backgroundColor: "rgba(251, 191, 36, 0.3)",
    borderColor: "#fbbf24",
  },
  categoryButtonText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fbbf24",
  },
  topicInput: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    padding: 14,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#94a3b8",
  },
  errorText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 100,
  },
});
