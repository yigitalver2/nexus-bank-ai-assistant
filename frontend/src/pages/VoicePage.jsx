import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NexusLogo from "../components/NexusLogo.jsx";
import { useVoiceStore } from "../store/voiceStore.js";
import { createPeerConnection, exchangeSDP, createDataChannel } from "../lib/webrtc.js";
import api from "../api/client.js";
import VoiceOrb from "../components/VoiceOrb.jsx";

const STATUS_LABELS = {
  idle:       "Bağlanıyor...",
  connecting: "Bağlanıyor...",
  listening:  "Dinleniyor",
  speaking:   "Konuşuyor",
  processing: "İşleniyor",
  verifying:  "Doğrulanıyor",
  error:      "Hata oluştu",
};

const STATUS_DOT = {
  listening:  "bg-green-400",
  speaking:   "bg-electric-500",
  processing: "bg-yellow-400",
  verifying:  "bg-yellow-400",
  error:      "bg-red-400",
};

export default function VoicePage() {
  const navigate = useNavigate();
  const {
    status, transcript, error,
    sessionId, peerConnection,
    setStatus, setError, setSessionData,
    setPeerConnection, setDataChannel,
    appendTranscript, reset,
  } = useVoiceStore();

  const assistantBuffer = useRef("");

  useEffect(() => {
    let pc;

    async function startSession() {
      try {
        setStatus("connecting");

        const { data } = await api.post("/api/voice/token");
        const { client_secret, session_id } = data;
        setSessionData(client_secret, session_id);

        pc = await createPeerConnection();
        setPeerConnection(pc);

        const dc = createDataChannel(pc);
        setDataChannel(dc);

        dc.onopen = () => setStatus("listening");

        dc.onmessage = (e) => {
          const event = JSON.parse(e.data);
          handleEvent(event, session_id, dc);
        };

        await exchangeSDP(pc, client_secret);
      } catch (err) {
        setError(err.message || "Bağlantı kurulamadı");
      }
    }

    startSession();

    return () => {
      if (pc) pc.close();
    };
  }, []);

  async function handleToolCall(output, sid, dc) {
    setStatus("processing");
    let result = "Tool execution failed.";

    try {
      const { data } = await api.post("/api/voice/tool", {
        tool_name: output.name,
        arguments: output.arguments,
        session_id: sid,
      });
      result = data.result;
    } catch {
      // result stays as fallback message
    }

    dc.send(JSON.stringify({
      type: "conversation.item.create",
      item: { type: "function_call_output", call_id: output.call_id, output: result },
    }));
    dc.send(JSON.stringify({ type: "response.create" }));
    setStatus("listening");
  }

  async function handleEvent(event, sid, dc) {
    if (event.type === "conversation.item.input_audio_transcription.completed") {
      const text = event.transcript?.trim();
      if (text) appendTranscript({ role: "user", content: text, id: crypto.randomUUID() });
    }

    if (event.type === "response.audio_transcript.delta") {
      assistantBuffer.current += event.delta;
      setStatus("speaking");
    }

    if (event.type === "response.audio_transcript.done") {
      if (assistantBuffer.current) {
        appendTranscript({ role: "assistant", content: assistantBuffer.current, id: crypto.randomUUID() });
        assistantBuffer.current = "";
      }
      setStatus("listening");
    }

    if (event.type === "response.done") {
      const outputs = event.response?.output ?? [];
      for (const output of outputs) {
        if (output.type === "function_call") await handleToolCall(output, sid, dc);
      }
    }
  }

  async function handleEndSession() {
    if (peerConnection) peerConnection.close();

    try {
      await api.post("/api/voice/end", {
        session_id: sessionId,
        transcript,
      });
    } catch {
      // best-effort — bağlantı kopmuş olsa bile navigate et
    }

    reset();
    navigate("/dashboard");
  }

  const dotColor = STATUS_DOT[status] ?? "bg-gray-400";

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-warm-100 relative overflow-hidden">
      {/* Arka plan ışıkları */}
      <div
        className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37, 99, 235, 0.55), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[620px] h-[620px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59, 116, 255, 0.5), transparent 70%)" }}
      />

      {/* Header */}
      <header
        className="relative z-10 h-14 px-6 flex items-center justify-between border-b border-ink-600"
        style={{ background: "rgba(8, 10, 15, 0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="btn-ghost" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </button>
          <span className="w-px h-5 bg-ink-600" />
          <NexusLogo size={26} withWordmark />
        </div>
        <div className="text-[11px] text-muted font-mono">gpt-4o-realtime</div>
      </header>

      {/* Ana içerik */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Orb */}
        <VoiceOrb status={status} onClick={handleEndSession} />

        {/* Durum etiketi */}
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium bg-ink-700 border border-ink-600 rounded-full px-3 py-1 text-muted-strong">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {STATUS_LABELS[status] ?? status}
          </span>
          {error && <p className="text-[12px] text-red-400">{error}</p>}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="w-full max-w-lg max-h-60 overflow-y-auto flex flex-col gap-2 px-1">
            {transcript.map((msg) => (
              <div
                key={msg.id}
                className={`text-[13px] leading-relaxed px-3 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-ink-700 text-warm-100 self-end max-w-[80%] text-right"
                    : "bg-electric-500/10 border border-electric-500/20 text-warm-100 self-start max-w-[85%]"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}

        <p className="text-[12px] text-muted text-center">
          Orb'a tıklayarak görüşmeyi bitirebilirsin
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 flex items-center justify-between text-[11px] text-muted">
        <span>© 2026 Nexus Bank</span>
        <span className="font-mono">Realtime API</span>
      </footer>
    </div>
  );
}
