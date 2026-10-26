/*
# Optimisations sécurité, performance et robustesse

1. Sécurité
- `newsletter_subscribers` : la policy "public_read_unsub_token" (SELECT USING true)
  exposait TOUS les emails des abonnés à n'importe quel visiteur. Supprimée.
- Ajout de policies explicites : l'utilisateur authentifié ne peut lire que
  SA propre ligne newsletter.

2. Création automatique du profil à l'inscription
- Trigger `on_auth_user_created` : crée la ligne profiles dès l'insert
  dans auth.users, avec le username choisi (métadonnées) ou dérivé de l'email.
- username rendu unique par suffixe id si conflit (UNIQUE constraint).

3. Performance
- Index sur tutorials.published (filtré par la plupart des requêtes).
- Index sur fixbot_conversations.user_id.
*/

-- =============================================================
-- 1) SÉCURITÉ : newsletter — ne plus exposer les emails
-- =============================================================
REVOKE SELECT ON public.newsletter_subscribers FROM anon, authenticated;

DROP POLICY IF EXISTS "public_read_unsub_token" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "public_subscribe_newsletter" ON public.newsletter_subscribers;

-- Tout le monde peut s'abonner (insert), personne ne peut lire en masse
CREATE POLICY "insert_newsletter" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Un utilisateur connecté ne peut lire que sa propre ligne
CREATE POLICY "select_own_newsletter" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (auth.uid()::text = email);

-- =============================================================
-- 2) PROFIL AUTO-CRÉÉ À L'INSCRIPTION (trigger)
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
BEGIN
  -- Username : métadonnées d'inscription (options.data.username du client),
  -- sinon dérivé de l'email. Nettoyé et rendu unique.
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g')
  );
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'reparateur';
  END IF;

  final_username := base_username;
  -- Évite la violation de UNIQUE si le username est déjà pris
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || '_' || substr(new.id::text, 1, 6);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username);
    final_username := base_username || '_' || new.id::text;
    EXIT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, reputation)
  VALUES (
    new.id,
    final_username,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), final_username),
    0
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- 3) PERFORMANCE : index manquants
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON public.tutorials(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_tutorials_views ON public.tutorials(views DESC);
CREATE INDEX IF NOT EXISTS idx_fixbot_user ON public.fixbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_upvotes ON public.community_solutions(upvotes DESC);
