import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          tint: "var(--primary-tint)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          tint: "var(--accent-tint)",
        },
        text: "var(--text)",
        muted: "var(--muted)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",

        // Retain semantic status mapping
        status: {
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
        },
      },
      fontFamily: {
        head: ["var(--font-head)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)", // 6px
        md: "var(--radius-md)", // 10px
        lg: "var(--radius-lg)", // 16px
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
    },
  },
  plugins: [],
};

export default config;
