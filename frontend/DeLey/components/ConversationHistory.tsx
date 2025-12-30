import React, { useEffect, useState } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "./CustomAlert";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

export interface Conversation {
  id: string;
  modelName: string;
  modelAvatar: string;
  startedAt: Date;
  lastMessage: string;
  messageCount: number;
}

interface ConversationHistoryProps {
  onContinue: (conversation: Conversation) => void;
  onDelete: (conversationId: string) => void;
  refreshTrigger?: number;
}

const STORAGE_KEY = "@education_conversations";

export default function ConversationHistory({
  onContinue,
  onDelete,
  refreshTrigger,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  const loadConversations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const conversations = parsed.map((conv: any) => ({
          ...conv,
          startedAt: new Date(conv.startedAt),
        }));
        setConversations(conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleDelete = (conversation: Conversation) => {
    setAlertConfig({
      visible: true,
      title: "Delete Conversation",
      message: `Are you sure you want to delete this conversation with ${conversation.modelName}?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = conversations.filter(
                (c) => c.id !== conversation.id
              );
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              setConversations(updated);
              onDelete(conversation.id);
            } catch (error) {
              console.error("Failed to delete conversation:", error);
            }
          },
        },
      ],
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>No conversation history yet</Text>
        <Text style={styles.emptySubtext}>
          Start a conversation with a legal educator to see it here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Conversation History</Text>
        <Text style={styles.count}>{conversations.length} total</Text>
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {conversations.map((conversation) => (
          <View key={conversation.id} style={styles.conversationCard}>
            <TouchableOpacity
              style={styles.conversationContent}
              onPress={() => onContinue(conversation)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{conversation.modelAvatar}</Text>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.modelName}>{conversation.modelName}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
                <View style={styles.metaContainer}>
                  <Text style={styles.messageCount}>
                    {conversation.messageCount} messages
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatDate(conversation.startedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(conversation)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(255, 107, 107, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  count: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    gap: 12,
  },
  conversationCard: {
    backgroundColor: "rgba(20, 20, 30, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.2)",
    flexDirection: "row",
    overflow: "hidden",
  },
  conversationContent: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageCount: {
    fontSize: 11,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 11,
    color: "#64748b",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyContainer: {
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
    lineHeight: 20,
  },
});

// Utility function to save a new conversation
export async function saveConversation(
  conversation: Omit<Conversation, "id">
): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const conversations = stored ? JSON.parse(stored) : [];
    
    const newConversation: Conversation = {
      ...conversation,
      id: Date.now().toString(),
    };
    
    conversations.unshift(newConversation);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    
    return newConversation.id;
  } catch (error) {
    console.error("Failed to save conversation:", error);
    throw error;
  }
}

// Utility function to update a conversation
export async function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const conversations = JSON.parse(stored);
    const index = conversations.findIndex((c: Conversation) => c.id === id);
    
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        ...updates,
        startedAt: conversations[index].startedAt, // Preserve original date
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  } catch (error) {
    console.error("Failed to update conversation:", error);
  }
}
