/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}" // Ensure Storybook's files are included
  ],
  theme: {
    extend: {
      animation: {
        'flash': 'flash 5s infinite', // Add the animation definition
      },
      keyframes: {    
        flash: {
          '0%': {
            backgroundColor: '#fff',
            color: '#000',
          },
          '50%': {
            backgroundColor: '#000',
            color: '#fff',
          },
          '100%': {
            backgroundColor: '#fff',
            color: '#000',
          }
        }
      }
    }
  },
  plugins: [],
}
