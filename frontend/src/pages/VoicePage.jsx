import { useNavigate } from "react-router-dom";

import NexusLogo from "../components/NexusLogo.jsx";

export default function VoicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-ink-gradient text-white relative overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.6), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(192, 38, 211, 0.5), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />

      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <NexusLogo size={36} variant="onDark" />
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to chat
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative animate-orb-float">
          <span className="absolute inset-0 rounded-full bg-brand-400/30 blur-3xl scale-150" />
          <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse-ring"
            style={{ animationDelay: "1s" }}
          />

          <button
            disabled
            className="relative w-44 h-44 rounded-full bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift text-white shadow-glow flex items-center justify-center disabled:cursor-not-allowed group"
          >
            <span className="absolute inset-1 rounded-full bg-black/10" />
            <span className="absolute inset-3 rounded-full border border-white/20" />
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>

        <div className="mt-12 text-center max-w-md">
          <span className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.16em] font-semibold bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
            <span className="pulse-dot bg-warning-500" />
            Coming in Phase 4
          </span>
          <h1 className="text-3xl font-bold tracking-tightest mb-3 text-balance">
            Türkçe sesli asistan
          </h1>
          <p className="text-sm text-white/65 leading-relaxed text-pretty">
            Real-time Turkish voice agent powered by OpenAI Realtime API.
            Speak naturally — ask for balances, recent transactions, or open a
            support ticket entirely hands-free.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-ink-900 hover:bg-white/90 text-sm font-semibold px-5 py-3 shadow-elevated transition-all"
          >
            Continue with chat
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 text-white/70 text-sm font-medium px-5 py-3 cursor-not-allowed"
          >
            <span className="pulse-dot bg-white/50" />
            Notify me when available
          </button>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 flex items-center justify-between text-2xs text-white/40">
        <span>© 2026 Nexus Bank</span>
        <span className="font-mono">Realtime API · gpt-4o-realtime-preview</span>
      </footer>
    </div>
  );
}
