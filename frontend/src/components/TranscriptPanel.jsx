import { useEffect, useRef } from "react";

export default function TranscriptPanel({ transcript }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (transcript.length === 0) return null;

  return (
    <div className="w-full max-w-lg max-h-60 overflow-y-auto flex flex-col gap-2 px-1">
      {transcript.map((msg) => (
        <div
          key={msg.id}
          className={`text-[13px] leading-relaxed px-3 py-2 rounded-lg ${
            msg.role === "user"
              ? "bg-ink-700 text-warm-100 self-end max-w-[80%] text-right"
              : "bg-electric-500/10 border border-electric-500/20 text-warm-100 self-start max-w-[85%]"
          }`}
        >
          {msg.content}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
