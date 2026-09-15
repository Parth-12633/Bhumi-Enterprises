/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brandBlue: {
          light: '#eff6ff',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
        sidebarBg: '#ffffff',
        successGreen: '#10b981',
        warningRed: '#ef4444',
        advanceYellow: '#fef3c7',
      }
    },
  },
  plugins: [],
}
