/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0084FF",
        "primary-light": "#E8F4FD",
        surface: "#F7F7F8",
        "agent-bubble": "#F0F0F0",
        "user-bubble": "#0084FF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        "agent-badge": "#3B82F6",
        "code-bg": "#1E1E1E",
        "code-text": "#D4D4D4",
      },
      fontFamily: {
        sans: ["Inter", "System"],
        mono: ["JetBrainsMono", "monospace"],
      },
      borderRadius: {
        bubble: "18px",
      },
    },
  },
  plugins: [],
};
