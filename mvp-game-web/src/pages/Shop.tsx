import { useState } from "react";
import { GlobalHeader } from "../components/GlobalHeader";
import { FloatingBall } from "../components/FloatingBall";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'avatar' | 'theme' | 'powerup';
  icon: string;
  owned: boolean;
};

export function Shop() {
  const [clafoutis, setClafoutis] = useState(1250);
  const [items, setItems] = useState<ShopItem[]>([
    {
      id: '1',
      name: 'Avatar Légendaire',
      description: 'Un avatar doré exclusif',
      price: 500,
      category: 'avatar',
      icon: '👑',
      owned: false
    },
    {
      id: '2',
      name: 'Maillot PSG',
      description: 'Maillot officiel du Paris Saint-Germain',
      price: 300,
      category: 'theme',
      icon: '👕',
      owned: false
    },
    {
      id: '3',
      name: 'Bonus Temps',
      description: '+30 secondes pour votre prochaine partie',
      price: 150,
      category: 'powerup',
      icon: '⏰',
      owned: false
    },
    {
      id: '4',
      name: 'Avatar Foot',
      description: 'Avatar ballon de foot animé',
      price: 200,
      category: 'avatar',
      icon: '⚽',
      owned: true
    },
    {
      id: '5',
      name: 'Maillot Real Madrid',
      description: 'Maillot officiel du Real Madrid',
      price: 350,
      category: 'theme',
      icon: '👕',
      owned: false
    },
    {
      id: '6',
      name: 'Indice Gratuit',
      description: 'Révèle une lettre dans votre prochaine partie',
      price: 100,
      category: 'powerup',
      icon: '💡',
      owned: false
    },
    {
      id: '7',
      name: 'Avatar Trophée',
      description: 'Avatar trophée brillant',
      price: 400,
      category: 'avatar',
      icon: '🏆',
      owned: false
    },
    {
      id: '8',
      name: 'Thème Sombre',
      description: 'Interface en mode sombre',
      price: 250,
      category: 'theme',
      icon: '🌙',
      owned: false
    }
  ]);

  const handlePurchase = (item: ShopItem) => {
    if (clafoutis >= item.price && !item.owned) {
      setClafoutis(prev => prev - item.price);
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, owned: true } : i
      ));
      alert(`Achat réussi ! Vous avez obtenu ${item.name} ! 🎉`);
    } else if (item.owned) {
      alert('Vous possédez déjà cet item ! ✅');
    } else {
      alert('Clafoutis insuffisants ! 🧮');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'avatar': return 'bg-primary';
      case 'theme': return 'bg-secondary';
      case 'powerup': return 'bg-accent';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'avatar': return 'Avatar';
      case 'theme': return 'Thème';
      case 'powerup': return 'Bonus';
      default: return 'Autre';
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Motifs ballon en filigrane */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-primary rounded-full"></div>
      </div>

      
      
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            🛍️ BOUTIQUE
          </h1>
          <div className="bg-primary text-white rounded-xl px-6 py-3 inline-block">
            <span className="text-2xl font-bold">{clafoutis}</span>
            <span className="ml-2">clafoutis disponibles</span>
          </div>
        </div>

        {/* Grille d'items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white/90 backdrop-blur rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                item.owned ? 'ring-2 ring-secondary' : ''
              }`}
            >
              {/* Image/Icone */}
              <div className={`h-32 ${getCategoryColor(item.category)} flex items-center justify-center`}>
                <span className="text-6xl">{item.icon}</span>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-text">{item.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                
                <p className="text-text/70 text-sm mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">🧮</span>
                    <span className="font-bold text-primary">{item.price}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={clafoutis < item.price}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      item.owned
                        ? 'bg-secondary text-text cursor-not-allowed'
                        : clafoutis >= item.price
                        ? 'bg-primary hover:bg-primary-dark text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.owned ? 'Possédé ✅' : clafoutis >= item.price ? 'Acheter' : 'Clafoutis insuffisants'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section recommandations */}
        <div className="mt-12 bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-center text-text mb-6">
            💡 Recommandations
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-primary/10 rounded-xl p-6">
              <h3 className="font-bold text-lg text-primary mb-2">🎯 Pour débuter</h3>
              <p className="text-text/70 text-sm">
                Commencez par acheter des bonus utiles comme l'indice gratuit ou le bonus temps. 
                Ils vous aideront à gagner plus de clafoutis !
              </p>
            </div>
            <div className="bg-secondary/20 rounded-xl p-6">
              <h3 className="font-bold text-lg text-secondary-dark mb-2">🏆 Collection</h3>
              <p className="text-text/70 text-sm">
                Collectionnez tous les avatars et thèmes pour personnaliser votre expérience 
                et impressionner vos amis !
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingBall />
    </div>
  );
}
