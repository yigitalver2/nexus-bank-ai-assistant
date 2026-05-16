import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore.js";

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good evening.";
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, token } = useAuthStore();
  const [email, setEmail] = useState("ahmet@nexusbank.com");
  const [password, setPassword] = useState("demo1234");
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/dashboard", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #111c3a 0%, #0e1730 35%, #0a1228 65%, #131f3e 100%)" }}
    >
      {/* Arka plan ışıkları */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,116,255,0.45), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[580px] h-[580px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.4), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] blur-3xl rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.18), transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-up">

        {/* Logo + built by */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4" style={{ perspective: "400px" }}>
            {/* Arka ışık halosu */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: "rgba(37,99,235,0.35)" }}
            />
            <svg
              width="72"
              height="72"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: "nexus-flip 2.5s linear infinite", position: "relative" }}
            >
              <rect x="1" y="1" width="46" height="46" rx="13"
                fill="#0f1629"
                stroke="rgba(59,116,255,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M14 34V14L34 34V14"
                stroke="#3B74FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <style>{`
            @keyframes nexus-flip {
              0%   { transform: rotateY(0deg); }
              100% { transform: rotateY(360deg); }
            }
          `}</style>

          <span className="text-[13px] uppercase tracking-widest2 text-warm-200 font-semibold">
            Nexus Bank
          </span>

          <div className="mt-3 flex flex-col items-center gap-1">
            <span className="text-[17px] font-semibold text-warm-100">
              Built by{" "}
              <a
                href="http://yigitalver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-400 hover:text-electric-400/80 transition-colors duration-180"
              >
                Yiğit Alver
              </a>
            </span>
            <a
              href="http://yigitalver.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-strong hover:text-electric-400 transition-colors duration-180 underline underline-offset-2"
            >
              yigitalver.com
            </a>
          </div>
        </div>

        {/* Başlık */}
        <div className="mb-7 text-center">
          <h1 className="serif-hero text-[42px] leading-[1.05] tracking-snug">
            {getTimeGreeting()}
          </h1>
          <p className="mt-2.5 text-[13px] text-muted-strong">
            Sign in to your Nexus Bank account.
          </p>
        </div>

        {/* Form kartı */}
        <div
          className={`rounded-2xl p-7 transition-all duration-180 ${
            error ? "border-l-2 border-l-danger-500" : ""
          }`}
          style={{
            background: "rgba(17, 19, 24, 0.85)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] text-muted-strong uppercase tracking-wider2 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@nexusbank.com"
                className="field"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[11px] text-muted-strong uppercase tracking-wider2 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="field"
                style={{ fontFamily: "Verdana, sans-serif" }}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {error && (
              <div className="text-[12px] text-danger-500 pt-1 animate-fade-in flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onMouseEnter={() => setShowDemo(true)}
            onMouseLeave={() => setShowDemo(false)}
            onFocus={() => setShowDemo(true)}
            onBlur={() => setShowDemo(false)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-strong hover:text-warm-300 transition-colors duration-180 px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
            aria-label="Show demo credentials"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {showDemo ? (
              <span className="font-mono tracking-tight">ahmet@nexusbank.com · demo1234</span>
            ) : (
              <span>Demo credentials</span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-[11px] text-muted-strong space-y-0.5">
          <div>© 2026 Nexus Bank</div>
          <div className="opacity-60">Demo Environment</div>
        </div>

      </div>
    </div>
  );
}
