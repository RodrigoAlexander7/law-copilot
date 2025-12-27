import React, { useEffect, useState } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  ScrollView as RNScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

export interface DebateConfig {
  id?: string;
  modelName: string;
  modelAvatar: string;
  topic: string;
  position: "For" | "Against" | "Neutral";
  aggressiveness: number;
  formality: number;
  empathy: number;
  humor: number;
  voiceTone: string;
  paceStyle: string;
  argumentStyle: string;
  startedAt: Date;
  messageCount: number;
}

interface DebateHistoryProps {
  onContinue: (config: DebateConfig) => void;
  onDelete: (configId: string) => void;
  refreshTrigger?: number;
}

const STORAGE_KEY = "@debate_configs";

export default function DebateHistory({
  onContinue,
  onDelete,
  refreshTrigger,
}: DebateHistoryProps) {
  const [configs, setConfigs] = useState<DebateConfig[]>([]);

  useEffect(() => {
    loadConfigs();
  }, [refreshTrigger]);

  const loadConfigs = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const configs = parsed.map((config: any) => ({
          ...config,
          startedAt: new Date(config.startedAt),
        }));
        setConfigs(configs);
      }
    } catch (error) {
      console.error("Failed to load debate configs:", error);
    }
  };

  const handleDelete = (config: DebateConfig) => {
    Alert.alert(
      "Delete Debate",
      `Delete debate on "${config.topic}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = configs.filter((c) => c.id !== config.id);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              setConfigs(updated);
              onDelete(config.id!);
            } catch (error) {
              console.error("Failed to delete debate config:", error);
            }
          },
        },
      ]
    );
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

  const getPositionColor = (position: string) => {
    switch (position) {
      case "For":
        return "#4ade80";
      case "Against":
        return "#f87171";
      case "Neutral":
        return "#facc15";
      default:
        return "#94a3b8";
    }
  };

  if (configs.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring" }}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={styles.emptyText}>No debate history yet</Text>
        <Text style={styles.emptySubtext}>
          Configure a debate model to get started
        </Text>
      </MotiView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Debate History</Text>
        <Text style={styles.count}>{configs.length} debates</Text>
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {configs.map((config, index) => (
          <MotiView
            key={config.id}
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: "spring",
              delay: index * 100,
            }}
          >
            <View style={styles.debateCard}>
              <TouchableOpacity
                style={styles.debateContent}
                onPress={() => onContinue(config)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{config.modelAvatar}</Text>
                  <View
                    style={[
                      styles.positionIndicator,
                      { backgroundColor: getPositionColor(config.position) },
                    ]}
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.modelName} numberOfLines={1}>
                    {config.modelName}
                  </Text>
                  <Text style={styles.topic} numberOfLines={2}>
                    {config.topic}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Text
                        style={[
                          styles.positionText,
                          { color: getPositionColor(config.position) },
                        ]}
                      >
                        {config.position}
                      </Text>
                    </View>
                    <Text style={styles.voiceTone}>{config.voiceTone}</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.messageCount}>
                      {config.messageCount} exchanges
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatDate(config.startedAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(config)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        ))}
      </ScrollView>
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
    textShadowColor: "rgba(78, 205, 196, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  count: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  list: {
    maxHeight: 500,
  },
  listContent: {
    gap: 12,
  },
  debateCard: {
    backgroundColor: "rgba(20, 25, 35, 0.7)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.25)",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  debateContent: {
    flex: 1,
    flexDirection: "row",
    padding: 14,
  },
  avatarContainer: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(78, 205, 196, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(78, 205, 196, 0.3)",
  },
  avatar: {
    fontSize: 28,
  },
  positionIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0a0a0a",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modelName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  topic: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
  },
  positionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  voiceTone: {
    fontSize: 11,
    color: "#4ecdc4",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageCount: {
    fontSize: 11,
    color: "#94a3b8",
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
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyContainer: {
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
    lineHeight: 20,
  },
});

// Utility function to save a new debate config
export async function saveDebateConfig(
  config: Omit<DebateConfig, "id">
): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const configs = stored ? JSON.parse(stored) : [];

    const newConfig: DebateConfig = {
      ...config,
      id: Date.now().toString(),
    };

    configs.unshift(newConfig);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));

    return newConfig.id!;
  } catch (error) {
    console.error("Failed to save debate config:", error);
    throw error;
  }
}

// Utility function to update a debate config
export async function updateDebateConfig(
  id: string,
  updates: Partial<DebateConfig>
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const configs = JSON.parse(stored);
    const index = configs.findIndex((c: DebateConfig) => c.id === id);

    if (index !== -1) {
      configs[index] = {
        ...configs[index],
        ...updates,
        startedAt: configs[index].startedAt,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }
  } catch (error) {
    console.error("Failed to update debate config:", error);
  }
}
