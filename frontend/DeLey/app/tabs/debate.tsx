import React, { useState, useMemo } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import StarsBackground from "../../components/StarsBackground";
import SearchBar from "../../components/SearchBar";
import DebateModelCard, { DebateModel } from "../../components/DebateModelCard";
import DebateHistory, { DebateConfig } from "../../components/DebateHistory";
import LoadingOverlay from "../../components/LoadingOverlay";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

// Debate Models - No presets, user configures each
const DEBATE_MODELS: DebateModel[] = [
  {
    id: "1",
    name: "The Prosecutor",
    avatar: "⚔️",
    category: "Criminal Law Specialist",
    description:
      "A seasoned prosecutor skilled in building compelling arguments and cross-examination. Masters the art of evidence presentation and logical deconstruction.",
    tags: ["Criminal", "Aggressive", "Evidence-Based", "Strategic"],
    difficulty: "Advanced",
    focus: "Prosecution strategies and case building",
  },
  {
    id: "2",
    name: "The Defense Attorney",
    avatar: "🛡️",
    category: "Civil Rights Defender",
    description:
      "An eloquent defense attorney known for finding holes in arguments and protecting individual rights. Expert in constitutional law and precedent analysis.",
    tags: ["Defense", "Analytical", "Constitutional", "Protective"],
    difficulty: "Intermediate",
    focus: "Defense tactics and rights protection",
  },
  {
    id: "3",
    name: "The Judge",
    avatar: "⚖️",
    category: "Neutral Arbitrator",
    description:
      "An impartial judicial mind that weighs all arguments fairly. Brings balance, objectivity, and deep knowledge of legal procedure to every debate.",
    tags: ["Neutral", "Balanced", "Procedural", "Fair"],
    difficulty: "Beginner",
    focus: "Balanced argumentation and legal reasoning",
  },
];

// Get all unique tags
const ALL_TAGS = Array.from(
  new Set(DEBATE_MODELS.flatMap((model) => model.tags))
).sort();

export default function DebateModule() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter models
  const filteredModels = useMemo(() => {
    let filtered = DEBATE_MODELS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.category.toLowerCase().includes(query) ||
          model.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((model) =>
        selectedTags.every((tag) => model.tags.includes(tag))
      );
    }

    return filtered;
  }, [searchQuery, selectedTags]);

  const handleModelPress = async (model: DebateModel) => {
    setIsLoading(true);
    
    // Pequeño delay antes de navegar
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Navigate to config screen with model data
    router.push({
      pathname: "/debate-config",
      params: { model: JSON.stringify(model) },
    });
    
    // Mantener loading visible hasta que la navegación se complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
  };

  const handleContinueDebate = (config: DebateConfig) => {
    // Would open debate interface
    console.log("Continue debate:", config);
  };

  const handleDeleteDebate = (configId: string) => {
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
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 800 }}
          style={styles.header}
        >
          <Text style={styles.title}>Legal Debate Arena</Text>
          <Text style={styles.subtitle}>
            Configure your opponent and engage in dynamic legal arguments
          </Text>
        </MotiView>

        {/* Search and Filters */}
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setSelectedTags}
          availableTags={ALL_TAGS}
        />

        {/* Models Section */}
        <View style={styles.modelsSection}>
          <Text style={styles.sectionTitle}>
            Available Opponents ({filteredModels.length})
          </Text>

          {filteredModels.length > 0 ? (
            filteredModels.map((model, index) => (
              <DebateModelCard
                key={model.id}
                model={model}
                onPress={handleModelPress}
                index={index}
              />
            ))
          ) : (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.emptyState}
            >
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No opponents match your filters</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or clearing filters
              </Text>
            </MotiView>
          )}
        </View>

        {/* Debate History */}
        <DebateHistory
          onContinue={handleContinueDebate}
          onDelete={handleDeleteDebate}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        message="Preparing debate arena..." 
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
    textShadowColor: "rgba(78, 205, 196, 0.5)",
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
    textShadowColor: "rgba(78, 205, 196, 0.3)",
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
