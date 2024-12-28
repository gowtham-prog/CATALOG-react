/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily : {
        'inter' : ["Inter", "sans-serif"],
        'nunito' : ["Nunito Sans", "sans-serif"],
        'noto' : ["Noto Sans JP", "sans-serif"],
        'hubballi' : ["Hubballi", "cursive"],
        'noto-kr' : ["Noto Sans KR", "sans-serif"],
      }
    },
  },
  plugins: [],
}

