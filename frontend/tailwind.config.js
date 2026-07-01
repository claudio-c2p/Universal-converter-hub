/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:     '#111111',
          accent:      '#E84E1B',
          accentHover: '#C93F0F',
          accentLight: '#FFF0EC',
          surface:     '#F8F8F8',
          border:      '#E5E5E5',
          muted:       '#6B6B6B',
        },
        status: {
          success: '#16A34A',
          error:   '#DC2626',
          warning: '#D97706',
          info:    '#2563EB',
        },
      },
      fontFamily: {
        sans: ["'Inter'", "'Segoe UI'", 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      borderRadius: {
        xl:    '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'scale-in': {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.25s ease-out',
        'fade-in':  'fade-in 0.2s ease-out',
        'fade-up':  'fade-up 0.45s ease-out both',
        'float':    'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
