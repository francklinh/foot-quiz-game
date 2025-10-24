import { useState } from "react";
import { Link } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";

export function Reglages() {
  const [settings, setSettings] = useState({
    volume: 75,
    langue: 'fr',
    theme: 'clair',
    notifications: true,
    vibrations: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Ici on pourrait sauvegarder les paramètres
    console.log("Paramètres sauvegardés:", settings);
    alert("Paramètres sauvegardés ! ✅");
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

      
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-accent-light">
          <h1 className="text-3xl font-bold text-center text-primary mb-8">
            ⚙️ RÉGLAGES
          </h1>

          <div className="space-y-8">
            {/* Volume son */}
            <div>
              <label className="block text-lg font-medium text-text mb-4">
                🔊 Volume son
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text/70">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-text/70">100%</span>
                <span className="text-lg font-bold text-primary w-12 text-center">
                  {settings.volume}%
                </span>
              </div>
            </div>

            {/* Langue */}
            <div>
              <label className="block text-lg font-medium text-text mb-4">
                🌍 Langue
              </label>
              <select
                value={settings.langue}
                onChange={(e) => handleSettingChange('langue', e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent text-text focus:outline-none focus:border-primary transition-colors duration-200"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Thème */}
            <div>
              <label className="block text-lg font-medium text-text mb-4">
                🎨 Thème
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSettingChange('theme', 'clair')}
                  className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                    settings.theme === 'clair'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-text'
                  }`}
                >
                  <div className="text-2xl mb-2">☀️</div>
                  <div className="font-medium">Clair</div>
                </button>
                <button
                  onClick={() => handleSettingChange('theme', 'sombre')}
                  className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                    settings.theme === 'sombre'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-text'
                  }`}
                >
                  <div className="text-2xl mb-2">🌙</div>
                  <div className="font-medium">Sombre</div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <label className="block text-lg font-medium text-text mb-4">
                🔔 Notifications
              </label>
              <div className="flex items-center justify-between">
                <span className="text-text/70">Recevoir des notifications</span>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.notifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Vibrations */}
            <div>
              <label className="block text-lg font-medium text-text mb-4">
                📳 Vibrations
              </label>
              <div className="flex items-center justify-between">
                <span className="text-text/70">Activer les vibrations</span>
                <button
                  onClick={() => handleSettingChange('vibrations', !settings.vibrations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    settings.vibrations ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.vibrations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center space-x-4 mt-8">
            <Link
              to="/"
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
            >
              Retour
            </Link>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors duration-200 shadow-lg"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
