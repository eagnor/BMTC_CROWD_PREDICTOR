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
        navy: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#172033',
          700: '#1e293b',
          600: '#334155',
        },
        bmtc: {
          blue: '#2563eb',
          electric: '#38bdf8',
          accent: '#6366f1',
          gold: '#f59e0b',
          green: '#10b981',
          red: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
