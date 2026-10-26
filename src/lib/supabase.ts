import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuration manquante : définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans un fichier .env à la racine du projet.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
