import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NexusLogo from "../components/NexusLogo.jsx";
import { useAuthStore } from "../store/authStore.js";

const features = [
  {
    title: "AI-powered support",
    description:
      "Resolve queries instantly with our agent that understands your accounts, transactions and policies.",
  },
  {
    title: "Real-time voice assistant",
    description:
      "Speak naturally in Turkish — our voice agent handles balances, transfers and tickets hands-free.",
  },
  {
    title: "Bank-grade security",
    description:
      "JWT authentication, encrypted sessions and strict per-customer data isolation by default.",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, token } = useAuthStore();
  const [email, setEmail] = useState("ahmet@nexusbank.com");
  const [password, setPassword] = useState("demo1234");

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-ink-gradient text-white overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.7), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(84, 83, 240, 0.7), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.4] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10">
          <NexusLogo size={42} variant="onDark" />
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tightest leading-[1.05] text-balance">
            Banking, reimagined with an
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-fuchsia-300 to-amber-200">
              {" "}intelligent agent.
            </span>
          </h1>
          <p className="mt-5 text-white/70 text-base leading-relaxed text-pretty">
            Nexus Bank pairs a deeply personalized AI assistant with a modern
            banking experience. Ask anything — your balances, recent activity,
            loan eligibility or how to dispute a transaction.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-1 w-5 h-5 rounded-md bg-brand-500/15 border border-brand-400/30 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand-300"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {f.title}
                  </p>
                  <p className="text-sm text-white/55 leading-relaxed mt-0.5">
                    {f.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-2xs text-white/40">
          <span>© 2026 Nexus Bank • Portfolio demo</span>
          <span className="font-mono">v1.0</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-canvas relative">
        <div className="lg:hidden mb-8">
          <NexusLogo size={42} />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-ink-900 tracking-snug">
              Welcome back
            </h2>
            <p className="text-sm text-muted-strong mt-1.5">
              Sign in to your Nexus Bank account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <button
                  type="button"
                  className="text-2xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-danger-700 bg-danger-50 border border-danger-500/15 rounded-xl px-3 py-2.5 animate-fade-in">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
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
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-2xs uppercase tracking-wider text-muted-soft font-semibold">
              Or
            </span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button
            onClick={() => navigate("/voice")}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-line bg-white hover:bg-canvas-soft text-sm font-medium text-ink-800 py-2.5 transition-colors"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute w-5 h-5 rounded-full bg-brand-500/15 animate-pulse-ring" />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-600 relative"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </span>
            Connect to Voice Assistant
          </button>

          <div className="mt-8 rounded-xl bg-canvas-soft border border-line p-3">
            <p className="text-2xs uppercase tracking-wider text-muted-soft font-semibold mb-1.5">
              Demo credentials
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-strong">Email</span>
              <span className="font-mono text-ink-800">ahmet@nexusbank.com</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-strong">Password</span>
              <span className="font-mono text-ink-800">demo1234</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
