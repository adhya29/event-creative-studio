/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#650A08',
          dark: '#4A0706',
          light: '#821210',
          tint: '#F9ECEB'
        },
        cream: {
          DEFAULT: '#FFF8D1',
          light: '#FFFDF0',
          dark: '#F3E9B5'
        },
        electric: {
          DEFAULT: '#39FF88',
          hover: '#2AE875',
          dark: '#00B84D'
        },
        charcoal: {
          DEFAULT: '#4B4B4B',
          dark: '#2B2B2B',
          muted: '#6E6E6E'
        },
        lightgray: '#EFEFEF',
        offwhite: '#FAFAFA',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        editorial: ['"DM Serif Text"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'polaroid': '0 12px 35px -8px rgba(101, 10, 8, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'polaroid-lg': '0 20px 50px -10px rgba(101, 10, 8, 0.25), 0 8px 20px -4px rgba(0, 0, 0, 0.12)',
        'electric-glow': '0 0 25px rgba(57, 255, 136, 0.45)',
        'card-sharp': '4px 4px 0px #650A08',
      },
      rotate: {
        'tilt-left': '-3deg',
        'tilt-right': '2.5deg',
        'tilt-subtle': '-1.5deg'
      }
    },
  },
  plugins: [],
}
