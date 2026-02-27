/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Refined indigo-violet primary
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c4fb',
          300: '#a5a0f6',
          400: '#8b7cf0',
          500: '#7c5ce7',
          600: '#6c3dd1',
          700: '#5a2fb5',
          800: '#4a2793',
          900: '#3d2278',
        },
        // Warm amber accent
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Warm surface grays
        surface: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#ececea',
          300: '#d6d5d2',
          400: '#a8a7a3',
          500: '#78776f',
          600: '#57564f',
          700: '#3f3e39',
          800: '#292826',
          900: '#1c1b19',
        },
      },
      fontFamily: {
        sans: [
          '"LXGW WenKai Screen"',
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          '"LXGW WenKai Screen"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'monospace',
        ],
      },
      boxShadow: {
        'soft-xs': '0 1px 2px rgba(0,0,0,0.04)',
        'soft-sm': '0 2px 8px rgba(0,0,0,0.06)',
        'soft-md': '0 4px 16px rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 32px rgba(0,0,0,0.10)',
        'soft-xl': '0 16px 48px rgba(0,0,0,0.12)',
        'glow': '0 0 20px rgba(124,92,231,0.15)',
        'glow-lg': '0 0 40px rgba(124,92,231,0.20)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        'xs': '475px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
