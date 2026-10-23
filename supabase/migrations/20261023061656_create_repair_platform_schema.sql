/*
# Create FlamOfReparation Platform Schema

1. Overview
This migration creates the full database schema for the FlamOfReparation platform — a French repair community combining tutorials, a store, a blog, and community features.

2. New Tables
- `categories` — Device categories (Electronics, Household, Phone, etc.)
- `devices` — Individual device models grouped by category
- `tutorials` — Repair tutorials with difficulty, time, steps count
- `tutorial_steps` — Individual steps within a tutorial
- `community_solutions` — User-contributed repair solutions
- `products` — Store items (parts, tools, kits)
- `blog_posts` — Editorial blog/news articles
- `profiles` — User profiles linked to auth.users

3. Security
- RLS enabled on all tables.
- Public read access (anon + authenticated) for tutorials, devices, categories, products, blog_posts, community_solutions.
- Authenticated write access for tutorials, community_solutions, profiles (owner-scoped).
*/

-- ===================== CATEGORIES =====================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'Wrench',
  description text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON categories TO anon, authenticated;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- ===================== DEVICES =====================
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  manufacturer text,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON devices TO anon, authenticated;
DROP POLICY IF EXISTS "public_read_devices" ON devices;
CREATE POLICY "public_read_devices" ON devices FOR SELECT
  TO anon, authenticated USING (true);

-- ===================== TUTORIALS =====================
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  summary text,
  difficulty text NOT NULL DEFAULT 'Modérée' CHECK (difficulty IN ('Facile', 'Modérée', 'Difficile', 'Très difficile')),
  time_minutes int NOT NULL DEFAULT 30,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_device ON tutorials(device_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_featured ON tutorials(featured) WHERE featured = true;

ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON tutorials TO authenticated;
GRANT SELECT ON tutorials TO anon;

DROP POLICY IF EXISTS "public_read_tutorials" ON tutorials;
CREATE POLICY "public_read_tutorials" ON tutorials FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "insert_own_tutorials" ON tutorials;
CREATE POLICY "insert_own_tutorials" ON tutorials FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "update_own_tutorials" ON tutorials;
CREATE POLICY "update_own_tutorials" ON tutorials FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- ===================== TUTORIAL STEPS =====================
CREATE TABLE IF NOT EXISTS tutorial_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid REFERENCES tutorials(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  title text,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_steps_tutorial ON tutorial_steps(tutorial_id);

ALTER TABLE tutorial_steps ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON tutorial_steps TO authenticated;
GRANT SELECT ON tutorial_steps TO anon;

DROP POLICY IF EXISTS "public_read_steps" ON tutorial_steps;
CREATE POLICY "public_read_steps" ON tutorial_steps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "author_manage_steps" ON tutorial_steps;
CREATE POLICY "author_manage_steps" ON tutorial_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM tutorials WHERE tutorials.id = tutorial_steps.tutorial_id AND tutorials.author_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM tutorials WHERE tutorials.id = tutorial_steps.tutorial_id AND tutorials.author_id = auth.uid())
  );

-- ===================== COMMUNITY SOLUTIONS =====================
CREATE TABLE IF NOT EXISTS community_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  upvotes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solutions_device ON community_solutions(device_id);

ALTER TABLE community_solutions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON community_solutions TO authenticated;
GRANT SELECT ON community_solutions TO anon;

DROP POLICY IF EXISTS "public_read_solutions" ON community_solutions;
CREATE POLICY "public_read_solutions" ON community_solutions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_solutions" ON community_solutions;
CREATE POLICY "insert_own_solutions" ON community_solutions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'pieces' CHECK (category IN ('pieces', 'outils', 'kits')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  description text,
  image_url text,
  stock int NOT NULL DEFAULT 0,
  rating decimal(3,1) NOT NULL DEFAULT 4.5,
  reviews_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON products TO anon, authenticated;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- ===================== BLOG POSTS =====================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Rédaction FlamOfReparation',
  image_url text,
  category text NOT NULL DEFAULT 'actualites',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON blog_posts TO anon, authenticated;
DROP POLICY IF EXISTS "public_read_blog" ON blog_posts;
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT
  TO anon, authenticated USING (true);

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  reputation int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
