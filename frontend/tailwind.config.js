/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        mumbai: "#1E3A8A",
      },
    },
  },
  plugins: [],
}