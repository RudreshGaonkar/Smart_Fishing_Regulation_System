/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        clay: {
          bg: '#e0e5ec',
          light: '#ffffff',
          dark: '#a3b1c6'
        }
      },
      boxShadow: {
        'clay-sm': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'clay': '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'clay-lg': '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
        'clay-inset': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
        'clay-ocean': '8px 8px 16px #0369a1, -8px -8px 16px #38bdf8',
      },
    },
  },
  plugins: [],
}
