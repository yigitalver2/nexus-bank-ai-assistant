export default function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start animate-fade-up">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 animate-ai-breathe flex-shrink-0" />
      <div className="px-3 py-2.5 rounded-[12px] rounded-tl-[2px]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-strong animate-dot-bounce"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-strong animate-dot-bounce"
            style={{ animationDelay: "0.16s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-strong animate-dot-bounce"
            style={{ animationDelay: "0.32s" }}
          />
        </div>
      </div>
    </div>
  );
}
