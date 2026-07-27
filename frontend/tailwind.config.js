/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek premium colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        amazon: {
          blue: '#131921',
          lightBlue: '#232f3e',
          yellow: '#f3d078',
          orange: '#ff9900',
        }
      }
    },
  },
  plugins: [],
}
