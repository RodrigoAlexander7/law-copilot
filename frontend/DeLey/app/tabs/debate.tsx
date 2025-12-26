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

const DebateImage = require("../../assets/images/DebateImage.png");

export default function DebateModule() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StarsBackground />
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.hero}>
          <Image source={DebateImage} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.title}>Debate Module</Text>
          <Text style={styles.subtitle}>
            Engage in legal discussions and explore different perspectives
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚖️ Legal Debates</Text>
          <Text style={styles.cardDescription}>
            Practice your argumentation skills with AI-powered legal debate scenarios.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Key Features</Text>
          <Text style={styles.cardDescription}>
            • Real case simulations{"\n"}
            • Multiple perspectives analysis{"\n"}
            • Argument evaluation{"\n"}
            • Critical thinking development
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Challenge Yourself</Text>
          <Text style={styles.cardDescription}>
            Test your legal reasoning by debating complex cases. Learn to see
            issues from multiple angles and build stronger arguments.
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
    textShadowColor: "rgba(78, 205, 196, 0.5)",
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
