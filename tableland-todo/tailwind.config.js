const mijin = require('mijin/dist/tailwind-preset.js');

module.exports = {
  purge: {
    content: [
      './components/**/*.{vue,js}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './nuxt.config.{js,ts}',
      './node_modules/mijin/src/components/**/*.vue'
    ],
    safelist: [
      'sm:gap-4',
      'sm:grid-cols-2'
    ]
  },
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
  presets: [
    mijin
  ]
};
