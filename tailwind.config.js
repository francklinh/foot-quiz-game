/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nouvelle palette selon les specs
        primary: '#C92A2A',      // Rouge principal
        'primary-dark': '#A61E1E', // Rouge foncé
        secondary: '#FFD43B',     // Jaune/Or
        'secondary-dark': '#E6BF35', // Jaune plus foncé
        background: '#F5F5F5',    // Gris clair
        text: '#000000',          // Noir
        accent: '#FFF4E6',        // Beige
        'accent-light': '#E0E0E0', // Gris moyen
        white: '#FFFFFF',         // Blanc
        // Couleurs dérivées pour compatibilité
        'primary-light': '#E74C3C',
        'secondary-light': '#FFE066',
        'background-dark': '#E8E8E8',
        'background-light': '#FAFAFA',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'diagonal-gradient': 'linear-gradient(135deg, #8B1C1C 0%, #F8E8C0 100%)',
        'soccer-pattern': 'radial-gradient(circle at 20% 50%, #8B1C1C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F4C542 0%, transparent 50%), radial-gradient(circle at 40% 80%, #FFF9E8 0%, transparent 50%)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      }
    },
  },
  plugins: [],
}