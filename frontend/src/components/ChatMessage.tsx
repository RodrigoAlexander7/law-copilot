"use client";

import { Message } from "@/lib/types";
import { SourceCard } from "./SourceCard";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`py-6 ${isUser ? "bg-transparent" : "bg-zinc-800/30"}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isUser
                ? "bg-blue-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {isUser ? "U" : "⚖️"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-400 mb-1">
              {isUser ? "Tú" : "DeLey Copilot"}
            </p>

            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Fuentes legales ({message.sources.length})
                </p>
                <div className="space-y-2">
                  {message.sources.map((source, index) => (
                    <SourceCard key={source.id} source={source} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite Info (debug) */}
            {message.rewriteInfo && (
              <details className="mt-4 text-xs">
                <summary className="text-zinc-500 cursor-pointer hover:text-zinc-400">
                  Ver análisis de búsqueda
                </summary>
                <div className="mt-2 p-3 bg-zinc-800 rounded-lg space-y-2">
                  {message.rewriteInfo.tema_legal && (
                    <p>
                      <span className="text-zinc-400">Tema:</span>{" "}
                      <span className="text-emerald-400">
                        {message.rewriteInfo.tema_legal}
                      </span>
                    </p>
                  )}
                  {message.rewriteInfo.conceptos_clave.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {message.rewriteInfo.conceptos_clave.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-zinc-700 rounded text-zinc-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {message.rewriteInfo.leyes_relevantes.length > 0 && (
                    <p className="text-zinc-400">
                      Leyes: {message.rewriteInfo.leyes_relevantes.join(", ")}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
