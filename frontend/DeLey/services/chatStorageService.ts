/**
 * Service for managing chat history storage across all modules
 * Handles saving, loading, and managing conversation histories
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioBase64?: string;
}

export interface ChatSession {
  id: string;
  moduleType: "teaching" | "simulation" | "advisor";
  educatorId: string;
  educatorName: string;
  educatorAvatar: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastMessageAt: Date;
}

const STORAGE_KEYS = {
  teaching: "@teaching_chat_sessions",
  simulation: "@simulation_chat_sessions",
  advisor: "@advisor_chat_sessions",
};

class ChatStorageService {
  /**
   * Save or update a chat session
   */
  async saveSession(session: ChatSession): Promise<void> {
    try {
      console.log("💾 Intentando guardar sesión:", session.id);
      const key = STORAGE_KEYS[session.moduleType];
      const stored = await AsyncStorage.getItem(key);
      let sessions: ChatSession[] = stored ? JSON.parse(stored) : [];

      console.log("📦 Sesiones existentes:", sessions.length);

      // Find existing session or add new one
      const existingIndex = sessions.findIndex((s) => s.id === session.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
        console.log("🔄 Actualizando sesión existente");
      } else {
        sessions.push(session);
        console.log("➕ Agregando nueva sesión");
      }

      // Sort by most recent first
      sessions.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );

      await AsyncStorage.setItem(key, JSON.stringify(sessions));
      console.log(`✅ Session saved: ${session.id} con ${session.messages.length} mensajes`);
    } catch (error) {
      console.error("❌ Error saving session:", error);
      throw error;
    }
  }

  /**
   * Load all sessions for a module type
   */
  async loadSessions(
    moduleType: "teaching" | "simulation" | "advisor"
  ): Promise<ChatSession[]> {
    try {
      const key = STORAGE_KEYS[moduleType];
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return [];

      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        startedAt: new Date(session.startedAt),
        lastMessageAt: new Date(session.lastMessageAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error("❌ Error loading sessions:", error);
      return [];
    }
  }

  /**
   * Load a specific session by ID
   */
  async loadSession(
    moduleType: "teaching" | "simulation" | "advisor",
    sessionId: string
  ): Promise<ChatSession | null> {
    try {
      const sessions = await this.loadSessions(moduleType);
      const session = sessions.find((s) => s.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("❌ Error loading session:", error);
      return null;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(
    moduleType: "teaching" | "simulation" | "advisor",
    sessionId: string
  ): Promise<void> {
    try {
      const key = STORAGE_KEYS[moduleType];
      const sessions = await this.loadSessions(moduleType);
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      console.log(`✅ Session deleted: ${sessionId}`);
    } catch (error) {
      console.error("❌ Error deleting session:", error);
      throw error;
    }
  }

  /**
   * Get session summary for history list
   */
  async getSessionSummaries(
    moduleType: "teaching" | "simulation" | "advisor"
  ): Promise<
    Array<{
      id: string;
      educatorName: string;
      educatorAvatar: string;
      lastMessage: string;
      messageCount: number;
      startedAt: Date;
      lastMessageAt: Date;
    }>
  > {
    try {
      const sessions = await this.loadSessions(moduleType);
      return sessions.map((session) => ({
        id: session.id,
        educatorName: session.educatorName,
        educatorAvatar: session.educatorAvatar,
        lastMessage:
          session.messages[session.messages.length - 1]?.content ||
          "No messages",
        messageCount: session.messages.length,
        startedAt: session.startedAt,
        lastMessageAt: session.lastMessageAt,
      }));
    } catch (error) {
      console.error("❌ Error getting summaries:", error);
      return [];
    }
  }

  /**
   * Clear all sessions for a module
   */
  async clearAllSessions(
    moduleType: "teaching" | "simulation" | "advisor"
  ): Promise<void> {
    try {
      const key = STORAGE_KEYS[moduleType];
      await AsyncStorage.removeItem(key);
      console.log(`✅ All ${moduleType} sessions cleared`);
    } catch (error) {
      console.error("❌ Error clearing sessions:", error);
      throw error;
    }
  }
}

export const chatStorageService = new ChatStorageService();
