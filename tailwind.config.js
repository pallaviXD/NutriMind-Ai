/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        muted: '#a1a1aa',
        panel: '#18181b',
        border: '#27272a',
        accent: {
          neon: '#0ea5e9',     // Cyan/Blue
          purple: '#8b5cf6',   // Purple
          cyan: '#06b6d4',     // Cyan
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.2), inset 0 0 5px rgba(139, 92, 246, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 10px rgba(139, 92, 246, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
