/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F3',
        'warm-white': '#FFFEF9',
        ink: '#1C1A17',
        'ink-soft': '#4A4640',
        'ink-muted': '#8A8680',
        accent: '#C4622A',
        'accent-soft': '#F5EAE2',
        hair: 'rgba(28,26,23,0.1)',
        pos: '#4E7C59',
        'pos-soft': '#E7EFE8',
        warn: '#B5792A',
        'warn-soft': '#F6EEDD',
        neg: '#B23A2A',
        'neg-soft': '#F5E6E2',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(28,26,23,0.1)',
      },
    },
  },
  plugins: [],
}
