import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AccountPanel from "../components/AccountPanel.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import NexusLogo from "../components/NexusLogo.jsx";
import { useAccountStore } from "../store/accountStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useChatStore } from "../store/chatStore.js";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatBalance = (n) => numberFormatter.format(n);

const navItems = [
  { key: "overview", label: "Overview" },
  { key: "accounts", label: "Accounts" },
  { key: "cards", label: "Cards" },
  { key: "transfers", label: "Transfers" },
];

function Avatar({ name }) {
  const initials =
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 text-white text-[12px] font-semibold flex items-center justify-center">
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon, tint = "default" }) {
  const tintClass =
    tint === "electric"
      ? "text-electric-500 bg-electric-500/10"
      : tint === "danger"
      ? "text-danger-500 bg-danger-500/10"
      : "text-muted-strong bg-ink-700";
  return (
    <div className="rounded-[12px] bg-ink-800 border border-ink-600 p-5">
      <div className="flex items-center justify-between">
        <span className="label-tiny">{label}</span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${tintClass}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-snug number text-warm-100 leading-none">
        {value}
      </div>
    </div>
  );
}

function TransactionsTable({ transactions, accountsById }) {
  if (transactions.length === 0) {
    return (
      <div className="text-[13px] text-muted py-6 text-center">
        No transactions yet.
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-[110px_1fr_140px_140px] px-4 py-2.5 border-b border-ink-600">
        <span className="label-tiny">Date</span>
        <span className="label-tiny">Description</span>
        <span className="label-tiny">Account</span>
        <span className="label-tiny text-right">Amount</span>
      </div>
      {transactions.slice(0, 8).map((tx) => {
        const isCredit = tx.type === "credit";
        const accountLabel = accountsById[tx.account_id]?.type || "—";
        return (
          <div
            key={tx.id}
            className="grid grid-cols-[110px_1fr_140px_140px] items-center px-4 py-3 border-b border-ink-600/60 hover:bg-ink-700 transition-colors duration-60"
          >
            <span className="text-[12px] text-muted-strong number">
              {tx.date}
            </span>
            <span className="text-[13px] text-warm-100 truncate">
              {tx.description || tx.category || "Transaction"}
            </span>
            <span className="text-[12px] text-muted-strong capitalize">
              {String(accountLabel).replace("_", " ")}
            </span>
            <span
              className={`text-[13px] font-medium number text-right whitespace-nowrap ${
                isCredit ? "text-success-500" : "text-warm-200"
              }`}
            >
              {isCredit ? "+" : "−"}
              {formatBalance(tx.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { customer, logout } = useAuthStore();
  const { accounts, transactions, tickets } = useAccountStore();
  const fetchAll = useAccountStore((s) => s.fetchAll);
  const resetAccount = useAccountStore((s) => s.reset);
  const endSession = useChatStore((s) => s.endSession);

  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const totalBalance = accounts.reduce(
    (sum, a) => (a.type === "credit_card" ? sum : sum + Number(a.balance)),
    0,
  );
  const currency = accounts[0]?.currency || "TRY";
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const openTickets = tickets.filter(
    (t) => t.status !== "closed" && t.status !== "resolved",
  ).length;
  const hasOpenTickets = openTickets > 0;

  const accountsById = accounts.reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-ink-950 text-warm-100">
      <header
        className="flex-shrink-0 h-14 px-6 flex items-center justify-between border-b border-ink-600 sticky top-0 z-30"
        style={{ background: "rgba(8, 10, 15, 0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-8">
          <NexusLogo size={28} withWordmark />
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, idx) => (
              <button
                key={item.key}
                type="button"
                className={idx === 0 ? "nav-link-active" : "nav-link cursor-default"}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/voice")}
            className="btn-ghost"
            title="Voice assistant"
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
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <span className="hidden lg:inline">Voice</span>
          </button>

          <button
            className="relative w-8 h-8 rounded-full text-muted-strong hover:text-warm-100 hover:bg-ink-700 flex items-center justify-center transition-colors duration-60"
            aria-label="Notifications"
            type="button"
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasOpenTickets && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 border-2 border-ink-950" />
            )}
          </button>

          <Avatar name={customer?.name} />

          <button
            onClick={handleLogout}
            className="ml-1 w-8 h-8 rounded-full text-muted-strong hover:text-danger-500 hover:bg-danger-500/10 flex items-center justify-center transition-colors duration-60"
            title="Sign out"
            type="button"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:flex w-[280px] flex-shrink-0 flex-col bg-ink-900 border-r border-ink-600 overflow-hidden">
          <AccountPanel />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-8 py-10">
            <div className="mb-8">
              <h1 className="serif-hero text-[32px] leading-tight">
                {(() => {
                  const h = new Date().getHours();
                  if (h < 12) return `Good morning, ${firstName}`;
                  if (h < 18) return `Good afternoon, ${firstName}`;
                  return `Good evening, ${firstName}`;
                })()}
              </h1>
              <p className="text-[14px] text-muted-strong mt-1.5">
                Here&apos;s what&apos;s happening with your accounts today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <StatCard
                label="Total Balance"
                value={`${formatBalance(totalBalance)} ${currency}`}
                tint="electric"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
              <StatCard
                label="Open Tickets"
                value={String(openTickets)}
                tint={hasOpenTickets ? "danger" : "default"}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />
              <StatCard
                label="Active Accounts"
                value={String(activeAccounts)}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6" width="18" height="13" rx="2" />
                    <line x1="3" y1="11" x2="21" y2="11" />
                  </svg>
                }
              />
            </div>

            <section className="rounded-[12px] bg-ink-800 border border-ink-600 overflow-hidden mb-8">
              <div className="px-4 py-3 border-b border-ink-600 flex items-center justify-between">
                <h2 className="text-[14px] font-medium text-warm-100">
                  Recent Transactions
                </h2>
                <span className="text-[11px] text-muted">
                  Showing latest {Math.min(transactions.length, 8)}
                </span>
              </div>
              <TransactionsTable
                transactions={transactions}
                accountsById={accountsById}
              />
            </section>

            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full text-left rounded-[12px] bg-electric-500/10 border border-electric-500/30 hover:bg-electric-500/15 hover:border-electric-500/50 px-5 py-4 flex items-center justify-between transition-colors duration-60"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 animate-ai-breathe flex-shrink-0" />
                <div>
                  <div className="text-[14px] font-medium text-warm-100">
                    Your AI assistant is ready
                  </div>
                  <div className="text-[12px] text-muted-strong mt-0.5">
                    Ask me anything about your accounts, transactions, or
                    products.
                  </div>
                </div>
              </div>
              <span className="text-electric-500 text-[14px]">→</span>
            </button>
          </div>
        </main>
      </div>

      <ChatPanel
        customerName={firstName}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
      />
    </div>
  );
}
