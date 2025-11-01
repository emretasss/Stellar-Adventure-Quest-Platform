/** @type {import('tailwindcss').Config} */
// TailwindCSS configuration / TailwindCSS yapılandırması

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          primary: '#4C7CE0',
          secondary: '#7B61FF',
          dark: '#1A1F2E',
        },
      },
    },
  },
  plugins: [],
}



