"use client";

import { useRef, useEffect } from "react";
import { Chat } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatContainerProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
}

export function ChatContainer({
  chat,
  onSendMessage,
  isLoading,
  onToggleSidebar,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-zinc-100">
            {chat?.title || "Nueva consulta"}
          </h1>
          <p className="text-xs text-zinc-500">
            Consulta sobre legislación peruana
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!chat || chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <span className="text-6xl mb-4 block">⚖️</span>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                DeLey Copilot
              </h2>
              <p className="text-zinc-400 mb-6">
                Tu asistente legal inteligente. Haz preguntas sobre la
                legislación peruana y obtén respuestas basadas en artículos
                reales.
              </p>
              <div className="grid gap-2 text-sm">
                <ExampleQuery
                  onSelect={onSendMessage}
                  query="¿Cuáles son mis derechos fundamentales según la Constitución?"
                />
                <ExampleQuery
                  onSelect={onSendMessage}
                  query="¿Qué protección tengo como consumidor si compro un producto defectuoso?"
                />
                <ExampleQuery
                  onSelect={onSendMessage}
                  query="¿Cómo se define la violencia familiar en la ley peruana?"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {chat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="py-6 bg-zinc-800/30">
                <div className="max-w-3xl mx-auto px-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      ⚖️
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-zinc-400 mb-2">
                        DeLey Copilot
                      </p>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                          <span
                            className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <span
                            className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-sm">
                          Analizando tu consulta...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder="Escribe tu consulta legal..."
      />
    </div>
  );
}

function ExampleQuery({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (q: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(query)}
      className="text-left px-4 py-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-colors text-zinc-300"
    >
      &quot;{query}&quot;
    </button>
  );
}
