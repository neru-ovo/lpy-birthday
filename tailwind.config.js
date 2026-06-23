/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'birthday-pink': '#FFB6C1',
        'birthday-gold': '#FFD700',
        'birthday-purple': '#E6E6FA',
        'birthday-light': '#FFF0F5',
        'birthday-rose': '#FF69B4',
        'birthday-cream': '#FFF8DC',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      fontFamily: {
        'display': ['"Comic Sans MS"', 'cursive'],
        'body': ['"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
