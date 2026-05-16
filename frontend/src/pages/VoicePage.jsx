import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NexusLogo from "../components/NexusLogo.jsx";
import { useVoiceStore } from "../store/voiceStore.js";
import { createPeerConnection, exchangeSDP, createDataChannel } from "../lib/webrtc.js";
import { apiClient as api } from "../api/client.js";
import StatusLabel from "../components/StatusLabel.jsx";
import TranscriptPanel from "../components/TranscriptPanel.jsx";

function playPhoneRing(ctx) {
  const vol   = 0.028;
  const ringHz = 425;

  // İki çalış — ring-ring
  [0, 1.5].forEach((startOffset) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const lp  = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800; // uzakta duyulur etkisi

    osc.type = "sine";
    osc.frequency.value = ringHz;

    const t = ctx.currentTime + startOffset;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.04);
    env.gain.setValueAtTime(vol, t + 0.9);
    env.gain.linearRampToValueAtTime(0, t + 1);

    osc.connect(lp);
    lp.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1);
  });
}

function schedulePhoneRings(ctx, ambientRef) {
  const delay = 18000 + Math.random() * 22000; // 18–40 sn arası
  const timer = setTimeout(() => {
    if (!ambientRef.current) return;
    playPhoneRing(ctx);
    schedulePhoneRings(ctx, ambientRef);
  }, delay);
  ambientRef.current._ringTimer = timer;
}

function playDtmfClick(ctx) {
  const dtmfLow  = [697, 770, 852, 941];
  const dtmfHigh = [1209, 1336, 1477];
  const f1 = dtmfLow[Math.floor(Math.random() * dtmfLow.length)];
  const f2 = dtmfHigh[Math.floor(Math.random() * dtmfHigh.length)];
  const dur = 0.09;
  const vol = 0.018 + Math.random() * 0.012;

  [f1, f2].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gn  = ctx.createGain();
    osc.frequency.value = freq;
    gn.gain.setValueAtTime(vol, ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gn);
    gn.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  });
}

