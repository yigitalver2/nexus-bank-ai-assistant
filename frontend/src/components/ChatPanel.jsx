import { useEffect, useRef, useState } from "react";

import { useChatStore } from "../store/chatStore.js";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const suggestions = [
  {
    text: "What are my account balances?",
    hint: "Account data",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <line x1="3" y1="11" x2="21" y2="11" />
      </>
    ),
  },
  {
    text: "Show me my last 5 transactions",
    hint: "Activity",
    icon: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
  },
  {
    text: "How can I block my card?",
    hint: "Knowledge base",
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
  {
    text: "Tell me about your credit card products",
    hint: "Products",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <line x1="2" y1="11" x2="22" y2="11" />
      </>
    ),
  },
];

function SuggestionCard({ s, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 text-left p-3.5 rounded-xl bg-white border border-line hover:border-brand-300 hover:shadow-soft transition-all duration-150"
    >
      <span className="w-9 h-9 rounded-lg bg-brand-gradient-soft border border-brand-200/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-600"
        >
          {s.icon}
        </svg>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-2xs uppercase tracking-[0.1em] text-muted-soft font-semibold mb-1">
          {s.hint}
        </span>
        <span className="block text-sm text-ink-900 font-medium leading-snug">
          {s.text}
        </span>
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-soft group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-3"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

function ChatHeader({ messageCount }) {
  return (
    <div className="flex-shrink-0 px-6 py-3 border-b border-line bg-white/60 backdrop-blur-sm flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-soft">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-500 border-2 border-white" />
        </div>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold text-ink-900">
            Nexus Assistant
          </h2>
          <p className="text-2xs text-muted-soft flex items-center gap-1.5">
            <span className="pulse-dot bg-success-500" />
            Online · GPT-4o
          </p>
        </div>
      </div>
      {messageCount > 0 && (
        <span className="text-2xs text-muted-soft number">
          {messageCount} {messageCount === 1 ? "message" : "messages"}
        </span>
      )}
    </div>
  );
}

export default function ChatPanel({ customerName }) {
  const { messages, sendMessage, loading } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-canvas">
      <ChatHeader messageCount={messages.length} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-2">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-3xl bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift flex items-center justify-center shadow-elevated">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tightest text-balance">
              Hi {customerName}, how can I help today?
            </h1>
            <p className="text-sm text-muted-strong mt-2 max-w-md text-pretty">
              Ask me anything about your accounts, transactions, loans, or
              Nexus Bank's products and policies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-8 w-full">
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.text}
                  s={s}
                  onClick={() => sendMessage(s.text)}
                />
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-6 pt-2 pb-5 bg-canvas">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl bg-white border border-line shadow-soft focus-within:border-brand-400 focus-within:shadow-focus transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your accounts or Nexus Bank..."
              rows={1}
              disabled={loading}
              className="w-full resize-none bg-transparent outline-none px-4 py-3.5 pr-14 text-sm leading-relaxed max-h-40 disabled:text-muted placeholder:text-muted-soft"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-lg bg-ink-900 hover:bg-ink-800 disabled:bg-line text-white disabled:text-muted flex items-center justify-center transition-colors"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-2xs text-muted-soft mt-2 text-center">
            Nexus Assistant may make mistakes. Verify important info with
            support. Press{" "}
            <kbd className="font-mono text-2xs bg-canvas-soft px-1 py-0.5 rounded border border-line">
              Enter
            </kbd>{" "}
            to send.
          </p>
        </form>
      </div>
    </div>
  );
}
