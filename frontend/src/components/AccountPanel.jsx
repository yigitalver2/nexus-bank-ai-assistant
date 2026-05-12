import { useState } from "react";

import { useAccountStore } from "../store/accountStore.js";
import { useAuthStore } from "../store/authStore.js";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatBalance = (balance) => numberFormatter.format(balance);

const last4Iban = (iban) => {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  return `•••• ${clean.slice(-4)}`;
};

const accountTypeMeta = {
  checking: {
    label: "Checking",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  savings: {
    label: "Savings",
    icon: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.5 2c1 5 .5 7.5-1.5 10-1.39 1.74-2.5 5-2.5 8h-4z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </>
    ),
  },
  credit_card: {
    label: "Credit Card",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <line x1="2" y1="11" x2="22" y2="11" />
      </>
    ),
  },
  time_deposit: {
    label: "Time Deposit",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </>
    ),
  },
};

function AccountIcon({ type }) {
  const meta = accountTypeMeta[type] || accountTypeMeta.checking;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-strong"
    >
      {meta.icon}
    </svg>
  );
}

function AccountCard({ account }) {
  const meta = accountTypeMeta[account.type] || accountTypeMeta.checking;
  const isNegative = Number(account.balance) < 0;
  return (
    <div className="rounded-[12px] bg-ink-800 border border-ink-600 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AccountIcon type={account.type} />
          <span className="label-tiny">{meta.label}</span>
        </div>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            account.status === "active" ? "bg-success-500" : "bg-ink-600"
          }`}
        />
      </div>
      <div
        className={`text-[22px] font-semibold tracking-snug number ${
          isNegative ? "text-danger-500" : "text-warm-100"
        }`}
      >
        {formatBalance(account.balance)}
        <span className="text-[12px] text-muted ml-1.5 font-normal">
          {account.currency}
        </span>
      </div>
      {account.iban && (
        <div className="text-[11px] font-mono text-muted-soft mt-1.5">
          {last4Iban(account.iban)}
        </div>
      )}
    </div>
  );
}

function TotalBalanceCard({ accounts }) {
  const total = accounts.reduce(
    (sum, a) => (a.type === "credit_card" ? sum : sum + Number(a.balance)),
    0,
  );
  const currency = accounts[0]?.currency || "TRY";

  return (
    <div
      className="rounded-[12px] border border-ink-600 p-4"
      style={{
        background:
          "linear-gradient(135deg, #0F1829 0%, #091020 100%)",
      }}
    >
      <span className="label-tiny">Total Assets</span>
      <div className="mt-1.5 text-[28px] font-bold tracking-tightest number text-warm-100 leading-none">
        {formatBalance(total)}
        <span className="text-[13px] text-muted-strong ml-2 font-normal align-baseline">
          {currency}
        </span>
      </div>
      <div className="mt-2 text-[10px] text-muted">
        Excluding credit obligations
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const isCredit = tx.type === "credit";
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCredit ? "bg-success-500/10 text-success-500" : "bg-ink-700 text-muted-strong"
        }`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isCredit ? (
            <>
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </>
          ) : (
            <>
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </>
          )}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-warm-100 truncate">
          {tx.description || tx.category || "Transaction"}
        </div>
        <div className="text-[10px] text-muted">{tx.date}</div>
      </div>
      <div
        className={`text-[12px] font-medium number whitespace-nowrap ${
          isCredit ? "text-success-500" : "text-warm-200"
        }`}
      >
        {isCredit ? "+" : "−"}
        {numberFormatter.format(tx.amount)}
      </div>
    </div>
  );
}

function TicketRow({ ticket }) {
  return (
    <div className="rounded-[10px] bg-ink-800 border border-ink-600 p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-[10px] uppercase tracking-wider2 font-medium ${
            ticket.priority === "high"
              ? "text-danger-500"
              : ticket.priority === "medium"
              ? "text-warning-500"
              : "text-muted-strong"
          }`}
        >
          {ticket.priority}
        </span>
        <span className="text-[10px] text-muted">{ticket.date}</span>
      </div>
      <div className="text-[12px] text-warm-100 leading-snug line-clamp-2">
        {ticket.subject}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[12px] bg-ink-800 border border-ink-600 p-4">
      <div className="h-3 w-1/3 bg-ink-700 rounded animate-pulse mb-3" />
      <div className="h-6 w-2/3 bg-ink-700 rounded animate-pulse" />
    </div>
  );
}

export default function AccountPanel() {
  const { accounts, transactions, tickets, loading, error } = useAccountStore();
  const customer = useAuthStore((s) => s.customer);
  const [ticketsOpen, setTicketsOpen] = useState(false);

  const firstName = customer?.name?.split(" ")[0] || "there";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-5 pt-5 pb-4">
        <div className="label-tiny">Welcome back,</div>
        <div className="serif-hero text-[22px] mt-0.5 leading-none">
          {firstName}
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-500" />
          <span className="text-[11px] text-muted-strong">Active · Premium</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {error ? (
          <div className="rounded-[10px] bg-danger-500/10 border border-danger-500/30 text-danger-500 text-[12px] p-3">
            {error}
          </div>
        ) : loading ? (
          <div className="space-y-2.5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="label-tiny mb-2">Accounts</div>
            <div className="space-y-2">
              {accounts.length === 0 ? (
                <div className="text-[12px] text-muted py-3">
                  No active accounts.
                </div>
              ) : (
                accounts.map((acc) => (
                  <AccountCard key={acc.id} account={acc} />
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between mb-2">
              <span className="label-tiny">Recent Activity</span>
              <button className="text-[11px] text-muted-strong hover:text-warm-100 transition-colors duration-60">
                View all
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {transactions.length === 0 ? (
                <div className="text-[12px] text-muted py-2">
                  No transactions yet.
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))
              )}
            </div>

            {tickets.length > 0 && (
              <div className="mt-5">
                <button
                  onClick={() => setTicketsOpen((v) => !v)}
                  className="w-full flex items-center justify-between mb-2 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="label-tiny">Open tickets</span>
                    <span className="text-[10px] font-medium text-muted-strong bg-ink-700 border border-ink-600 px-1.5 py-0.5 rounded-full number">
                      {tickets.length}
                    </span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-muted-strong transition-transform duration-60 ${
                      ticketsOpen ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {ticketsOpen && (
                  <div className="space-y-2">
                    {tickets.map((t) => (
                      <TicketRow key={t.id} ticket={t} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!loading && accounts.length > 0 && (
        <div className="flex-shrink-0 px-5 pb-5">
          <TotalBalanceCard accounts={accounts} />
        </div>
      )}
    </div>
  );
}
