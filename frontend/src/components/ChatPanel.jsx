import { useEffect, useRef, useState } from "react";

import { useChatStore } from "../store/chatStore.js";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

const suggestions = [
  "Check my balance",
  "Recent transactions",
  "Report an issue",
];

function ChatToggleButton({ isOpen, onToggle, hasUnread }) {
  return (
    <button
      onClick={onToggle}
      className="group relative w-14 h-14 rounded-full bg-electric-500 hover:bg-electric-400 text-white flex items-center justify-center animate-btn-breathe transition-colors duration-60"
      aria-label={isOpen ? "Close chat" : "Ask Nexus AI"}
    >
      {isOpen ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {hasUnread && !isOpen && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger-500 border-2 border-ink-950" />
      )}
      {!isOpen && (
        <span className="pointer-events-none absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-60 whitespace-nowrap text-[12px] text-warm-100 bg-ink-700 border border-ink-600 px-2.5 py-1 rounded-md">
          Ask Nexus AI
        </span>
      )}
    </button>
  );
}

function ChatHeader({ onMinimize, onClose }) {
  return (
    <div className="h-[52px] flex-shrink-0 flex items-center justify-between px-4 bg-ink-950 border-b border-ink-600 rounded-t-[16px]">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 animate-ai-breathe" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-warm-100">
            Nexus AI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="w-7 h-7 rounded-md text-muted-strong hover:text-warm-100 hover:bg-ink-700 flex items-center justify-center transition-colors duration-60"
          aria-label="Minimize"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md text-muted-strong hover:text-warm-100 hover:bg-ink-700 flex items-center justify-center transition-colors duration-60"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SuggestionChip({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-[12px] px-3 py-1.5 rounded-full bg-ink-700 border border-ink-600 text-warm-200 hover:border-electric-500 hover:text-warm-100 transition-colors duration-60"
    >
      {text}
    </button>
  );
}

function EmptyState({ customerName, onPick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 animate-ai-breathe mb-4" />
      <p className="font-serif text-[18px] leading-snug text-warm-100">
        How can I help you today
        {customerName ? `, ${customerName}` : ""}?
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-5">
        {suggestions.map((s) => (
          <SuggestionChip key={s} text={s} onClick={() => onPick(s)} />
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ customerName, isOpen, onToggle }) {
  const { messages, sendMessage, loading } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, loading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="w-[380px] h-[520px] bg-ink-900 border border-ink-600 rounded-[16px] rounded-br-[4px] shadow-elevated-dark flex flex-col overflow-hidden animate-widget-in"
          role="dialog"
          aria-label="Nexus AI chat"
        >
          <ChatHeader onMinimize={onToggle} onClose={onToggle} />

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4"
          >
            {messages.length === 0 && !loading ? (
              <EmptyState
                customerName={customerName}
                onPick={(text) => sendMessage(text)}
              />
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {loading && <TypingIndicator />}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-[52px] flex-shrink-0 flex items-center gap-2 px-3 bg-ink-950 border-t border-ink-600"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-[13px] text-warm-100 placeholder:text-muted leading-relaxed py-2 max-h-[72px]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-electric-500 hover:bg-electric-400 disabled:bg-ink-600 disabled:text-muted text-white flex items-center justify-center transition-colors duration-60 flex-shrink-0"
              aria-label="Send"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}

      <ChatToggleButton isOpen={isOpen} onToggle={onToggle} hasUnread={false} />
    </div>
  );
}
