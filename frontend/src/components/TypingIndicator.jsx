export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-up">
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
      <div className="rounded-2xl rounded-tl-md bg-white border border-line shadow-soft px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-dot-bounce"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-dot-bounce"
            style={{ animationDelay: "0.16s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-dot-bounce"
            style={{ animationDelay: "0.32s" }}
          />
        </div>
      </div>
    </div>
  );
}
