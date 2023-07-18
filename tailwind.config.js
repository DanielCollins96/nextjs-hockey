module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'maxHeight': 'maxHeight'
      },
      outline: {
        red: '2px dotted red'
      },
      minHeight: (theme) => ({
        ...theme('spacing'),
      }),
      spacing: {
      '144': '36rem'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
