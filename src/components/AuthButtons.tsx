import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Suivre les changements d’état d’auth
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    // Initialisation (au reload)
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  // Si connecté
  if (userEmail) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-accent font-medium">Connecté : {userEmail}</span>
        <button
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors duration-200 shadow-lg"
          onClick={() => supabase.auth.signOut()}
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  // Si non connecté
  return (
    <form
      className="flex items-center gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) alert(error.message);
        else alert("Lien de connexion envoyé ✅ (vérifie ton email)");
      }}
    >
      <input
        type="email"
        placeholder="email@exemple.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 rounded-lg border-2 border-primary/20 bg-accent text-text placeholder-text/50 focus:outline-none focus:border-primary transition-colors duration-200"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-dark text-text font-medium transition-colors duration-200 shadow-lg"
      >
        Se connecter
      </button>
    </form>
  );
}

export {};