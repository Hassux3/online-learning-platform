// tailwind.config.js
module.exports = {
  darkMode: 'class', 
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
      nastaleeq: ['JameelNooriNastaleeq', 'serif'],
      zalando: ['"Zalando Sans Expanded"', 'sans-serif'],
      
    },
      animation: {
        fadeInScale: 'fadeInScale 0.3s ease-out forwards',
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        fadeInScale: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': {
            opacity: 0,
            transform: 'translateY(40px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      },
    },
  },
  plugins: [],
};
