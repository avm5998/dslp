module.exports = {
  purge: [],
  important:false,
  // darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns:{
        '2-label':'',
      }
    },
  },
  variants: {
    extend: {}, 
  },
  plugins: [require("@tailwindcss/custom-forms")],
}
