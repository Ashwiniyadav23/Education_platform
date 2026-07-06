/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#3b5bdb',
          600: '#2f4bc0',
          700: '#263c9c',
        },
        risk: {
          low: '#16a34a',
          medium: '#f59e0b',
          high: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
