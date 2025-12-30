import React, { useState, useMemo } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import StarsBackground from "../../components/StarsBackground";
import SearchBar from "../../components/SearchBar";
import AdvisorCard, { LegalAdvisor } from "../../components/AdvisorCard";
import ConsultationHistory, {
  Consultation,
} from "../../components/ConsultationHistory";
import LoadingOverlay from "../../components/LoadingOverlay";

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

// Get all unique tags
const ALL_TAGS = Array.from(
  new Set(LEGAL_ADVISORS.flatMap((advisor) => advisor.tags))
).sort();

export default function AdvisorModule() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter advisors
  const filteredAdvisors = useMemo(() => {
    let filtered = LEGAL_ADVISORS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (advisor) =>
          advisor.name.toLowerCase().includes(query) ||
          advisor.title.toLowerCase().includes(query) ||
          advisor.specialties.some((s) => s.toLowerCase().includes(query)) ||
          advisor.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((advisor) =>
        selectedTags.every((tag) => advisor.tags.includes(tag))
      );
    }

    // Sort by rating (highest first)
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [searchQuery, selectedTags]);

  const handleAdvisorPress = async (advisor: LegalAdvisor) => {
    setIsLoading(true);
    
    // Pequeño delay antes de navegar
    await new Promise(resolve => setTimeout(resolve, 300));
    
    router.push({
      pathname: "/advisor-profile",
      params: { advisor: JSON.stringify(advisor) },
    });
    
    // Mantener loading visible hasta que la navegación se complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
  };

  const handleContinueConsultation = (consultation: Consultation) => {
    console.log("Continue consultation:", consultation);
  };

  const handleDeleteConsultation = (consultationId: string) => {
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
        >
          <LinearGradient
            colors={["rgba(251, 191, 36, 0.15)", "rgba(245, 158, 11, 0.05)"]}
            style={styles.header}
          >
            <Text style={styles.title}>AI Legal Advisory</Text>
            <Text style={styles.subtitle}>
              AI-powered legal advisors trained in various legal specialties
            </Text>
          </LinearGradient>
        </MotiView>

        {/* Search and Tags */}
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setSelectedTags}
          availableTags={ALL_TAGS}
        />

        {/* Advisors Section */}
        <View style={styles.advisorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              AI Advisors ({filteredAdvisors.length})
            </Text>
            {filteredAdvisors.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                Available 24/7
              </Text>
            )}
          </View>

          {filteredAdvisors.length > 0 ? (
            filteredAdvisors.map((advisor, index) => (
              <AdvisorCard
                key={advisor.id}
                advisor={advisor}
                onPress={handleAdvisorPress}
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
              <Text style={styles.emptyText}>No advisors match your filters</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or clearing filters
              </Text>
            </MotiView>
          )}
        </View>

        {/* Consultation History */}
        <ConsultationHistory
          onContinue={handleContinueConsultation}
          onDelete={handleDeleteConsultation}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        message="Connecting to advisor..." 
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
    paddingBottom: 20,
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
  advisorsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    textShadowColor: "rgba(251, 191, 36, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#fbbf24",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 56,
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
