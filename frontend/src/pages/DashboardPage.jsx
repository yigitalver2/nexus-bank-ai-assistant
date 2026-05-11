import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AccountPanel from "../components/AccountPanel.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import NexusLogo from "../components/NexusLogo.jsx";
import { useAccountStore } from "../store/accountStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useChatStore } from "../store/chatStore.js";

function Avatar({ name }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "?";
  return (
    <div className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-semibold flex items-center justify-center shadow-soft ring-2 ring-white">
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { customer, logout } = useAuthStore();
  const fetchAll = useAccountStore((s) => s.fetchAll);
  const resetAccount = useAccountStore((s) => s.reset);
  const endSession = useChatStore((s) => s.endSession);
  const resetChat = useChatStore((s) => s.reset);

  useEffect(() => {
    if (customer?.customer_id) {
      fetchAll(customer.customer_id);
    }
  }, [customer?.customer_id, fetchAll]);

  const handleLogout = async () => {
    await endSession();
    resetAccount();
    logout();
    navigate("/login", { replace: true });
  };

  const firstName = customer?.name?.split(" ")[0] || "there";

  return (
    <div className="h-screen flex flex-col bg-canvas">
      <header className="flex-shrink-0 glass border-b border-line/80 px-5 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <NexusLogo size={34} />
          <nav className="hidden lg:flex items-center gap-1">
            <span className="text-sm font-medium text-ink-900 px-3 py-1.5 rounded-lg bg-canvas-soft">
              Assistant
            </span>
            <span className="text-sm font-medium text-muted px-3 py-1.5 rounded-lg cursor-not-allowed">
              Activity
            </span>
            <span className="text-sm font-medium text-muted px-3 py-1.5 rounded-lg cursor-not-allowed">
              Cards
            </span>
            <span className="text-sm font-medium text-muted px-3 py-1.5 rounded-lg cursor-not-allowed">
              Settings
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await endSession();
              resetChat();
            }}
            className="btn-ghost hidden sm:inline-flex"
            title="End and save the current conversation"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9" />
              <polyline points="3 4 3 12 11 12" />
            </svg>
            New chat
          </button>
          <button
            onClick={() => navigate("/voice")}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <span className="relative flex items-center justify-center w-4 h-4">
              <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse-ring" />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </span>
            Voice mode
          </button>

          <div className="w-px h-6 bg-line mx-1" />

          <div className="flex items-center gap-2.5 pr-1">
            <Avatar name={customer?.name} />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-ink-900">
                {customer?.name || ""}
              </span>
              <span className="text-2xs text-muted-soft">
                {customer?.email || ""}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 p-2 rounded-lg text-muted hover:text-danger-600 hover:bg-danger-50 transition-colors"
            title="Sign out"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] overflow-hidden gap-0">
        <aside className="border-r border-line bg-canvas-soft overflow-hidden hidden lg:flex flex-col">
          <AccountPanel />
        </aside>
        <section className="overflow-hidden bg-canvas">
          <ChatPanel customerName={firstName} />
        </section>
      </main>
    </div>
  );
}
