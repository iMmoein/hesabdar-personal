/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8ec0ff',
          400: '#599cff', 500: '#3377ff', 600: '#1e57f5', 700: '#1843e1',
          800: '#1937b6', 900: '#1a338f', 950: '#152057'
        }
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        card: '0 4px 16px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}
