/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './public/*.html'],
  theme: {
    extend: {
      colors: {
        'machisuke-orange': '#E8833A',
        'machisuke-green': '#5FA246',
        'machisuke-green-dark': '#4A8A38',
        'machisuke-title-green': '#3F5A3A',
        'machisuke-cream': '#F7F1E4',
        'machisuke-cream-light': '#FFFAF0',
        'machisuke-card-warm-white': '#FFFAF0',
        'machisuke-white': '#FFFFFF',
        'machisuke-brown-footer': '#4A3B2C',
        'machisuke-footer-label': '#EDEDED',
        'machisuke-footer-address': '#C9C2B8',
        'machisuke-text': '#3A3A3A',
        'machisuke-text-gray': '#7A7A7A',
        'machisuke-blue': '#3E7FB0',
        'machisuke-border-light': '#E0E0E0',
        'machisuke-logo-red': '#A8302A',
      },
      fontFamily: {
        display: ['"Zen Maru Gothic"', 'sans-serif'],
        body: ['"Zen Kaku Gothic New"', 'sans-serif'],
        label: ['"Kosugi Maru"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
