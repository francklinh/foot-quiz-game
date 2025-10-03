import { GameTitle } from "./components/GameTitle";
import { CherryCounter } from "./components/CherryCounter";

function App() {
  return (
    <div className="p-4 space-y-4">
      <GameTitle title="Top 10 Quiz" />
      <CherryCounter />
    </div>
  );
}

export default App;