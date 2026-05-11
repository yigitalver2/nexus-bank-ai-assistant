/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0B0D12",
          800: "#11141B",
          700: "#1A1F2B",
          600: "#252B3A",
        },
        canvas: {
          DEFAULT: "#FAFBFC",
          soft: "#F4F6F8",
          sunken: "#EEF1F4",
        },
        line: {
          DEFAULT: "#E6E8EC",
          strong: "#D4D8DE",
          subtle: "#F1F3F5",
        },
        brand: {
          50: "#EEF0FF",
          100: "#DDE1FF",
          200: "#BCC2FF",
          300: "#9097FF",
          400: "#6E70FB",
          500: "#5453F0",
          600: "#3F3CDB",
          700: "#332EB3",
          800: "#2A2790",
          900: "#211F6F",
        },
        success: {
          50: "#ECFDF5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        danger: {
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        muted: {
          DEFAULT: "#6B7280",
          soft: "#9CA3AF",
          strong: "#4B5563",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        snug: "-0.015em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 13, 18, 0.04), 0 1px 3px rgba(11, 13, 18, 0.06)",
        card: "0 2px 4px rgba(11, 13, 18, 0.03), 0 4px 16px rgba(11, 13, 18, 0.04)",
        elevated:
          "0 4px 8px rgba(11, 13, 18, 0.04), 0 8px 32px rgba(11, 13, 18, 0.08)",
        focus: "0 0 0 3px rgba(84, 83, 240, 0.15)",
        glow: "0 0 0 1px rgba(84, 83, 240, 0.2), 0 8px 32px rgba(84, 83, 240, 0.2)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #5453F0 0%, #7C3AED 50%, #C026D3 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(84, 83, 240, 0.08) 0%, rgba(124, 58, 237, 0.06) 100%)",
        "ink-gradient":
          "linear-gradient(180deg, #0B0D12 0%, #1A1F2B 100%)",
        "radial-fade":
          "radial-gradient(circle at 50% 0%, rgba(84, 83, 240, 0.12) 0%, transparent 50%)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "orb-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "fade-up": "fade-up 0.35s ease-out",
        "dot-bounce": "dot-bounce 1.4s infinite ease-in-out both",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orb-float": "orb-float 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
    },
  },
  plugins: [],
};
