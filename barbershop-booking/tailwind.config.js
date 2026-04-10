/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FAFAFA', // Blanco Humo/Fondo
          dark: '#111111',  // Negro Ébano/Títulos
          gray: '#4A4A4A',  // Gris Pizarra/Texto
          accent: '#D4AF37' // Dorado Premium/Acento
        }
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
