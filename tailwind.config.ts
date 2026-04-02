import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002DA4',
          50: '#EEF2FF',
          100: '#D4DEFF',
          200: '#A9BCFF',
          300: '#7D9AFF',
          400: '#5276FF',
          500: '#2654FF',
          600: '#002DA4',
          700: '#001E7A',
          800: '#001650',
          900: '#000D2A',
        },
        teal: {
          DEFAULT: '#2AD4AE',
          50: '#EDFDF9',
          100: '#D1FAF0',
          200: '#A6F4E2',
          300: '#6DE9D0',
          400: '#2AD4AE',
          500: '#1AAC8C',
          600: '#148A71',
          700: '#116E5A',
          800: '#0F5748',
          900: '#0D463B',
        },
        navy: {
          DEFAULT: '#001E5D',
          50: '#EEF2FF',
          100: '#D9E2FF',
          200: '#B8C8FF',
          300: '#8EA5FF',
          400: '#6382FF',
          500: '#3B5FFE',
          600: '#1E3DE8',
          700: '#1530CE',
          800: '#1828A7',
          900: '#001E5D',
          950: '#000F30',
        },
        brand: {
          gray: '#E2E2E0',
          'gray-light': '#F5F5F4',
          'gray-dark': '#CACAC8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.3)',
        kanban: '0 2px 8px 0 rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
