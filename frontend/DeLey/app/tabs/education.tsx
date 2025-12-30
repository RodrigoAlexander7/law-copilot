import React, { useState, useMemo } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import StarsBackground from "../../components/StarsBackground";
import SearchBar from "../../components/SearchBar";
import ModelCard, { LegalModel } from "../../components/ModelCard";
import ConversationHistory, {
  Conversation,
  saveConversation,
} from "../../components/ConversationHistory";
import LoadingOverlay from "../../components/LoadingOverlay";

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
    try {
      setIsLoading(true);
      
      // Save conversation to local storage
      const conversationId = await saveConversation({
        modelName: model.name,
        modelAvatar: model.avatar,
        startedAt: new Date(),
        lastMessage: `Started learning ${model.specialty}`,
        messageCount: 0,
      });

      // Refresh history
      setRefreshHistory((prev) => prev + 1);

      // Mantener loading visible un momento más
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setIsLoading(false);
      
      Alert.alert(
        "Session Started! 🎓",
        `You're now learning with ${model.name}. In a full implementation, this would open a chat interface.`,
        [{ text: "Got it!", style: "default" }]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to start conversation. Please try again.");
    }
  };

  const handleContinueConversation = (conversation: Conversation) => {
    Alert.alert(
      "Continue Learning",
      `Continuing conversation with ${conversation.modelName}. In a full implementation, this would open the chat interface with previous messages.`,
      [{ text: "Got it!", style: "default" }]
    );
  };

  const handleDeleteConversation = (conversationId: string) => {
    setRefreshHistory((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
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

        {/* Conversation History */}
        <ConversationHistory
          onContinue={handleContinueConversation}
          onDelete={handleDeleteConversation}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        message="Starting learning session..." 
      />
    </View>
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
