import { Chat, Message } from "./types";

const STORAGE_KEY = "deleycopilot_chats";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getChats(): Chat[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving chats:", error);
  }
}

export function createChat(): Chat {
  const now = Date.now();
  return {
    id: generateId(),
    title: "Nueva consulta",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateChatTitle(chat: Chat): string {
  // Usar la primera pregunta del usuario como título
  const firstUserMessage = chat.messages.find((m) => m.role === "user");
  if (firstUserMessage) {
    const title = firstUserMessage.content.slice(0, 50);
    return title.length < firstUserMessage.content.length ? `${title}...` : title;
  }
  return "Nueva consulta";
}

export function addMessageToChat(
  chats: Chat[],
  chatId: string,
  message: Message
): Chat[] {
  return chats.map((chat) => {
    if (chat.id === chatId) {
      const updatedChat = {
        ...chat,
        messages: [...chat.messages, message],
        updatedAt: Date.now(),
      };
      // Actualizar título si es el primer mensaje del usuario
      if (message.role === "user" && chat.messages.length === 0) {
        updatedChat.title = updateChatTitle(updatedChat);
      }
      return updatedChat;
    }
    return chat;
  });
}

export function deleteChat(chats: Chat[], chatId: string): Chat[] {
  return chats.filter((chat) => chat.id !== chatId);
}

export function clearAllChats(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
