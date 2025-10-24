import { Link } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";

export function Regles() {
  return (
    <div className="min-h-screen bg-background">
      
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-8">
            📖 RÈGLES DU JEU
          </h1>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">🎯 Objectif du jeu</h2>
              <p className="text-text">
                Bienvenue dans <strong>Clafootix</strong> ! Votre mission est de deviner les meilleurs joueurs de football 
                dans différentes catégories et de gagner le maximum de <strong>clafoutis</strong> 🧮. 
                Plus vous êtes rapide et précis, plus vous gagnez de points !
              </p>
            </div>

            {/* Modes de jeu */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-secondary/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-secondary-dark mb-4">🧍‍♂️ Mode Solo</h3>
                <ul className="space-y-2 text-text">
                  <li>• Devinez les <strong>10 meilleurs joueurs</strong> dans une catégorie</li>
                  <li>• Choisissez la <strong>ligue</strong> et l'<strong>année</strong></li>
                  <li>• <strong>60 secondes</strong> pour tout trouver</li>
                  <li>• Chaque bonne réponse = <strong>+15 clafoutis</strong></li>
                  <li>• Bonus de streak pour les bonnes réponses consécutives</li>
                </ul>
              </div>

              <div className="bg-accent/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-primary mb-4">⚔️ Mode Défi (Grille Croisée)</h3>
                <ul className="space-y-2 text-text">
                  <li>• Remplissez une <strong>grille 3x3</strong></li>
                  <li>• Trouvez les joueurs qui correspondent aux critères</li>
                  <li>• <strong>2 minutes</strong> pour compléter la grille</li>
                  <li>• Chaque bonne réponse = <strong>+20 clafoutis</strong></li>
                  <li>• Bonus de streak pour les réponses consécutives</li>
                </ul>
              </div>
            </div>

            {/* Système de points */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">🧮 Système de points</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-text mb-2">Points de base :</h3>
                  <ul className="space-y-1 text-text">
                    <li>• Bonne réponse : <strong>+15 clafoutis</strong> (Solo)</li>
                    <li>• Bonne réponse : <strong>+20 clafoutis</strong> (Défi)</li>
                    <li>• Mauvaise réponse : <strong>-5 clafoutis</strong></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text mb-2">Bonus de streak :</h3>
                  <ul className="space-y-1 text-text">
                    <li>• 3 bonnes de suite : <strong>+10 clafoutis</strong></li>
                    <li>• 6 bonnes de suite : <strong>+15 clafoutis</strong></li>
                    <li>• 9 bonnes de suite : <strong>+10 clafoutis</strong></li>
                    <li>• 10 bonnes de suite : <strong>+15 clafoutis</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-secondary/20 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-secondary-dark mb-4">💡 Conseils pour gagner</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-text mb-2">Stratégie :</h3>
                  <ul className="space-y-1 text-text">
                    <li>• Commencez par les joueurs les plus connus</li>
                    <li>• Utilisez les indices visuels (drapeaux, statistiques)</li>
                    <li>• Ne perdez pas de temps sur les noms difficiles</li>
                    <li>• Gardez un œil sur le temps restant</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text mb-2">Astuces :</h3>
                  <ul className="space-y-1 text-text">
                    <li>• L'orthographe n'est pas importante</li>
                    <li>• Les prénoms et noms de famille comptent</li>
                    <li>• Utilisez l'autocomplétion pour gagner du temps</li>
                    <li>• Entraînez-vous régulièrement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Classement */}
            <div className="bg-accent/30 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">🏆 Classement</h2>
              <p className="text-text mb-4">
                Votre score total est affiché dans le <strong>compteur clafoutis</strong> en haut de l'écran. 
                Consultez le classement pour voir où vous vous situez parmi les autres joueurs !
              </p>
              <div className="text-center">
                <Link
                  to="/stats"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg"
                >
                  Voir le classement
                </Link>
              </div>
            </div>

            {/* Bouton retour */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-secondary hover:bg-secondary-dark text-text font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg text-lg"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
