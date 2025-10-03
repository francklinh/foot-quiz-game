import { useState } from "react";

export function CherryCounter() {
  // Déclaration du state : count = valeur actuelle, setCount = fonction pour la changer
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">🍒 {count}</span>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        +1
      </button>
    </div>
  );
}