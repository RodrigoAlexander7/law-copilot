/**
 * Unified Chat History Component
 * Displays saved conversations for teaching, simulation, and advisor modules
 */

import React, { useEffect, useState } from "react";
import {
  View as RNView,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";
import { chatStorageService } from "../services/chatStorageService";
import CustomAlert from "./CustomAlert";

const View = RNView as any;
const Text = RNText as any;
const ScrollView = RNScrollView as any;

interface ChatHistoryProps {
  moduleType: "teaching" | "simulation" | "advisor";
  onContinue: (sessionId: string) => void;
  refreshTrigger?: number;
}

export default function ChatHistory({
  moduleType,
  onContinue,
  refreshTrigger,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger, moduleType]);

  const loadSessions = async () => {
    try {
      const summaries = await chatStorageService.getSessionSummaries(moduleType);
      setSessions(summaries);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  const handleDelete = (session: any) => {
    setAlertConfig({
      visible: true,
      title: "Eliminar Conversación",
      message: `¿Estás seguro de que deseas eliminar esta conversación con ${session.educatorName}?`,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await chatStorageService.deleteSession(moduleType, session.id);
              await loadSessions();
            } catch (error) {
              console.error("Failed to delete session:", error);
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

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const getModuleIcon = () => {
    switch (moduleType) {
      case "teaching":
        return "📚";
      case "simulation":
        return "⚔️";
      case "advisor":
        return "⚖️";
    }
  };

  const getModuleTitle = () => {
    switch (moduleType) {
      case "teaching":
        return "Historial de Lecciones";
      case "simulation":
        return "Historial de Debates";
      case "advisor":
        return "Historial de Consultas";
    }
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{getModuleIcon()}</Text>
          <Text style={styles.emptyText}>
            No hay conversaciones guardadas
          </Text>
          <Text style={styles.emptySubtext}>
            Tus conversaciones aparecerán aquí
          </Text>
        </View>
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() =>
            setAlertConfig({ ...alertConfig, visible: false })
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {getModuleIcon()} {getModuleTitle()}
        </Text>
        <Text style={styles.count}>{sessions.length}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => onContinue(session.id)}
            activeOpacity={0.7}
          >
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionAvatar}>{session.educatorAvatar}</Text>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {session.educatorName}
                  </Text>
                  <Text style={styles.sessionPreview} numberOfLines={2}>
                    {session.lastMessage}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(session)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionFooter}>
              <Text style={styles.sessionDate}>
                {formatDate(new Date(session.lastMessageAt))}
              </Text>
              <Text style={styles.sessionMessages}>
                💬 {session.messageCount} mensajes
              </Text>
            </View>
          </TouchableOpacity>
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
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 107, 0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  count: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  sessionAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  sessionPreview: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  sessionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 107, 107, 0.1)",
  },
  sessionDate: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  sessionMessages: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
