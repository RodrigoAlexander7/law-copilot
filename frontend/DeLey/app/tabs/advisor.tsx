import React, { useState } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import StarsBackground from "../../components/StarsBackground";
import AdvisorCard, { LegalAdvisor } from "../../components/AdvisorCard";
import ChatHistory from "../../components/ChatHistory";
import LoadingOverlay from "../../components/LoadingOverlay";
import CustomAlert from "../../components/CustomAlert";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

// AI Legal Advisors Database
const LEGAL_ADVISORS: LegalAdvisor[] = [
  {
    id: "1",
    name: "Constitutional AI Advisor",
    avatar: "⚖️",
    title: "Corporate & Contract Law Specialist",
    specialties: [
      "Corporate Law",
      "Contract Negotiation",
      "Mergers & Acquisitions",
      "Intellectual Property",
    ],
    rating: 4.9,
    languages: ["English", "Spanish", "French"],
    tags: ["Corporate", "Contracts", "IP", "M&A", "Expert"],
    description:
      "An advanced AI legal assistant specialized in corporate law and business transactions. Trained on extensive case law and legal frameworks to provide comprehensive guidance on complex business matters, contracts, and intellectual property issues.",
  },
  {
    id: "2",
    name: "Criminal Defense AI Counsel",
    avatar: "🛡️",
    title: "Criminal Law & Defense Specialist",
    specialties: [
      "Criminal Defense",
      "White Collar Crime",
      "DUI Cases",
      "Appeals",
    ],
    rating: 4.7,
    languages: ["English", "Spanish"],
    tags: ["Criminal", "Defense", "Appeals", "DUI"],
    description:
      "A sophisticated AI advisor trained in criminal law and defense strategies. Provides detailed analysis of criminal cases, defense tactics, and legal precedents to help you understand your rights and legal options in criminal matters.",
  },
  {
    id: "3",
    name: "Family Law AI Advisor",
    avatar: "👨‍👩‍👧‍👦",
    title: "Family Law & Domestic Relations Specialist",
    specialties: [
      "Divorce",
      "Child Custody",
      "Adoption",
      "Domestic Relations",
    ],
    rating: 4.8,
    languages: ["English", "Mandarin", "Cantonese"],
    tags: ["Family Law", "Divorce", "Custody", "Adoption", "Compassionate"],
    description:
      "An empathetic AI legal assistant specialized in family law matters. Trained to provide sensitive, comprehensive guidance on divorce, custody, adoption, and other family-related legal issues with a focus on finding balanced solutions.",
  },
];

export default function AdvisorModule() {
  const router = useRouter();
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{ text: string; onPress?: () => void; style?: "default" | "cancel" | "destructive" }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const handleAdvisorPress = (advisor: LegalAdvisor) => {
    setAlertConfig({
      visible: true,
      title: advisor.name,
      message: `Start consultation with ${advisor.name}?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start", 
          style: "default",
          onPress: () => startConsultation(advisor)
        }
      ],
    });
  };

  const startConsultation = async (advisor: LegalAdvisor) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      router.push({
        pathname: "/advisor-chat",
        params: { advisor: JSON.stringify(advisor) },
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to start consultation. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  const handleContinueConsultation = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      // Load session to get advisor info
      const { chatStorageService } = await import("../../services/chatStorageService");
      const session = await chatStorageService.loadSession("advisor", sessionId);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      // Find or create advisor from session
      let advisor = LEGAL_ADVISORS.find(a => `advisor-${a.id}` === session.educatorId);
      
      if (!advisor) {
        // Create advisor from session data
        advisor = {
          id: session.educatorId.replace("advisor-", ""),
          name: session.educatorName,
          avatar: session.educatorAvatar,
          title: "Legal Advisor",
          specialties: [],
          rating: 4.8,
          languages: ["English"],
          tags: [],
          description: "",
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate with sessionId
      router.push({
        pathname: "/advisor-chat",
        params: { 
          advisor: JSON.stringify(advisor),
          sessionId: sessionId
        },
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to continue consultation. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StarsBackground />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View>
          <LinearGradient
            colors={["rgba(251, 191, 36, 0.15)", "rgba(245, 158, 11, 0.05)"]}
            style={styles.header}
          >
            <Text style={styles.title}>AI Legal Advisory</Text>
            <Text style={styles.subtitle}>
              AI-powered legal advisors trained in various legal specialties
            </Text>
          </LinearGradient>
        </View>

        {/* Advisors Cards */}
        <View style={styles.advisorsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.advisorsSection}
          >
            {LEGAL_ADVISORS.map((advisor, index) => (
              <View key={advisor.id} style={styles.advisorCardWrapper}>
                <AdvisorCard
                  advisor={advisor}
                  onPress={handleAdvisorPress}
                  index={index}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Consultation History */}
        <ChatHistory
          moduleType="advisor"
          onContinue={handleContinueConsultation}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>

      {isLoading && <LoadingOverlay />}
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251, 191, 36, 0.2)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(251, 191, 36, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 22,
  },
  advisorsContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  advisorsSection: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 16,
  },
  advisorCardWrapper: {
    width: 340,
    maxWidth: '90%',
  },
});