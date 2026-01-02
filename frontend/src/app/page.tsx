"use client";

import { useState, useEffect, useCallback } from "react";
import { Chat, Message } from "@/lib/types";
import { queryLegal } from "@/lib/api";
import {
  getChats,
  saveChats,
  createChat,
  addMessageToChat,
  deleteChat as deleteChatFromStorage,
  generateId,
} from "@/lib/storage";
import { Sidebar } from "@/components/Sidebar";
import { ChatContainer } from "@/components/ChatContainer";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const storedChats = getChats();
    setChats(storedChats);
    
    // Select the most recent chat or create a new one
    if (storedChats.length > 0) {
      const sorted = [...storedChats].sort((a, b) => b.updatedAt - a.updatedAt);
      setCurrentChatId(sorted[0].id);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats);
    }
  }, [chats]);

  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  const handleNewChat = useCallback(() => {
    const newChat = createChat();
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const updated = deleteChatFromStorage(prev, chatId);
      saveChats(updated);
      return updated;
    });

    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Create a new chat if none exists
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = createChat();
        setChats((prev) => [newChat, ...prev]);
        chatId = newChat.id;
        setCurrentChatId(chatId);
      }

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setChats((prev) => addMessageToChat(prev, chatId!, userMessage));
      setIsLoading(true);

      try {
        // Call API
        const response = await queryLegal(content);

        // Add assistant message
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          rewriteInfo: response.rewrite_info,
          timestamp: Date.now(),
        };

        setChats((prev) => addMessageToChat(prev, chatId!, assistantMessage));
      } catch (error) {
        // Add error message
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.",
          timestamp: Date.now(),
        };

        setChats((prev) => addMessageToChat(prev, chatId!, errorMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId]
  );

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <ChatContainer
        chat={currentChat}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
