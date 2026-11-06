/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071B2B',
          900: '#0B263A',
          800: '#10334E',
          700: '#184467',
        },
        brand: {
          blue: '#1684AA',
          'blue-light': '#E7F2F9',
          'blue-dark': '#0E6280',
          green: '#009B4D',
          'green-light': '#E5F5EC',
          'green-hover': '#008542',
        },
        surface: {
          bg: '#F5F8FB',
          card: '#FFFFFF',
          border: '#DFE7EE',
        },
        slate: {
          primary: '#152338',
          secondary: '#64748B',
          muted: '#8A99AD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(7, 27, 43, 0.04), 0 1px 3px rgba(7, 27, 43, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(7, 27, 43, 0.08), 0 8px 10px -6px rgba(7, 27, 43, 0.04)',
        'pill': '0 4px 14px rgba(0, 155, 77, 0.35)',
      }
    },
  },
  plugins: [],
}

