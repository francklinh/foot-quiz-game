import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function TestSupabase() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("themes").select("id, title").limit(1);
        if (error) {
          console.error(error);
          setStatus("❌ Connection failed: " + error.message);
        } else if (data && data.length > 0) {
          setStatus("✅ Connected! Found theme: " + data[0].title);
        } else {
          setStatus("✅ Connected! No themes found (table empty).");
        }
      } catch (e: any) {
        setStatus("❌ Unexpected error: " + e.message);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Test Supabase Connection</h1>
      <p>{status}</p>
    </div>
  );
}