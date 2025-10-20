import { GameTitle } from "../components/GameTitle";

export function ClubExpress() {
  return (
    <div className="min-h-screen bg-soccer-pattern flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <GameTitle 
          title="Club Express" 
          subtitle="Testez vos connaissances sur les clubs de football du monde entier !"
          className="mb-8"
        />
        
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-6">⚽</div>
          <h2 className="text-2xl font-bold text-text mb-4">Bientôt disponible !</h2>
          <p className="text-text/70 text-lg">
            Cette page est en cours de développement. Revenez bientôt pour découvrir 
            notre nouveau jeu sur les clubs de football !
          </p>
        </div>
      </div>
    </div>
  );
}