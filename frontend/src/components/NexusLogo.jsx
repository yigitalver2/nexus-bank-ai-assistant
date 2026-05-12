export default function NexusLogo({ size = 32, withWordmark = false }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="11"
          fill="#0D0F14"
          stroke="#1C1F27"
          strokeWidth="1"
        />
        <path
          d="M14 34V14L34 34V14"
          stroke="#2563EB"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className="font-sans font-semibold text-[15px] tracking-snug text-warm-100">
          Nexus
        </span>
      )}
    </div>
  );
}
