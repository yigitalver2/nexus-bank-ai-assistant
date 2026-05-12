import { useNavigate } from "react-router-dom";

import NexusLogo from "../components/NexusLogo.jsx";

export default function VoicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-warm-100 relative overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[620px] h-[620px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 116, 255, 0.5), transparent 70%)",
        }}
      />

      <header
        className="relative z-10 h-14 px-6 flex items-center justify-between border-b border-ink-600"
        style={{ background: "rgba(8, 10, 15, 0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ghost"
            type="button"
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
            Dashboard
          </button>
          <span className="w-px h-5 bg-ink-600" />
          <NexusLogo size={26} withWordmark />
        </div>
        <div className="text-[11px] text-muted font-mono">
          gpt-4o-realtime-preview
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative animate-orb-float">
          <span className="absolute inset-0 rounded-full bg-electric-500/25 blur-3xl scale-150" />
          <span className="absolute inset-0 rounded-full bg-electric-500/20 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-electric-500/20 animate-pulse-ring"
            style={{ animationDelay: "1s" }}
          />

          <button
            disabled
            className="relative w-40 h-40 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 text-white flex items-center justify-center disabled:cursor-not-allowed"
            type="button"
            aria-label="Voice assistant"
          >
            <span className="absolute inset-2 rounded-full border border-white/15" />
            <svg
              width="52"
              height="52"
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
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest2 font-medium bg-ink-700 border border-ink-600 rounded-full px-3 py-1 mb-4 text-muted-strong">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
            Coming in Phase 4
          </span>
          <h1 className="serif-hero text-[34px] leading-tight mb-3">
            Türkçe sesli asistan
          </h1>
          <p className="text-[13px] text-muted-strong leading-relaxed text-pretty">
            Real-time Turkish voice agent powered by OpenAI Realtime API. Speak
            naturally — ask for balances, recent transactions, or open a
            support ticket entirely hands-free.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
            type="button"
          >
            Back to Dashboard
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[10px] border border-ink-600 text-muted-strong text-[14px] font-medium cursor-not-allowed"
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-muted" />
            Notify me when available
          </button>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 flex items-center justify-between text-[11px] text-muted">
        <span>© 2026 Nexus Bank</span>
        <span className="font-mono">Realtime API</span>
      </footer>
    </div>
  );
}
