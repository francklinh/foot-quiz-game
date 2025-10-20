/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique CLAFOOTIX
        primary: '#8B1C1C',      // Rouge principal
        secondary: '#F4C542',     // Jaune secondaire
        background: '#F8E8C0',    // Beige de fond
        text: '#1E1E1E',          // Texte principal
        accent: '#FFF9E8',        // Accent clair
        // Couleurs dérivées
        'primary-dark': '#6B1515',
        'primary-light': '#A52A2A',
        'secondary-dark': '#D4A842',
        'secondary-light': '#F5D042',
        'background-dark': '#F0D8A0',
        'background-light': '#FCF0E0',
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
      }
    },
  },
  plugins: [],
}