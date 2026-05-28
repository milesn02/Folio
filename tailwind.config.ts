import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#081c0f',
          md: '#0a2513',
          lt: '#0f3519',
        },
        accent: {
          DEFAULT: '#c8a96e',
          lt: '#dfc99a',
          dk: '#a8863e',
        },
        surface: {
          DEFAULT: '#f2f3ef',
          lt: '#f8f9f6',
          dk: '#e8ebe4',
        },
        border: {
          DEFAULT: '#d4d8cf',
          dk: '#b8bdb3',
          lt: '#e4e8e0',
        },
        text: {
          DEFAULT: '#0e1a11',
          md: '#364039',
          lt: '#6a7a6d',
          xs: '#9aaa9d',
        },
        success: {
          DEFAULT: '#1a7a4a',
          bg: '#eaf5ef',
          border: '#9fcdb5',
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
        sans:  ['"DM Sans"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        xs:    ['11px', { lineHeight: '1.45' }],
        sm:    ['12px', { lineHeight: '1.5' }],
        base:  ['14px', { lineHeight: '1.55' }],
        md:    ['15px', { lineHeight: '1.5' }],
        lg:    ['16px', { lineHeight: '1.45' }],
        xl:    ['18px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['26px', { lineHeight: '1.25' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm:      '6px',
        DEFAULT: '10px',
        md:      '10px',
        lg:      '12px',
        xl:      '14px',
        '2xl':   '18px',
        '3xl':   '24px',
        full:    '9999px',
      },
      boxShadow: {
        xs:      '0 1px 2px rgba(8,28,15,.04)',
        sm:      '0 1px 3px rgba(8,28,15,.05), 0 2px 6px rgba(8,28,15,.06)',
        DEFAULT: '0 1px 4px rgba(8,28,15,.06), 0 4px 16px rgba(8,28,15,.08)',
        md:      '0 2px 8px rgba(8,28,15,.07), 0 8px 28px rgba(8,28,15,.10)',
        lg:      '0 4px 14px rgba(8,28,15,.09), 0 20px 48px rgba(8,28,15,.12)',
        xl:      '0 8px 24px rgba(8,28,15,.10), 0 32px 72px rgba(8,28,15,.14)',
        'inner':       'inset 0 1px 3px rgba(8,28,15,.07)',
        'glow-accent': '0 0 0 3px rgba(200,169,110,.18)',
        'glow-sm':     '0 0 12px rgba(200,169,110,.25)',
        none:    'none',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'snap-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'enter': {
          from: { opacity: '0', transform: 'translateY(10px) scale(0.99)' },
          to:   { opacity: '1', transform: 'translateY(0)    scale(1)' },
        },
        'enter-fast': {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-up':   'slide-up 0.25s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fade-in 0.2s ease',
        'snap-in':    'snap-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        'enter':      'enter 0.28s cubic-bezier(0.16,1,0.3,1)',
        'enter-fast': 'enter-fast 0.18s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':    'shimmer 2s linear infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13':  '52px',
        '18':  '72px',
      },
    },
  },
  plugins: [],
} satisfies Config
