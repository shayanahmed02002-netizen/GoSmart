/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6F8',
        surface: '#FFFFFF',
        ink: '#12161F',
        subink: '#5B6270',
        line: '#E6E8EC',
        sidebar: '#12161F',
        sidebarhover: '#1C212D',
        primary: {
          DEFAULT: '#0EA5A5',
          dark: '#0B8484',
          light: '#E6F7F6',
        },
        accent: {
          DEFAULT: '#6D5EF5',
          light: '#EEECFE',
        },
        warn: {
          DEFAULT: '#F5A623',
          light: '#FDF2DE',
        },
        danger: {
          DEFAULT: '#EF5A6F',
          light: '#FDEAED',
        },
        won: {
          DEFAULT: '#22A87A',
          light: '#E4F6EF',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,22,31,0.04), 0 1px 12px rgba(18,22,31,0.04)',
        pop: '0 8px 30px rgba(18,22,31,0.12)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
}
