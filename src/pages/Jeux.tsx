import { GamePage } from "./GamePage";

export function Jeux() {
  return (
    <GamePage
      title="Jeux"
      description="Choisissez votre mode de jeu"
      rules="Testez vos connaissances footballistiques et gagnez des cerises ! Chaque bonne réponse vous rapporte des points. Plus vous êtes rapide et précis, plus vous gagnez de cerises !"
      soloPath="/top10"
      defiPath="/top10"
      icon="🎮"
    />
  );
}
