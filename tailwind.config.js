/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
      },
      dropShadow: {
        sm: '0 1px 1px var(--tw-shadow-color)',
        base: ['0 1px 2px var(--tw-shadow-color)', '0 1px 1px var(--tw-shadow-color)'],
        md: ['0 4px 3px var(--tw-shadow-color)', '0 2px 2px var(--tw-shadow-color)'],
        lg: ['0 10px 8px var(--tw-shadow-color)', '0 4px 3px var(--tw-shadow-color)'],
        xl: ['0 20px 13px var(--tw-shadow-color)', '0 8px 5px var(--tw-shadow-color)'],
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
