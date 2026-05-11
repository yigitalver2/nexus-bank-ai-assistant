import { create } from "zustand";

export const useVoiceStore = create((set) => ({
  status: "idle", // idle | connecting | listening | speaking | processing | error
  transcript: [],
  error: null,

  setStatus: (status) => set({ status }),
  appendTranscript: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),
  reset: () => set({ status: "idle", transcript: [], error: null }),
}));
