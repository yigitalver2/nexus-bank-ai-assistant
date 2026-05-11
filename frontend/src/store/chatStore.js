import { create } from "zustand";

import { apiClient } from "../api/client.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  sessionId: null,
  loading: false,
  error: null,

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, userMessage],
      loading: true,
      error: null,
    }));

    try {
      const { data } = await apiClient.post("/api/chat", {
        message: trimmed,
        session_id: get().sessionId,
      });

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        toolsUsed: data.tools_used || [],
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        sessionId: data.session_id,
        loading: false,
      }));
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Could not reach the assistant. Please try again.";
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: msg,
            isError: true,
            timestamp: new Date().toISOString(),
          },
        ],
        loading: false,
        error: msg,
      }));
    }
  },

  endSession: async () => {
    const sid = get().sessionId;
    if (!sid) return;
    try {
      await apiClient.post("/api/chat/end", { session_id: sid });
    } catch (err) {
      // Best effort; we still clear local state
    }
    set({ messages: [], sessionId: null, error: null });
  },

  reset: () => set({ messages: [], sessionId: null, error: null }),
}));
