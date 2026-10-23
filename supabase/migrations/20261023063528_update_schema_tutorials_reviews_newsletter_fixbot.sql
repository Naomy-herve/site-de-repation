/*
# Update schema: add tutorial fields, reviews, newsletter, fixbot conversations

1. Modified Tables
- `tutorials` — add `introduction` (text), `tools_required` (text[])
- `products` — add `compatibility` (text) for device compatibility info

2. New Tables
- `product_reviews` — user reviews on products (rating, comment)
- `newsletter_subscribers` — email list with unsubscribe token
- `fixbot_conversations` — AI chat conversation history with delete support

3. Security
- RLS enabled on all new tables.
- Public read on product_reviews.
- Authenticated insert on product_reviews (owner-scoped).
- Public insert on newsletter_subscribers (no auth needed).
- Authenticated CRUD on fixbot_conversations (owner-scoped).
*/

-- ===================== TUTORIALS: ADD FIELDS =====================
ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS introduction text;
ALTER TABLE tutorials ADD COLUMN IF NOT EXISTS tools_required text[] DEFAULT '{}';

-- ===================== PRODUCTS: ADD COMPATIBILITY =====================
ALTER TABLE products ADD COLUMN IF NOT EXISTS compatibility text;

-- ===================== PRODUCT REVIEWS =====================
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Anonyme',
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON product_reviews TO anon, authenticated;
GRANT INSERT, DELETE ON product_reviews TO authenticated;

DROP POLICY IF EXISTS "public_read_reviews" ON product_reviews;
CREATE POLICY "public_read_reviews" ON product_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_review" ON product_reviews;
CREATE POLICY "insert_own_review" ON product_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_review" ON product_reviews;
CREATE POLICY "delete_own_review" ON product_reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===================== NEWSLETTER SUBSCRIBERS =====================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribe_token uuid DEFAULT gen_random_uuid(),
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
GRANT INSERT, SELECT ON newsletter_subscribers TO anon, authenticated;

DROP POLICY IF EXISTS "public_subscribe_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_subscribe_newsletter" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_unsub_token" ON newsletter_subscribers;
CREATE POLICY "public_read_unsub_token" ON newsletter_subscribers FOR SELECT
  TO anon, authenticated USING (true);

-- ===================== FIXBOT CONVERSATIONS =====================
CREATE TABLE IF NOT EXISTS fixbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixbot_session ON fixbot_conversations(session_id);

ALTER TABLE fixbot_conversations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON fixbot_conversations TO authenticated;

DROP POLICY IF EXISTS "select_own_conversations" ON fixbot_conversations;
CREATE POLICY "select_own_conversations" ON fixbot_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON fixbot_conversations;
CREATE POLICY "insert_own_conversations" ON fixbot_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON fixbot_conversations;
CREATE POLICY "delete_own_conversations" ON fixbot_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
