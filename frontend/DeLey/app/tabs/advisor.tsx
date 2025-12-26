import React from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
  Image as RNImage,
} from "react-native";
import { useRouter } from "expo-router";
import StarsBackground from "../../components/StarsBackground";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;
const Image = RNImage as any;

const AdvisorImage = require("../../assets/images/AdvisorImage.png");

export default function AdvisorModule() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StarsBackground />
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.hero}>
          <Image source={AdvisorImage} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.title}>Advisor Module</Text>
          <Text style={styles.subtitle}>
            Get personalized legal guidance from your AI assistant
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤝 Personal Guidance</Text>
          <Text style={styles.cardDescription}>
            Receive tailored advice based on your specific legal questions and situations.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Key Features</Text>
          <Text style={styles.cardDescription}>
            • 24/7 AI assistance{"\n"}
            • Personalized recommendations{"\n"}
            • Document analysis{"\n"}
            • Case strategy suggestions
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Get Expert Help</Text>
          <Text style={styles.cardDescription}>
            Ask questions, upload documents, or describe your situation. Our AI
            advisor will provide clear, actionable guidance.
          </Text>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  heroImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(69, 183, 209, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: "#cbd5e0",
    lineHeight: 22,
  },
});
