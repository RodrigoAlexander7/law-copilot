import React, { useState, useMemo } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import StarsBackground from "../../components/StarsBackground";
import SearchBar from "../../components/SearchBar";
import ModelCard, { LegalModel } from "../../components/ModelCard";
import ChatHistory from "../../components/ChatHistory";
import LoadingOverlay from "../../components/LoadingOverlay";
import CustomAlert from "../../components/CustomAlert";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

// Legal Educator Models
const LEGAL_MODELS: LegalModel[] = [
  {
    id: "1",
    name: "Professor Clarissa Wright",
    avatar: "👩‍⚖️",
    specialty: "Constitutional Law",
    personality: "Patient, methodical, and encouraging",
    description:
      "An experienced constitutional law professor with 15 years of teaching experience. Specializes in breaking down complex constitutional principles into digestible concepts for students.",
    tags: ["Constitutional", "Beginner-Friendly", "Patient", "Theory"],
    experience: "15+ years teaching constitutional law",
    approach:
      "Uses real-world examples and case studies to illustrate abstract concepts",
  },
  {
    id: "2",
    name: "Attorney Marcus Chen",
    avatar: "👨‍💼",
    specialty: "Criminal Law & Procedure",
    personality: "Dynamic, practical, and engaging",
    description:
      "A former prosecutor turned educator who brings courtroom experience to the classroom. Expert in criminal law, evidence, and trial procedures.",
    tags: ["Criminal Law", "Practical", "Evidence", "Trial", "Engaging"],
    experience: "10 years prosecuting, 8 years teaching",
    approach:
      "Interactive learning with mock scenarios and real case analysis",
  },
  {
    id: "3",
    name: "Judge Elena Rodriguez",
    avatar: "⚖️",
    specialty: "Civil Rights & Ethics",
    personality: "Thoughtful, ethical, and inspiring",
    description:
      "A retired federal judge passionate about civil rights and legal ethics. Known for her Socratic teaching method and emphasis on moral reasoning.",
    tags: ["Civil Rights", "Ethics", "Philosophy", "Advanced", "Socratic"],
    experience: "20 years on the bench, 5 years teaching",
    approach:
      "Question-driven dialogue encouraging critical thinking and ethical analysis",
  },
];

// Get all unique tags from models
const ALL_TAGS = Array.from(
  new Set(LEGAL_MODELS.flatMap((model) => model.tags))
).sort();

export default function EducationModule() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  // Filter models based on search and tags
  const filteredModels = useMemo(() => {
    let filtered = LEGAL_MODELS;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.specialty.toLowerCase().includes(query) ||
          model.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((model) =>
        selectedTags.every((tag) => model.tags.includes(tag))
      );
    }

    return filtered;
  }, [searchQuery, selectedTags]);

  const handleStartLearning = async (model: LegalModel) => {
    // Show confirmation alert first
    setAlertConfig({
      visible: true,
      title: model.name,
      message: `Specialty: ${model.specialty}\n\n${model.description}\n\nPersonality: ${model.personality}\n\nExperience: ${model.experience}\n\nApproach: ${model.approach}\n\nTags: ${model.tags.join(", ")}\n\nStart learning with this educator?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start Learning", 
          style: "default",
          onPress: () => startLearningSession(model)
        }
      ],
    });
  };

  const startLearningSession = async (model: LegalModel) => {
    try {
      setIsLoading(true);
      
      // Small delay before navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to learning session
      router.push({
        pathname: "/learning-session",
        params: { educator: JSON.stringify(model) },
      });
      
      // Keep loading visible during navigation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to start conversation. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  const handleContinueConversation = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      // Load session to get educator info
      const { chatStorageService } = await import("../../services/chatStorageService");
      const session = await chatStorageService.loadSession("teaching", sessionId);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      // Find the educator model
      const educator = LEGAL_MODELS.find(m => m.id === session.educatorId);
      
      if (!educator) {
        throw new Error("Educator not found");
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate with sessionId to continue conversation
      router.push({
        pathname: "/learning-session",
        params: { 
          educator: JSON.stringify(educator),
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
        message: "Failed to continue conversation. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StarsBackground />
      
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Legal Education Hub</Text>
          <Text style={styles.subtitle}>
            Learn from expert legal educators tailored to your learning style
          </Text>
        </View>

        {/* Search and Filters */}
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setSelectedTags}
          availableTags={ALL_TAGS}
        />

        {/* Models Section */}
        <View style={styles.modelsSection}>
          <Text style={styles.sectionTitle}>
            Available Educators ({filteredModels.length})
          </Text>

          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onStart={handleStartLearning}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No educators match your filters</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or clearing filters
              </Text>
            </View>
          )}
        </View>

        {/* Chat History */}
        <ChatHistory
          moduleType="teaching"
          onContinue={handleContinueConversation}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        message="Starting learning session..." 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(255, 107, 107, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    textAlign: "center",
    lineHeight: 22,
  },
  modelsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
    textShadowColor: "rgba(255, 107, 107, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
