/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/*/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#0c0d10',
          900: '#141519',
          850: '#1a1b22',
          800: '#22232c',
          750: '#2b2c37',
          700: '#353745',
          600: '#4c4e61',
          500: '#6d7087',
          400: '#9598b0',
          300: '#c2c4d6',
          200: '#e1e3ed',
          100: '#f1f2f8'
        },
        accent: {
          500: '#3b82f6',
          600: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.4)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
