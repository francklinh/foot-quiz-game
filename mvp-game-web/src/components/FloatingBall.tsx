import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../logo.svg";

type FloatingBallProps = {
  show?: boolean;
};

export function FloatingBall({ show = true }: FloatingBallProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!show) return null;

  const menuItems = [
    { icon: "⚙️", label: "Réglages", path: "/reglages" },
    { icon: "📊", label: "Stats", path: "/stats" },
    { icon: "🛍️", label: "Shop", path: "/shop" },
    { icon: "⚔️", label: "Défis", path: "/challenges" },
    { icon: "🔧", label: "Admin", path: "/admin" },
  ];

  return (
    <>
      {/* Overlay grisé */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bouton flottant ballon */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-secondary hover:bg-secondary-dark text-text rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 animate-bounce-slow"
        >
          <img src={logo} alt="Clafootix" className="w-10 h-10" />
        </button>

        {/* Menu simple (fallback) */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 z-50 flex flex-col gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 bg-white border border-accent-light text-text px-4 py-3 rounded-xl shadow-xl hover:bg-accent transition-colors"
              >
                <span className="text-primary text-xl">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </>
  );
}
