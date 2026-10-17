/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F2F7F4',
          100: '#E1ECE5',
          200: '#C3D9CC',
          500: '#1B5E48',
          600: '#124B38', // Deep Forest Green Primary
          700: '#0D3A2C',
          800: '#092B21',
          900: '#062018',
        },
        gold: {
          50: '#FDFBF7',
          100: '#F9F4E8',
          200: '#F1E4C9',
          400: '#D8B868',
          500: '#C5A059', // Muted Gold Accent
          600: '#B08B42',
        },
        surface: '#FFFFFF',
        surfaceWarm: '#F5F1E8',
        background: '#FAF8F5', // Warm Ivory / Off-White
        border: '#E8E4DA',
        borderDark: '#D6D0C2',
        textMain: '#1C201D',   // Deep Charcoal
        textMuted: '#5F6B64',  // Muted Slate Charcoal
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(28, 32, 29, 0.04), 0 1px 2px 0 rgba(28, 32, 29, 0.02)',
        'card-hover': '0 12px 24px -6px rgba(28, 32, 29, 0.08), 0 4px 8px -4px rgba(28, 32, 29, 0.03)',
      }
    },
  },
  plugins: [],
}
