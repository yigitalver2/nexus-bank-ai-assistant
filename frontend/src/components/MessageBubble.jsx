const toolMeta = {
  search_knowledge_base: {
    label: "Knowledge base",
    icon: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  get_account_info: {
    label: "Account data",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <line x1="3" y1="11" x2="21" y2="11" />
      </>
    ),
  },
  get_transaction_history: {
    label: "Transactions",
    icon: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
  },
  get_loan_status: {
    label: "Loans",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8v8" />
      </>
    ),
  },
  create_support_ticket: {
    label: "Ticket created",
    icon: (
      <>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </>
    ),
  },
  escalate_to_human: {
    label: "Escalated",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </>
    ),
  },
};

function ToolChip({ tool }) {
  const meta = toolMeta[tool] || { label: tool, icon: null };
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs font-semibold px-2 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {meta.icon}
      </svg>
      {meta.label}
    </span>
  );
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-lg bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift flex items-center justify-center flex-shrink-0 shadow-soft ring-2 ring-white">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
      </svg>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const tools = message.toolsUsed || [];

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-ink-900 text-white px-4 py-2.5 shadow-soft">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-up">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 max-w-[80%]">
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tools.map((tool, idx) => (
              <ToolChip key={`${tool}-${idx}`} tool={tool} />
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl rounded-tl-md px-4 py-3 ${
            message.isError
              ? "bg-danger-50 text-danger-700 border border-danger-500/15"
              : "bg-white text-ink-900 border border-line shadow-soft"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
