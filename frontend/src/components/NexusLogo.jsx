export default function NexusLogo({ size = 40, withWordmark = true, variant = "default" }) {
  const onDark = variant === "onDark";

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-sm"
        >
          <defs>
            <linearGradient id="nexus-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5453F0" />
              <stop offset="55%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
            <linearGradient id="nexus-shine" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#nexus-grad)" />
          <rect width="48" height="48" rx="12" fill="url(#nexus-shine)" />
          <path
            d="M14 34V14L34 34V14"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="14" r="1.8" fill="white" />
          <circle cx="34" cy="34" r="1.8" fill="white" />
        </svg>
      </div>
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-snug text-[15px] ${
              onDark ? "text-white" : "text-ink-900"
            }`}
          >
            Nexus<span className="text-brand-500">.</span>
          </span>
          <span
            className={`text-[9.5px] tracking-[0.18em] uppercase mt-1 font-medium ${
              onDark ? "text-white/60" : "text-muted-soft"
            }`}
          >
            AI Banking
          </span>
        </div>
      )}
    </div>
  );
}
