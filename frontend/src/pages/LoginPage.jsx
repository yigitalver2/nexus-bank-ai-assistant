import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NexusLogo from "../components/NexusLogo.jsx";
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
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center text-center mb-8">
          <NexusLogo size={36} />
          <span className="mt-3 text-[13px] uppercase tracking-wider2 text-muted font-medium">
            Nexus Bank
          </span>
        </div>

        <div className="mb-7">
          <h1 className="serif-hero text-[38px] leading-[1.05]">
            {getTimeGreeting()}
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Sign in to your account.
          </p>
        </div>

        <div
          className={`bg-ink-700 border border-ink-600 rounded-[16px] p-8 ${
            error ? "border-l-2 border-l-danger-500" : ""
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Email"
              className="field"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
              className="field"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            {error && (
              <div className="text-[13px] text-danger-500 pt-1 animate-fade-in">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onMouseEnter={() => setShowDemo(true)}
            onMouseLeave={() => setShowDemo(false)}
            onFocus={() => setShowDemo(true)}
            onBlur={() => setShowDemo(false)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-soft hover:text-muted transition-colors duration-60"
            aria-label="Show demo credentials"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {showDemo ? (
              <span className="font-mono">
                demo@nexusbank.com / demo1234
              </span>
            ) : (
              <span>Demo credentials</span>
            )}
          </button>
        </div>

        <div className="mt-10 text-center text-[11px] text-muted-soft">
          © 2026 Nexus Bank — Demo
        </div>
      </div>
    </div>
  );
}