function logoClass(status) {
  if (status === "connecting") return "logo-morph";
  if (status === "speaking")   return "logo-pulse";
  return "logo-breathe";
}

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
  const pcRef = useRef(null);
  const ambientRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pcRef.current) pcRef.current.close();
      stopAmbient();
    };
  }, []);

  // Ambient ses başlat — brown noise + telefon filtresi
  function startAmbient() {
    if (ambientRef.current) return;
    try {
      const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();

      // Brown noise buffer — 4 saniyelik, loop
      const sr  = ctx.sampleRate;
      const buf = ctx.createBuffer(2, sr * 4, sr);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.04 * w) / 1.04;
          data[i] = last * 4.5;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;

      const hipass = ctx.createBiquadFilter();
      hipass.type = "highpass";
      hipass.frequency.value = 250;

      const lopass = ctx.createBiquadFilter();
      lopass.type = "lowpass";
      lopass.frequency.value = 2200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.022, ctx.currentTime + 2.5);

      source.connect(hipass);
      hipass.connect(lopass);
      lopass.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      ambientRef.current = { ctx, source, gain };

      scheduleDtmfClicks(ctx);
      schedulePhoneRings(ctx, ambientRef);
    } catch {
      // Web Audio API desteklenmiyorsa sessizce geç
    }
  }

  function scheduleDtmfClicks(ctx) {
    const delay = 4000 + Math.random() * 9000; // 4–13 sn arası rastgele
    const timer = setTimeout(() => {
      if (!ambientRef.current) return;
      playDtmfClick(ctx);
      scheduleDtmfClicks(ctx);
    }, delay);
    ambientRef.current._clickTimer = timer;
  }


  function stopAmbient() {
    if (!ambientRef.current) return;
    const { ctx, source, gain, _clickTimer, _ringTimer } = ambientRef.current;
    clearTimeout(_clickTimer);
    clearTimeout(_ringTimer);
    try {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      source.stop(ctx.currentTime + 1.5);
      setTimeout(() => ctx.close(), 2000);
    } catch { /* ignore */ }
    ambientRef.current = null;
  }

  async function startSession() {
    try {
      setStatus("connecting");
      startAmbient();

      const { data } = await api.post("/api/voice/token");
      const { client_secret, session_id } = data;
      setSessionData(client_secret, session_id);

      const pc = await createPeerConnection();
      pcRef.current = pc;
      setPeerConnection(pc);

      const dc = createDataChannel(pc);
      setDataChannel(dc);

      dc.onopen = () => {
        setStatus("listening");
        dc.send(JSON.stringify({ type: "response.create" }));
      };

      dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        handleEvent(event, session_id, dc);
      };

      await exchangeSDP(pc, client_secret);
    } catch (err) {
      setError(err.message || "Bağlantı kurulamadı");
    }
  }

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
    stopAmbient();

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

      <style>{`
        @keyframes ring-expand {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ring-expand-fast {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes logo-morph-in {
          0%   { transform: scale(0.4) rotateY(90deg); opacity: 0; }
          60%  { transform: scale(1.08) rotateY(0deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg);   opacity: 1; }
        }
        @keyframes logo-breathe {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(59,116,255,0.4)); }
          50%       { filter: drop-shadow(0 0 22px rgba(59,116,255,0.9)); }
        }
        @keyframes logo-pulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(59,116,255,0.6)); transform: scale(1); }
          50%       { filter: drop-shadow(0 0 32px rgba(59,116,255,1));   transform: scale(1.04); }
        }
        .ring-slow-1 { animation: ring-expand 2.4s ease-out infinite; }
        .ring-slow-2 { animation: ring-expand 2.4s ease-out infinite 0.8s; }
        .ring-slow-3 { animation: ring-expand 2.4s ease-out infinite 1.6s; }
        .ring-fast-1 { animation: ring-expand-fast 1.2s ease-out infinite; }
        .ring-fast-2 { animation: ring-expand-fast 1.2s ease-out infinite 0.4s; }
        .ring-fast-3 { animation: ring-expand-fast 1.2s ease-out infinite 0.8s; }
        .logo-morph   { animation: logo-morph-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .logo-breathe { animation: logo-breathe 3s ease-in-out infinite; }
        .logo-pulse   { animation: logo-pulse 0.8s ease-in-out infinite; }
      `}</style>

      {/* Ana içerik */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-8">

        {status === "idle" && (
          <div className="flex flex-col items-center gap-6 animate-fade-up">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(59,116,255,0.28)",
                boxShadow: "0 0 48px rgba(37,99,235,0.2)",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(59,116,255,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="serif-hero text-[30px] leading-tight mb-2">Nexus Voice Assistant</h2>
              <p className="text-[13px] text-muted-strong max-w-[280px]">
                Hesaplarınız, işlemleriniz ve ürünlerimiz hakkında sesli sorular sorabilirsiniz.
              </p>
            </div>
            <button
              onClick={startSession}
              type="button"
              className="btn-primary px-8 text-[15px] font-semibold animate-btn-breathe"
              style={{ height: "52px", borderRadius: "14px" }}
            >
              Connect to Voice Assistant
            </button>
            <p className="text-[11px] text-muted">Mikrofon erişimi gereklidir</p>
          </div>
        )}

        {status === "idle" ? null : (
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={status === "connecting" ? undefined : handleEndSession}
              type="button"
              className="relative flex items-center justify-center w-48 h-48 rounded-none bg-transparent border-none"
              style={{ cursor: status === "connecting" ? "default" : "pointer" }}
              aria-label="Görüşmeyi bitir"
            >
              {/* Halkalar — speaking'de hızlı, diğerlerinde yavaş */}
              {status === "speaking" ? (
                <>
                  <span className="ring-fast-1 absolute inset-0 rounded-full border-2 border-electric-400/60" />
                  <span className="ring-fast-2 absolute inset-0 rounded-full border-2 border-electric-400/40" />
                  <span className="ring-fast-3 absolute inset-0 rounded-full border-2 border-electric-400/25" />
                </>
              ) : (
                <>
                  <span className="ring-slow-1 absolute inset-0 rounded-full border border-electric-500/40" />
                  <span className="ring-slow-2 absolute inset-0 rounded-full border border-electric-500/28" />
                  <span className="ring-slow-3 absolute inset-0 rounded-full border border-electric-500/16" />
                </>
              )}

              {/* Parlayan arka ışık */}
              <span
                className="absolute inset-8 rounded-full blur-3xl transition-all duration-500"
                style={{
                  background: status === "speaking"
                    ? "rgba(37,99,235,0.7)"
                    : "rgba(37,99,235,0.35)",
                }}
              />

              {/* N logosu */}
              <svg
                className={`relative ${logoClass(status)}`}
                width="100"
                height="100"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="1" y="1" width="46" height="46" rx="13"
                  fill="rgba(12,18,40,0.95)"
                  stroke="rgba(59,116,255,0.55)"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 34V14L34 34V14"
                  stroke="#3B74FF"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <StatusLabel status={status} error={error} />
            <TranscriptPanel transcript={transcript} />

            {status === "connecting" ? null : (
              <p className="text-[12px] text-muted text-center">
                Logoya tıklayarak görüşmeyi bitirebilirsin
              </p>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 flex items-center justify-between text-[11px] text-muted">
        <span>© 2026 Nexus Bank</span>
        <span className="font-mono">Realtime API</span>
      </footer>
    </div>
  );
}
