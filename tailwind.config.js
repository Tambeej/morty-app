/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0f172a', surface: '#1e293b', elevated: '#273549' },
        gold: { DEFAULT: '#f59e0b', light: '#fbbf24' },
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fontFamily: { sans: ['Inter', 'Rubik', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px', input: '8px' },
      boxShadow: { card: '0 4px 24px rgba(0,0,0,0.3)' },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'spin-fast': 'spin 0.6s linear infinite',
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-up': 'slideUp 250ms ease-out'
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
      }
    }
  },
  plugins: []
};
