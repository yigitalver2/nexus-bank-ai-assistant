const STATUS_LABELS = {
  idle:       "Bağlanıyor...",
  connecting: "Bağlanıyor...",
  listening:  "Dinleniyor",
  speaking:   "Konuşuyor",
  processing: "İşleniyor",
  verifying:  "Doğrulanıyor",
  error:      "Hata oluştu",
};

const STATUS_DOT = {
  listening:  "bg-green-400",
  speaking:   "bg-electric-500",
  processing: "bg-yellow-400",
  verifying:  "bg-yellow-400",
  error:      "bg-red-400",
};

export default function StatusLabel({ status, error }) {
  const dotColor = STATUS_DOT[status] ?? "bg-gray-400";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium bg-ink-700 border border-ink-600 rounded-full px-3 py-1 text-muted-strong">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
