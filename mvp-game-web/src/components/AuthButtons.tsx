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
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Connecté : {userEmail}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
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
      className="flex items-center gap-2"
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
        className="border px-2 py-1 rounded"
        required
      />
      <button
        type="submit"
        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Se connecter
      </button>
    </form>
  );
}

export {};