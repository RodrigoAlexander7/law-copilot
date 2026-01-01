import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
  ImageBackground,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { transcribeAudio, queryRAG, textToSpeech } from "../services/audioService";
import { chatStorageService, ChatSession } from "../services/chatStorageService";

const { width, height } = Dimensions.get("window");

// Background images
const backgroundImages = {
  teaching: require("../assets/images/educationBackground.jpg"),
  simulation: require("../assets/images/debateBackground.jpg"),
  advisor: require("../assets/images/advisorBackground.jpg"),
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioBase64?: string;
}

interface VoiceChatProps {
  educatorName: string;
  educatorAvatar: string;
  educatorId: string;
  systemPrompt: string;
  initialGreeting: string;
  moduleType?: "teaching" | "simulation" | "advisor";
  sessionId?: string; // For loading existing conversations
}

export default function VoiceChat({
  educatorName,
  educatorAvatar,
  educatorId,
  systemPrompt,
  initialGreeting,
  moduleType = "teaching",
  sessionId,
}: VoiceChatProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEncoding, setIsEncoding] = useState(false);
  const [showHoldMessage, setShowHoldMessage] = useState(false);
  const [userTurn, setUserTurn] = useState(true);
  const [isRecordingReady, setIsRecordingReady] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const glowAnimation = useRef(new Animated.Value(0)).current;
  const holdMessageOpacity = useRef(new Animated.Value(0)).current;
  const voicePulseAnimation = useRef(new Animated.Value(1)).current;
  const pressTimeRef = useRef<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const audioPlayerRef = useRef<Audio.Sound | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with greeting or load existing session
  useEffect(() => {
    const initializeChat = async () => {
      if (sessionId) {
        // Load existing session
        const session = await chatStorageService.loadSession(moduleType, sessionId);
        if (session && session.messages.length > 0) {
          setMessages(session.messages);
          setCurrentSessionId(session.id);
          setUserTurn(true);
          return;
        }
      }
      
      // New session - show greeting
      const greeting: Message = {
        id: "greeting",
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setUserTurn(true);
    };
    
    initializeChat();
  }, [initialGreeting, sessionId, moduleType]);

  // Glow animation for user turn
  useEffect(() => {
    if (userTurn && !isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnimation.setValue(0);
    }
  }, [userTurn, isProcessing]);

  // Voice pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulseAnimation, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(voicePulseAnimation, {
            toValue: 0.9,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      voicePulseAnimation.setValue(1);
    }
  }, [isRecording]);

  // Save session whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const saveSession = async () => {
        try {
          const session: ChatSession = {
            id: currentSessionId,
            moduleType,
            educatorId,
            educatorName,
            educatorAvatar,
            messages: messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
            })),
            startedAt: new Date(messages[0].timestamp),
            lastMessageAt: new Date(messages[messages.length - 1].timestamp),
          };
          await chatStorageService.saveSession(session);
          console.log("✅ Chat guardado:", currentSessionId);
        } catch (error) {
          console.error("❌ Error guardando chat:", error);
        }
      };
      saveSession();
    }
  }, [messages, currentSessionId, moduleType, educatorId, educatorName, educatorAvatar]);

  // Request audio permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need microphone permissions to make this work!");
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      console.log("🎤 START RECORDING");
      pressTimeRef.current = Date.now();
      
      // Set visual state IMMEDIATELY
      setIsRecording(true);
      setIsRecordingReady(false);
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // Store in both state and ref for reliability
      recordingRef.current = newRecording;
      setRecording(newRecording);
      setIsRecordingReady(true);
      console.log("✅ Recording ready");
    } catch (err) {
      console.error("❌ Failed to start recording:", err);
      setIsRecording(false);
      setIsRecordingReady(false);
      recordingRef.current = null;
    }
  };

  const stopRecording = async () => {
    console.log("🛑 STOP RECORDING CALLED");
    const pressDuration = Date.now() - pressTimeRef.current;
    
    // Get recording from ref (more reliable than state)
    const currentRecording = recordingRef.current;
    
    // Always reset visual state
    setIsRecording(false);
    
    if (!currentRecording) {
      console.log("⚠️ No recording found - user released too quickly or recording failed");
      return;
    }

    // Check if it was just a quick tap (less than 500ms)
    if (pressDuration < 500) {
      console.log("⚡ Quick tap detected - showing hold message");
      setShowHoldMessage(true);
      Animated.sequence([
        Animated.timing(holdMessageOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(holdMessageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowHoldMessage(false));

      // Cleanup recording
      try {
        await currentRecording.stopAndUnloadAsync();
      } catch (err) {
        console.error("❌ Error stopping quick tap:", err);
      } finally {
        recordingRef.current = null;
        setRecording(null);
        setIsRecordingReady(false);
      }
      return;
    }

    // Valid recording - process it
    try {
      setIsEncoding(true);
      
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      // Clear references immediately
      recordingRef.current = null;
      setRecording(null);
      setIsRecordingReady(false);
      
      if (uri) {
        console.log("✅ Recording saved, processing...");
        await processAudio(uri);
      } else {
        console.error("❌ No URI from recording");
        setIsEncoding(false);
      }
      
      setIsEncoding(false);
    } catch (err) {
      console.error("❌ Failed to stop recording:", err);
      recordingRef.current = null;
      setRecording(null);
      setIsRecordingReady(false);
      setIsEncoding(false);
    }
  };

  const processAudio = async (audioUri: string) => {
    setIsProcessing(true);
    setUserTurn(false);

    try {
      // Step 1: Convert audio to base64
      const audioBase64 = await convertAudioToBase64(audioUri);
      
      // Step 2: Transcribe using STT service
      console.log("🎤 Step 1: Transcribing audio...");
      let transcription: string;
      try {
        transcription = await transcribeAudio(audioBase64);
        console.log("✅ Transcription:", transcription);
      } catch (error) {
        console.error("❌ STT Error:", error);
        alert("Error al transcribir el audio. Por favor, intenta de nuevo.");
        setIsProcessing(false);
        setUserTurn(true);
        return;
      }

      // Add user message with transcription
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: transcription,
        timestamp: new Date(),
        audioBase64,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Step 3: Query RAG service for legal response
      console.log(`📚 Step 2: Querying RAG service...`);
      let ragResponse;
      try {
        ragResponse = await queryRAG(transcription, 5, 0.3);
        console.log("✅ RAG Answer:", ragResponse.answer);
        console.log(`📖 Sources: ${ragResponse.total_sources_found}`);
      } catch (error) {
        console.error("❌ RAG Query Error:", error);
        alert("Error al consultar la base de conocimientos legal. Por favor, intenta de nuevo.");
        setIsProcessing(false);
        setUserTurn(true);
        return;
      }

      // Step 4: Convert response to speech
      console.log(`🔊 Step 3: Converting text to speech...`);
      let audioBase64Response: string;
      try {
        audioBase64Response = await textToSpeech(ragResponse.answer, moduleType);
        console.log("✅ TTS: Audio generated");
      } catch (error) {
        console.error("❌ TTS Error:", error);
        // Still show the text response even if TTS fails
        alert("Error al generar audio. Se mostrará solo la respuesta de texto.");
        audioBase64Response = "";
      }

      // Add assistant message with RAG answer
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: ragResponse.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Step 5: Play audio response if available
      if (audioBase64Response) {
        try {
          await playAudioResponse(audioBase64Response);
        } catch (error) {
          console.error("❌ Audio Playback Error:", error);
          alert("Error al reproducir el audio. La respuesta está visible en el chat.");
        }
      }
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("❌ Unexpected error processing audio:", error);
      alert("Ha ocurrido un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsProcessing(false);
      setUserTurn(true);
    }
  };

  const playAudioResponse = async (audioBase64: string) => {
    try {
      console.log("🔊 Playing audio response...");
      
      // Cleanup previous audio if exists
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.unloadAsync();
        audioPlayerRef.current = null;
      }

      // Create Sound from base64
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
        { shouldPlay: true }
      );
      
      audioPlayerRef.current = sound;

      // Cleanup after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log("✅ Audio playback finished");
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("❌ Error playing audio:", error);
    }
  };

  const convertAudioToBase64 = async (audioUri: string): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use fetch and FileReader
        const response = await fetch(audioUri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            console.log("✅ Audio converted (web)");
            console.log("📊 Size:", base64.length, "characters");
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Mobile: Use FileSystem
        const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
          encoding: "base64",
        });
        
        console.log("✅ Audio converted (mobile)");
        console.log("📊 Size:", base64Audio.length, "characters");
        
        return base64Audio;
      }
    } catch (error) {
      console.error("❌ Error converting audio:", error);
      throw error;
    }
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const glowColor = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 107, 107, 0.3)", "rgba(255, 107, 107, 0.8)"],
  });

  return (
    <ImageBackground
      source={backgroundImages[moduleType]}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          {/* Header */}
          <LinearGradient
            colors={["rgba(10, 10, 10, 0.95)", "rgba(10, 10, 10, 0.8)"]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.educatorInfo}>
              <Text style={styles.educatorAvatar}>{educatorAvatar}</Text>
              <View>
                <Text style={styles.educatorName}>{educatorName}</Text>
                <Text style={styles.educatorStatus}>
                  {isRecording 
                    ? "Recording..." 
                    : isEncoding 
                    ? "Encoding audio..." 
                    : isProcessing 
                    ? "Thinking..." 
                    : userTurn 
                    ? "Your turn" 
                    : "Speaking..."}
                </Text>
              </View>
            </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.role === "user" ? styles.userMessageWrapper : styles.assistantMessageWrapper,
            ]}
          >
            {message.role === "assistant" && (
              <Text style={styles.messageAvatar}>{educatorAvatar}</Text>
            )}
            <View style={{ flex: 1 }}>
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user" ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user" ? styles.userText : styles.assistantText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageTime,
                  message.role === "user" ? styles.userTime : styles.assistantTime,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <Text style={styles.processingText}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      {/* Hold Message */}
      {showHoldMessage && (
        <Animated.View
          style={[
            styles.holdMessageContainer,
            { opacity: holdMessageOpacity },
          ]}
        >
          <BlurView intensity={80} style={styles.holdMessageBlur}>
            <Text style={styles.holdMessageText}>Hold the mic to speak</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Microphone Button with Glow and Voice Animation */}
      <View style={[styles.micContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {userTurn && !isProcessing && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                backgroundColor: glowColor,
                transform: [
                  {
                    scale: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <Animated.View
          style={{
            transform: [{ scale: isRecording ? voicePulseAnimation : 1 }],
          }}
        >
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={!userTurn || isProcessing || isEncoding}
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
              (!userTurn || isProcessing || isEncoding) && styles.micButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.micIcon}>
              {isRecording ? "🔴" : "🎤"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.micHint}>
          {isRecording
            ? "Recording..."
            : isEncoding
            ? "Encoding audio..."
            : isProcessing
            ? "Processing..."
            : "Hold to speak"}
        </Text>
      </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.75)",
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.85)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 107, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 32,
    color: "#ffffff",
  },
  educatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  educatorAvatar: {
    fontSize: 48,
    marginRight: 12,
  },
  educatorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  educatorStatus: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: "80%",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
  },
  assistantMessageWrapper: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  messageAvatar: {
    fontSize: 32,
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: "#ff6b6b",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#ffffff",
  },
  assistantText: {
    color: "#e2e8f0",
  },
  messageTime: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.7,
    marginTop: 2,
  },
  userTime: {
    color: "#ffffff",
    textAlign: "right",
    marginRight: 4,
  },
  assistantTime: {
    color: "#94a3b8",
    textAlign: "left",
    marginLeft: 4,
  },
  processingIndicator: {
    alignSelf: "flex-start",
    marginLeft: 52,
    marginTop: -10,
  },
  processingText: {
    fontSize: 24,
    color: "#ff6b6b",
    letterSpacing: 4,
  },
  holdMessageContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -25 }],
    width: 200,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  holdMessageBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  holdMessageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  micContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingBottom: 50,
  },
  glowRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 15,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: "#dc2626",
  },
  micButtonDisabled: {
    backgroundColor: "#4b5563",
    opacity: 0.5,
  },
  micIcon: {
    fontSize: 36,
  },
  micHint: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
});
