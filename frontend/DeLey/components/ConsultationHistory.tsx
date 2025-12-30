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

export interface Consultation {
  id?: string;
  advisorId: string;
  advisorName: string;
  advisorAvatar: string;
  topic: string;
  category: string;
  status: "Active" | "Resolved" | "Pending";
  startedAt: Date;
  lastMessage: string;
  messageCount: number;
  priority: "Low" | "Medium" | "High";
}

interface ConsultationHistoryProps {
  onContinue: (consultation: Consultation) => void;
  onDelete: (consultationId: string) => void;
  refreshTrigger?: number;
}

const STORAGE_KEY = "@advisor_consultations";

export default function ConsultationHistory({
  onContinue,
  onDelete,
  refreshTrigger,
}: ConsultationHistoryProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
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
    loadConsultations();
  }, [refreshTrigger]);

  const loadConsultations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const consultations = parsed.map((cons: any) => ({
          ...cons,
          startedAt: new Date(cons.startedAt),
        }));
        setConsultations(consultations);
      }
    } catch (error) {
      console.error("Failed to load consultations:", error);
    }
  };

  const handleDelete = (consultation: Consultation) => {
    setAlertConfig({
      visible: true,
      title: "Delete Consultation",
      message: `Delete consultation about "${consultation.topic}"?`,
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = consultations.filter(
                (c) => c.id !== consultation.id
              );
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              setConsultations(updated);
              onDelete(consultation.id!);
            } catch (error) {
              console.error("Failed to delete consultation:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#10b981";
      case "Resolved":
        return "#6b7280";
      case "Pending":
        return "#f59e0b";
      default:
        return "#94a3b8";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#10b981";
      default:
        return "#94a3b8";
    }
  };

  if (consultations.length === 0) {
    return (
      <View
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>No consultations yet</Text>
        <Text style={styles.emptySubtext}>
          Start a consultation with a legal advisor to see it here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Consultation History</Text>
        <Text style={styles.count}>{consultations.length} total</Text>
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {consultations.map((consultation, index) => (
          <View
            key={consultation.id}
          >
            <View style={styles.consultationCard}>
              <TouchableOpacity
                style={styles.consultationContent}
                onPress={() => onContinue(consultation)}
                activeOpacity={0.7}
              >
                {/* Priority Indicator */}
                <View
                  style={[
                    styles.priorityBar,
                    { backgroundColor: getPriorityColor(consultation.priority) },
                  ]}
                />

                <View style={styles.contentMain}>
                  <View style={styles.topRow}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatar}>
                        {consultation.advisorAvatar}
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Text style={styles.advisorName} numberOfLines={1}>
                        {consultation.advisorName}
                      </Text>
                      <Text style={styles.category}>
                        {consultation.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(consultation.status) + "20",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(consultation.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(consultation.status) },
                        ]}
                      >
                        {consultation.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.topicSection}>
                    <Text style={styles.topicLabel}>Topic:</Text>
                    <Text style={styles.topic} numberOfLines={2}>
                      {consultation.topic}
                    </Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <View style={styles.metaInfo}>
                      <Text style={styles.messageCount}>
                        💬 {consultation.messageCount} messages
                      </Text>
                      <Text style={styles.timestamp}>
                        {formatDate(consultation.startedAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(consultation)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
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
    textShadowColor: "rgba(251, 191, 36, 0.5)",
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
    gap: 14,
  },
  consultationCard: {
    backgroundColor: "rgba(30, 30, 40, 0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.25)",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  priorityBar: {
    width: 4,
  },
  consultationContent: {
    flex: 1,
  },
  contentMain: {
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  avatar: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  advisorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  topicSection: {
    marginBottom: 10,
    paddingLeft: 56,
  },
  topicLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  topic: {
    fontSize: 13,
    color: "#e2e8f0",
    lineHeight: 18,
  },
  bottomRow: {
    paddingLeft: 56,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageCount: {
    fontSize: 11,
    color: "#fbbf24",
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
    backgroundColor: "rgba(239, 68, 68, 0.1)",
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

// Utility function to save a new consultation
export async function saveConsultation(
  consultation: Omit<Consultation, "id">
): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const consultations = stored ? JSON.parse(stored) : [];

    const newConsultation: Consultation = {
      ...consultation,
      id: Date.now().toString(),
    };

    consultations.unshift(newConsultation);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));

    return newConsultation.id!;
  } catch (error) {
    console.error("Failed to save consultation:", error);
    throw error;
  }
}

// Utility function to update a consultation
export async function updateConsultation(
  id: string,
  updates: Partial<Consultation>
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const consultations = JSON.parse(stored);
    const index = consultations.findIndex((c: Consultation) => c.id === id);

    if (index !== -1) {
      consultations[index] = {
        ...consultations[index],
        ...updates,
        startedAt: consultations[index].startedAt,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
    }
  } catch (error) {
    console.error("Failed to update consultation:", error);
  }
}
