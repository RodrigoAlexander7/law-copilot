import React, { useState } from "react";
import {
  View as RNView,
  Text as RNText,
  StyleSheet,
  ScrollView as RNScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import StarsBackground from "../../components/StarsBackground";
import ChatHistory from "../../components/ChatHistory";
import LoadingOverlay from "../../components/LoadingOverlay";
import CustomAlert from "../../components/CustomAlert";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;
const TextInput = RNTextInput as any;


export default function DebateModule() {
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

  // Configuration states
  const [debateTopic, setDebateTopic] = useState("");
  const [position, setPosition] = useState<"For" | "Against" | "Neutral">("For");
  const [aggressiveness, setAggressiveness] = useState(50);
  const [formality, setFormality] = useState(50);
  const [empathy, setEmpathy] = useState(50);
  const [humor, setHumor] = useState(20);
  const [voiceTone, setVoiceTone] = useState<string>("Professional");
  const [paceStyle, setPaceStyle] = useState<string>("Moderate");
  const [argumentStyle, setArgumentStyle] = useState<string>("Balanced");

  const voiceTones = [
    "Professional",
    "Conversational",
    "Academic",
    "Passionate",
    "Analytical",
  ];
  const paceStyles = ["Slow & Deliberate", "Moderate", "Fast & Dynamic"];
  const argumentStyles = [
    "Balanced",
    "Aggressive",
    "Socratic",
    "Evidence-Based",
    "Rhetorical",
  ];

  const handleStartDebate = () => {
    if (!debateTopic.trim()) {
      setAlertConfig({
        visible: true,
        title: "Missing Topic",
        message: "Please enter a debate topic.",
        buttons: [{ text: "OK", style: "default" }],
      });
      return;
    }

    // Show confirmation with all selected configurations
    const configSummary = `Topic: ${debateTopic}\n\nPosition: ${position}\nVoice Tone: ${voiceTone}\nPace: ${paceStyle}\nArgument Style: ${argumentStyle}\n\nAggressiveness: ${aggressiveness}%\nFormality: ${formality}%\nEmpathy: ${empathy}%\nHumor: ${humor}%\n\nStart this debate?`;

    setAlertConfig({
      visible: true,
      title: "Confirm Debate Configuration",
      message: configSummary,
      buttons: [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start Debate", 
          style: "default",
          onPress: () => startDebate()
        }
      ],
    });
  };

  const startDebate = async () => {
    const config = {
      id: `debate-${Date.now()}`,
      modelName: "Legal Debater",
      modelAvatar: "⚖️",
      topic: debateTopic,
      position,
      aggressiveness,
      formality,
      empathy,
      humor,
      voiceTone,
      paceStyle,
      argumentStyle,
      startedAt: new Date(),
      messageCount: 0,
    };

    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to debate chat
      router.push({
        pathname: "/debate-chat",
        params: { config: JSON.stringify(config) },
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to start debate. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  const handleContinueDebate = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      // Load session to get config
      const { chatStorageService } = await import("../../services/chatStorageService");
      const session = await chatStorageService.loadSession("simulation", sessionId);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      // Create config from session
      const config = {
        modelName: session.educatorName,
        modelAvatar: session.educatorAvatar,
        topic: "Debate",
        position: "For" as "For" | "Against" | "Neutral",
        aggressiveness: 50,
        formality: 50,
        empathy: 50,
        humor: 20,
        voiceTone: "Professional",
        paceStyle: "Moderate",
        argumentStyle: "Balanced",
      };
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate with sessionId
      router.push({
        pathname: "/debate-chat",
        params: { 
          config: JSON.stringify(config),
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
        message: "Failed to continue debate. Please try again.",
        buttons: [{ text: "OK", style: "default" }],
      });
    }
  };

  const renderSlider = (
    label: string,
    value: number,
    setValue: (val: number) => void,
    leftLabel: string,
    rightLabel: string
  ) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}%</Text>
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderEndLabel}>{leftLabel}</Text>
        <Text style={styles.sliderEndLabel}>{rightLabel}</Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${value}%` }]} />
        <View style={styles.sliderThumbContainer}>
          {[0, 25, 50, 75, 100].map((pos) => (
            <TouchableOpacity
              key={pos}
              style={[
                styles.sliderThumb,
                Math.abs(value - pos) < 13 && styles.sliderThumbActive,
              ]}
              onPress={() => setValue(pos)}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderSelector = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (val: string) => void
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorOption,
              selected === option && styles.selectorOptionActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                selected === option && styles.selectorOptionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StarsBackground />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Legal Debate Arena</Text>
          <Text style={styles.subtitle}>
            Configure your debate and engage in dynamic legal arguments
          </Text>
        </View>

        {/* Topic Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Debate Topic</Text>
          <TextInput
            style={styles.topicInput}
            placeholder="Enter your debate topic..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={debateTopic}
            onChangeText={setDebateTopic}
            multiline
          />
        </View>

        {/* Position Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Your Position</Text>
          <View style={styles.positionContainer}>
            {(["For", "Against", "Neutral"] as const).map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.positionButton,
                  position === pos && styles.positionButtonActive,
                ]}
                onPress={() => setPosition(pos)}
              >
                <Text
                  style={[
                    styles.positionText,
                    position === pos && styles.positionTextActive,
                  ]}
                >
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice & Tone Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Voice & Tone</Text>
          {renderSelector("Voice Tone", voiceTones, voiceTone, setVoiceTone)}
          {renderSelector("Pace Style", paceStyles, paceStyle, setPaceStyle)}
        </View>

        {/* Personality Sliders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Personality Traits</Text>
          {renderSlider(
            "Aggressiveness",
            aggressiveness,
            setAggressiveness,
            "Gentle",
            "Forceful"
          )}
          {renderSlider(
            "Formality",
            formality,
            setFormality,
            "Casual",
            "Formal"
          )}
          {renderSlider("Empathy", empathy, setEmpathy, "Logical", "Emotional")}
          {renderSlider("Humor", humor, setHumor, "Serious", "Witty")}
        </View>

        {/* Argument Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚔️ Debate Style</Text>
          {renderSelector(
            "Argument Approach",
            argumentStyles,
            argumentStyle,
            setArgumentStyle
          )}
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartDebate}
          >
            <Text style={styles.startButtonText}>Start Debate 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Debate History */}
        <ChatHistory
          moduleType="simulation"
          onContinue={handleContinueDebate}
          refreshTrigger={refreshHistory}
        />
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isLoading} 
        message="Preparing debate arena..." 
      />

      {/* Custom Alert */}
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
    backgroundColor: "#0a0a0a",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
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
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    textShadowColor: "rgba(78, 205, 196, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  topicInput: {
    backgroundColor: "rgba(20, 25, 35, 0.8)",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.3)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  positionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  positionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(20, 25, 35, 0.6)",
    borderWidth: 2,
    borderColor: "rgba(78, 205, 196, 0.3)",
    alignItems: "center",
  },
  positionButtonActive: {
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    borderColor: "#4ecdc4",
  },
  positionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  positionTextActive: {
    color: "#4ecdc4",
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 15,
    color: "#4ecdc4",
    fontWeight: "700",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderEndLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  sliderTrack: {
    height: 40,
    backgroundColor: "rgba(20, 25, 35, 0.8)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.2)",
    overflow: "hidden",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(78, 205, 196, 0.3)",
    borderRadius: 20,
  },
  sliderThumbContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 8,
  },
  sliderThumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(78, 205, 196, 0.4)",
    borderWidth: 2,
    borderColor: "rgba(78, 205, 196, 0.6)",
  },
  sliderThumbActive: {
    backgroundColor: "#4ecdc4",
    borderColor: "#ffffff",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 10,
    fontWeight: "600",
  },
  selectorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(20, 25, 35, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.3)",
  },
  selectorOptionActive: {
    backgroundColor: "rgba(78, 205, 196, 0.25)",
    borderColor: "#4ecdc4",
  },
  selectorOptionText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },
  selectorOptionTextActive: {
    color: "#4ecdc4",
  },
  buttonContainer: {
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: "#4ecdc4",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
});
