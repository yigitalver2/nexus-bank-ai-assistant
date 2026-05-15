import { create } from "zustand";

export const useVoiceStore = create((set) => ({
  status: "idle",       // idle | connecting | listening | speaking | processing | verifying | error
  transcript: [],
  error: null,

  sessionId: null,
  clientSecret: null,
  peerConnection: null,
  dataChannel: null,

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),

  setSessionData: (clientSecret, sessionId) =>
    set({ clientSecret, sessionId }),

  setPeerConnection: (pc) => set({ peerConnection: pc }),
  setDataChannel: (dc) => set({ dataChannel: dc }),

  appendTranscript: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),

  reset: () =>
    set({
      status: "idle",
      transcript: [],
      error: null,
      sessionId: null,
      clientSecret: null,
      peerConnection: null,
      dataChannel: null,
    }),
}));
