/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
      colors: {
        dyslexia: {
          bg: '#FDFBF7',         // Warm, glare-free background
          surface: '#FFFFFF',
          cream: '#FFF9EB',
          peach: '#FFE8D6',
          teal: '#2A9D8F',
          tealDark: '#1E7066',
          coral: '#E76F51',
          blue: '#457B9D',
          darkBlue: '#1D3557',
          mint: '#E8F5E9',
          yellow: '#F4A261'
        }
      }
    },
  },
  plugins: [],
};
