-- ST-005: Fórum / Feed Vertical
CREATE TABLE IF NOT EXISTS blink_posts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_npc      BOOLEAN DEFAULT false,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON blink_posts (created_at DESC);

-- Comentários de posts do fórum (mesma tabela blink_comments, mas com post_id)
ALTER TABLE blink_comments ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES blink_posts(id) ON DELETE CASCADE;
-- Apenas um de news_id ou post_id deve ser preenchido por vez.

-- RLS (habilitar no dashboard)
-- ALTER TABLE blink_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read_posts"  ON blink_posts FOR SELECT USING (true);
-- CREATE POLICY "write_posts" ON blink_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "delete_posts" ON blink_posts FOR DELETE USING (auth.uid() IS NOT NULL);
