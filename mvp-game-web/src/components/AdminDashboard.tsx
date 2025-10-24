import React from 'react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const adminSections = [
    {
      title: "Gestion des Joueurs",
      description: "Ajouter, modifier et supprimer des joueurs",
      icon: "👥",
      path: "/admin#players",
      color: "bg-primary"
    },
    {
      title: "Gestion des Thèmes",
      description: "Créer et gérer les thèmes de jeux",
      icon: "🎯",
      path: "/admin#themes",
      color: "bg-secondary"
    },
    {
      title: "Gestion des Questions",
      description: "Ajouter des questions et réponses",
      icon: "❓",
      path: "/admin#questions",
      color: "bg-success"
    },
    {
      title: "Gestion des Grilles",
      description: "Configurer les grilles croisées",
      icon: "🔢",
      path: "/admin#grids",
      color: "bg-warning"
    },
    {
      title: "Statistiques Admin",
      description: "Analyser les performances et l'usage",
      icon: "📊",
      path: "/admin#stats",
      color: "bg-info"
    },
    {
      title: "Gestion des Utilisateurs",
      description: "Modérer les comptes utilisateurs",
      icon: "👤",
      path: "/admin#users",
      color: "bg-danger"
    }
  ];

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-2">🔧 Administration CLAFOOTIX</h1>
            <p className="text-xl opacity-90">Gérez le contenu et les utilisateurs de l'application</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation rapide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Tableau de bord</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <Link
                key={section.title}
                to={section.path}
                className={`${section.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{section.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                  <p className="text-sm opacity-90">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-primary p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-secondary">Joueurs actifs</div>
          </div>
          <div className="card-primary p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-primary">89</div>
            <div className="text-sm text-secondary">Thèmes créés</div>
          </div>
          <div className="card-primary p-6 text-center">
            <div className="text-3xl mb-2">❓</div>
            <div className="text-2xl font-bold text-primary">2,456</div>
            <div className="text-sm text-secondary">Questions</div>
          </div>
          <div className="card-primary p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-primary">15,678</div>
            <div className="text-sm text-secondary">Parties jouées</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card-primary p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="btn-primary py-3 px-4 rounded-lg">
              ➕ Ajouter un joueur
            </button>
            <button className="btn-secondary py-3 px-4 rounded-lg">
              🎯 Créer un thème
            </button>
            <button className="btn-outline py-3 px-4 rounded-lg">
              📊 Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
