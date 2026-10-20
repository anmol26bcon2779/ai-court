/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        court: {
          bg: '#0a0c10',
          darker: '#07090c',
          panel: '#11151c',
          surface: '#171c24',
          border: '#232b38',
          card: '#141922',
          gold: {
            DEFAULT: '#d4af37',
            light: '#f5d77f',
            dark: '#a8841a',
            glow: 'rgba(212, 175, 55, 0.25)',
          },
          prosecution: {
            DEFAULT: '#e11d48',
            light: '#f43f5e',
            dark: '#9f1239',
            glow: 'rgba(225, 29, 72, 0.3)',
          },
          defense: {
            DEFAULT: '#2563eb',
            light: '#3b82f6',
            dark: '#1e40af',
            glow: 'rgba(37, 99, 235, 0.3)',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            glow: 'rgba(6, 182, 212, 0.25)',
          },
          jury: {
            DEFAULT: '#9333ea',
            light: '#a855f7',
          }
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 0 25px rgba(212, 175, 55, 0.35)',
        'court-card': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
        'glow-red': '0 0 20px rgba(225, 29, 72, 0.35)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.35)',
      },
      animation: {
        'gavel-strike': 'strike 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        strike: {
          '0%': { transform: 'rotate(-45deg) translateY(-20px)' },
          '60%': { transform: 'rotate(5deg) translateY(0)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
