import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a3d1f',
          md: '#0d4825',
          lt: '#155c30',
        },
        accent: {
          DEFAULT: '#c8a96e',
          lt: '#e8d5a8',
        },
        surface: '#e6e8e3',
        border: {
          DEFAULT: '#cdd1c8',
          dk: '#b3b9ae',
        },
        text: {
          DEFAULT: '#0e1a11',
          md: '#3a4a3d',
          lt: '#6e7d70',
        },
        success: {
          DEFAULT: '#1a7a4a',
          bg: '#e8f5ee',
          border: '#a3d4b8',
        },
        danger: {
          DEFAULT: '#c0392b',
          bg: '#fcecea',
          border: '#f0a8a0',
        },
        info: {
          DEFAULT: '#1f4f8a',
          bg: '#e8eff8',
          border: '#a3c0df',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '7px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,30,53,.06), 0 2px 8px rgba(15,30,53,.07)',
        DEFAULT: '0 1px 3px rgba(15,30,53,.08), 0 4px 14px rgba(15,30,53,.10)',
        md: '0 2px 6px rgba(15,30,53,.10), 0 8px 24px rgba(15,30,53,.12)',
        lg: '0 4px 12px rgba(15,30,53,.14), 0 16px 40px rgba(15,30,53,.14)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'snap-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease',
        'fade-in': 'fade-in 0.15s ease',
        'snap-in': 'snap-in 0.18s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
