/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F6F8',
        'warm-white': '#FFFFFF',
        ink: '#1A1D23',
        'ink-soft': '#3A4048',
        'ink-muted': '#5A616B',
        accent: '#A81F3A',
        'accent-hover': '#8A1830',
        'accent-soft': '#F9EAED',
        support: '#2F6E8F',
        'support-hover': '#235571',
        'support-soft': '#EAF1F5',
        hair: '#E2E5EA',
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
        DEFAULT: '#E2E5EA',
      },
    },
  },
  plugins: [],
}
