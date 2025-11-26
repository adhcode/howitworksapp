/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1E3A5F',
          600: '#182E4C',
          700: '#122339',
          800: '#0C1726',
          900: '#060C13',
        },
        secondary: {
          DEFAULT: '#40B869',
          50: '#E8F7ED',
          100: '#D1EFDB',
          200: '#A3DFB7',
          300: '#75CF93',
          400: '#47BF6F',
          500: '#40B869',
          600: '#339354',
          700: '#266E3F',
          800: '#1A4A2A',
          900: '#0D2515',
        },
      },
    },
  },
  plugins: [],
}
