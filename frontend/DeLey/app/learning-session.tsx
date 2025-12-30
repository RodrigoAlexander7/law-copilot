import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";
import VoiceChat from "../components/VoiceChat";
import { getEducatorPrompt } from "../constants/educatorPrompts";
import LoadingOverlay from "../components/LoadingOverlay";

export default function LearningSession() {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = React.useState(true);

  // Parse educator data from params
  const educator = params.educator ? JSON.parse(params.educator as string) : null;
  
  useEffect(() => {
    // Simulate loading educator data and prompts
    const loadSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    
    loadSession();
  }, []);

  if (!educator) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingOverlay visible={true} message="Loading educator..." />
      </SafeAreaView>
    );
  }

  const educatorPrompt = getEducatorPrompt(educator.id);

  if (!educatorPrompt) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LoadingOverlay visible={true} message="Preparing lesson..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {isLoading ? (
        <LoadingOverlay visible={isLoading} message="Initializing session..." />
      ) : (
        <VoiceChat
          educatorName={educator.name}
          educatorAvatar={educator.avatar}
          educatorId={educator.id}
          systemPrompt={educatorPrompt.systemPrompt}
          initialGreeting={educatorPrompt.initialGreeting}
          moduleType="teaching"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
});
