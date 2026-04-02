/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          surface: '#1e293b',
          elevated: '#273549',
        },
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
        },
        border: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'Rubik', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
