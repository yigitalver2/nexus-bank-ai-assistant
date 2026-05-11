import { useAccountStore } from "../store/accountStore.js";

const accountTypeMeta = {
  checking: {
    label: "Checking",
    icon: (
      <path d="M3 10h18M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    ),
  },
  savings: {
    label: "Savings",
    icon: (
      <>
        <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="M12 9v6M9 12h6" />
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
  credit_card: {
    label: "Credit Card",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <line x1="2" y1="11" x2="22" y2="11" />
      </>
    ),
  },
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatBalance = (balance) => numberFormatter.format(balance);

const formatIban = (iban) => {
  if (!iban) return "";
  return iban.replace(/(.{4})/g, "$1 ").trim();
};

function TotalBalanceCard({ accounts }) {
  const total = accounts.reduce(
    (sum, a) => (a.type === "credit_card" ? sum : sum + Number(a.balance)),
    0,
  );
  const currency = accounts[0]?.currency || "TRY";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink-gradient text-white p-5 shadow-elevated">
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #5453F0, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs uppercase tracking-[0.12em] text-white/55 font-semibold">
            Total balance
          </span>
          <span className="chip bg-white/10 text-white/80 border border-white/10">
            <span className="pulse-dot bg-success-500" />
            Active
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold tracking-tightest number">
            {formatBalance(total)}
          </span>
          <span className="text-sm text-white/60 font-medium">{currency}</span>
        </div>
        <p className="mt-1 text-2xs text-white/45">
          Across {accounts.filter((a) => a.type !== "credit_card").length} deposit accounts
        </p>
      </div>
    </div>
  );
}

function AccountIcon({ type }) {
  const meta = accountTypeMeta[type] || accountTypeMeta.checking;
  return (
    <div className="w-9 h-9 rounded-xl bg-brand-gradient-soft border border-brand-200/40 flex items-center justify-center flex-shrink-0">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-600"
      >
        {meta.icon}
      </svg>
    </div>
  );
}

function AccountCard({ account }) {
  const meta = accountTypeMeta[account.type] || accountTypeMeta.checking;
  const isNegative = Number(account.balance) < 0;
  return (
    <div className="group rounded-xl bg-white border border-line p-3 hover:border-brand-200 hover:shadow-soft transition-all duration-150">
      <div className="flex items-start gap-3">
        <AccountIcon type={account.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-medium text-muted-strong">
              {meta.label}
            </span>
            <span
              className={`chip ${
                account.status === "active"
                  ? "bg-success-50 text-success-700"
                  : "bg-canvas-soft text-muted-strong"
              }`}
            >
              {account.status || "active"}
            </span>
          </div>
          <div
            className={`text-base font-semibold number tracking-snug ${
              isNegative ? "text-danger-600" : "text-ink-900"
            }`}
          >
            {formatBalance(account.balance)}{" "}
            <span className="text-2xs text-muted font-medium">
              {account.currency}
            </span>
          </div>
          {account.iban && (
            <div className="text-2xs text-muted-soft font-mono mt-1 truncate">
              {formatIban(account.iban)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const isCredit = tx.type === "credit";
  return (
    <div className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-white transition-colors">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCredit
            ? "bg-success-50 text-success-600"
            : "bg-canvas-sunken text-muted-strong"
        }`}
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
        <div className="text-sm text-ink-900 truncate font-medium">
          {tx.description || tx.category || "Transaction"}
        </div>
        <div className="text-2xs text-muted-soft">{tx.date}</div>
      </div>
      <div
        className={`text-sm font-semibold number whitespace-nowrap ${
          isCredit ? "text-success-600" : "text-ink-900"
        }`}
      >
        {isCredit ? "+" : "−"}
        {numberFormatter.format(tx.amount)}
      </div>
    </div>
  );
}

function TicketRow({ ticket }) {
  const priorityStyles = {
    high: "bg-danger-50 text-danger-700",
    medium: "bg-warning-50 text-warning-600",
    low: "bg-canvas-soft text-muted-strong",
  };
  return (
    <div className="rounded-xl bg-white border border-line p-3 hover:border-brand-200 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`chip uppercase font-semibold ${
            priorityStyles[ticket.priority] || priorityStyles.low
          }`}
        >
          {ticket.priority}
        </span>
        <span className="text-2xs text-muted-soft">{ticket.date}</span>
      </div>
      <div className="text-sm text-ink-900 font-medium leading-snug line-clamp-2">
        {ticket.subject}
      </div>
      <div className="text-2xs text-muted-soft mt-1.5 capitalize flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            ticket.status === "in_progress"
              ? "bg-warning-500"
              : "bg-brand-500"
          }`}
        />
        {ticket.status?.replace("_", " ") || "open"}
      </div>
    </div>
  );
}

function Section({ title, count, children, action }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-2xs uppercase tracking-[0.12em] text-muted-strong font-semibold">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="text-2xs text-muted-soft bg-white border border-line px-1.5 rounded-full number">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-line p-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-canvas-soft animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-canvas-soft rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-canvas-soft rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AccountPanel() {
  const { accounts, transactions, tickets, loading, error } = useAccountStore();

  if (error) {
    return (
      <div className="p-5">
        <div className="rounded-xl bg-danger-50 border border-danger-500/15 text-danger-700 text-sm p-3">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-5">
      {loading ? (
        <>
          <div className="rounded-2xl bg-ink-gradient h-32 mb-5 animate-pulse" />
          <div className="space-y-2 mb-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          {accounts.length > 0 && <TotalBalanceCard accounts={accounts} />}

          <div className="mt-5">
            <Section title="Accounts" count={accounts.length}>
              <div className="space-y-2">
                {accounts.length === 0 ? (
                  <div className="text-sm text-muted py-3 px-1">
                    No active accounts.
                  </div>
                ) : (
                  accounts.map((acc) => (
                    <AccountCard key={acc.id} account={acc} />
                  ))
                )}
              </div>
            </Section>

            <Section title="Recent activity" count={transactions.length}>
              <div className="rounded-xl bg-white border border-line p-2">
                {transactions.length === 0 ? (
                  <div className="text-sm text-muted py-3 px-1">
                    No transactions yet.
                  </div>
                ) : (
                  transactions.slice(0, 6).map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))
                )}
              </div>
            </Section>

            {tickets.length > 0 && (
              <Section title="Open tickets" count={tickets.length}>
                <div className="space-y-2">
                  {tickets.map((t) => (
                    <TicketRow key={t.id} ticket={t} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
