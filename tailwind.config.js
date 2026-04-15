/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system palette
        primary: '#1A3C5E',
        accent: '#00C896',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#F8FAFC',
        card: '#FFFFFF',
        text1: '#0F172A',
        text2: '#475569',
        text3: '#94A3B8',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'Rubik', 'system-ui', 'sans-serif'],
        hebrew: ['Rubik', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { fontWeight: '700', lineHeight: '1.2' }],
        'h2': ['24px', { fontWeight: '600', lineHeight: '1.3' }],
        'body': ['16px', { fontWeight: '400', lineHeight: '1.6' }],
        'small': ['13px', { fontWeight: '400', lineHeight: '1.5' }],
      },
      borderRadius: {
        'card': '16px',
        'btn': '8px',
        'input': '6px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,.08), 0 8px 32px rgba(26,60,94,.10)',
        'card-hover': '0 4px 12px rgba(0,0,0,.12), 0 16px 48px rgba(26,60,94,.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1A3C5E 0%, #0D6EFD 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1A3C5E 0%, #0D6EFD 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease forwards',
        'slide-in': 'slideIn 200ms ease forwards',
        'pulse-ring': 'pulseRing 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 200, 150, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 200, 150, 0)' },
        },
      },
    },
  },
  plugins: [],
};
