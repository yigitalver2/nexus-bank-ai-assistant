import { useEffect, useRef } from "react";

const ANIMATION = {
  listening:  { speed: 1.2, amplitude: 0.04 },
  speaking:   { speed: 4.0, amplitude: 0.13 },
  processing: { speed: 2.5, amplitude: 0.07 },
  verifying:  { speed: 2.0, amplitude: 0.06 },
  connecting: { speed: 1.0, amplitude: 0.02 },
};

export default function VoiceOrb({ status, onClick }) {
  const btnRef = useRef(null);
  const rafRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const cfg = ANIMATION[status];

    function animate() {
      frameRef.current += 0.05;
      const el = btnRef.current;
      if (!el) return;

      const scale = cfg
        ? 1 + Math.abs(Math.sin(frameRef.current * cfg.speed)) * cfg.amplitude
        : 1;

      el.style.transform = `scale(${scale})`;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  return (
    <div className="relative animate-orb-float">
      <span className="absolute inset-0 rounded-full bg-electric-500/25 blur-3xl scale-150" />

      {status === "listening" && (
        <span className="absolute inset-0 rounded-full bg-electric-500/20 animate-pulse-ring" />
      )}

      {status === "speaking" && (
        <>
          <span className="absolute inset-0 rounded-full bg-electric-500/20 animate-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-electric-500/20 animate-pulse-ring"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      <button
        ref={btnRef}
        onClick={onClick}
        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 text-white flex items-center justify-center"
        style={{ transition: "none" }}
        type="button"
        aria-label="Görüşmeyi bitir"
        title="Görüşmeyi bitir"
      >
        <span className="absolute inset-2 rounded-full border border-white/15" />
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </div>
  );
}
