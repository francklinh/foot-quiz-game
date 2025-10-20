import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="min-h-screen bg-soccer-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-text mb-6">
              Bienvenue sur{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Clafootix
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-text/80 mb-8 max-w-3xl mx-auto">
              Découvrez nos jeux de football passionnants et testez vos connaissances sur le ballon rond !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/top10"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🏆 Jouer au Top 10
              </Link>
              <Link
                to="/grille"
                className="bg-secondary hover:bg-secondary-dark text-text font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ⚡ Grille Croisée
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Jeux disponibles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-text mb-12">
          Nos Jeux
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Top 10 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-text mb-4">Top 10</h3>
              <p className="text-text/70 mb-6">
                Devinez les 10 meilleurs joueurs dans différentes catégories : buteurs, passeurs, et plus encore !
              </p>
              <Link
                to="/top10"
                className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
              >
                Jouer maintenant
              </Link>
            </div>
          </div>

          {/* Grille Croisée */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-text mb-4">Grille Croisée</h3>
              <p className="text-text/70 mb-6">
                Remplissez la grille en trouvant les joueurs qui correspondent aux critères croisés !
              </p>
              <Link
                to="/grille"
                className="inline-block bg-secondary text-text font-bold py-3 px-6 rounded-lg hover:bg-secondary-dark transition-colors duration-200"
              >
                Jouer maintenant
              </Link>
            </div>
          </div>

          {/* Club Express */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="text-6xl mb-4">⚽</div>
              <h3 className="text-2xl font-bold text-text mb-4">Club Express</h3>
              <p className="text-text/70 mb-6">
                Testez vos connaissances sur les clubs de football du monde entier !
              </p>
              <Link
                to="/club"
                className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
              >
                Jouer maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl font-bold mb-4">Clafootix</div>
          <p className="text-accent mb-6">Votre destination pour les jeux de football</p>
          <div className="flex justify-center space-x-6">
            <Link to="/top10" className="text-accent hover:text-white transition-colors duration-200">
              Top 10
            </Link>
            <Link to="/grille" className="text-accent hover:text-white transition-colors duration-200">
              Grille Croisée
            </Link>
            <Link to="/club" className="text-accent hover:text-white transition-colors duration-200">
              Club Express
            </Link>
            <Link to="/admin" className="text-secondary hover:text-secondary-light transition-colors duration-200">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}