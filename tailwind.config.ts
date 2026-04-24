/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sachiblue: {
          DEFAULT: '#2D7CFF',
          light: '#4FC3F7',
        },
        sachiblack: '#111827',
        sachigrey: '#222',
      },
      backgroundColor: {
        page: '#fff',
      },
    },
  },
  plugins: [],
};