const defaults = require('tailwindcss/defaultTheme');
const production = !process.env.ROLLUP_WATCH;

module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/components/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    fontFamily: {
      sans: ['"Bona Nova"', ...defaults.fontFamily.sans],
      serif: ['Overpass', ...defaults.fontFamily.serif],
      mono: ['"Source Code Pro"', ...defaults.fontFamily.mono]
    },
    extend: {
      fontFamily: {
        bold: ['Prompt', ...defaults.fontFamily.sans]
      },
      colors: {
        transparent: 'transparent'
      },
    },
  },
  plugins: []
};
