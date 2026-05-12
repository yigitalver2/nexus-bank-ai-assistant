const toolMeta = {
  search_knowledge_base: { label: "Knowledge base" },
  get_account_info: { label: "Account data" },
  get_transaction_history: { label: "Transactions" },
  get_loan_status: { label: "Loans" },
  create_support_ticket: { label: "Ticket created" },
  escalate_to_human: { label: "Escalated" },
};

function ToolChip({ tool }) {
  const meta = toolMeta[tool] || { label: tool };
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1C2D4A] text-electric-400">
      <span className="w-1 h-1 rounded-full bg-electric-400" />
      {meta.label}
    </span>
  );
}

function AssistantAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 animate-ai-breathe flex-shrink-0" />
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const tools = message.toolsUsed || [];

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[80%] rounded-[12px] rounded-br-[2px] bg-ink-600 text-warm-100 px-3 py-2 text-[13px] leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start animate-fade-up">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 max-w-[85%]">
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tools.map((tool, idx) => (
              <ToolChip key={`${tool}-${idx}`} tool={tool} />
            ))}
          </div>
        )}
        <div
          className={`px-1 py-1 text-[13px] leading-relaxed ${
            message.isError ? "text-danger-500" : "text-[#C8CAD0]"
          }`}
        >
          <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
