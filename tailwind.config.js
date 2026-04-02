/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          surface: '#1e293b',
          elevated: '#273549'
        },
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24'
        },
        border: '#334155'
      },
      fontFamily: {
        sans: ['Inter', 'Rubik', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '12px',
        input: '8px'
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.3)'
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 600ms linear infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
};
