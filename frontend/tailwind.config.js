/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080A0F",
          900: "#0A0C11",
          800: "#0D0F14",
          700: "#111318",
          600: "#1C1F27",
        },
        warm: {
          100: "#F2EFE9",
          200: "#D8D5CE",
          300: "#A8A5A0",
        },
        electric: {
          400: "#3B74FF",
          500: "#2563EB",
          600: "#1D55D4",
          700: "#1A4AB8",
        },
        muted: {
          DEFAULT: "#4A4D56",
          soft: "#2A2D35",
          strong: "#8B8FA8",
        },
        success: {
          500: "#22C55E",
          600: "#16A34A",
        },
        danger: {
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: {
          500: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.95rem" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        snug: "-0.02em",
        wider2: "0.12em",
        widest2: "0.16em",
      },
      boxShadow: {
        "card-dark":
          "0 1px 0 0 rgba(255, 255, 255, 0.02) inset, 0 1px 2px rgba(0, 0, 0, 0.4)",
        "elevated-dark":
          "0 8px 24px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.03) inset",
        "focus-electric": "0 0 0 1px #2563EB",
        "chat-btn":
          "0 4px 20px rgba(37, 99, 235, 0.3)",
        "chat-btn-active":
          "0 4px 40px rgba(37, 99, 235, 0.5)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "widget-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "scale(0)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "ai-breathe": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 0 rgba(37, 99, 235, 0.5), 0 0 16px 2px rgba(37, 99, 235, 0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 4px rgba(37, 99, 235, 0.15), 0 0 24px 6px rgba(37, 99, 235, 0.45)",
          },
        },
        "btn-breathe": {
          "0%, 100%": { boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 4px 40px rgba(37, 99, 235, 0.5)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "orb-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "logo-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "fade-up": "fade-up 180ms ease-out",
        "widget-in": "widget-in 200ms ease-out",
        "dot-bounce": "dot-bounce 1.4s infinite ease-in-out both",
        "ai-breathe": "ai-breathe 4s ease-in-out infinite",
        "btn-breathe": "btn-breathe 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orb-float": "orb-float 4s ease-in-out infinite",
        "logo-spin": "logo-spin 10s linear infinite",
      },
      transitionDuration: {
        60: "60ms",
        180: "180ms",
      },
    },
  },
  plugins: [],
};
