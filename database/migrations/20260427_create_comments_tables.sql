-- ============================================================
-- ST-004: Sistema de Comentários
-- ============================================================

-- Comentários (árvore ilimitada via parent_id)
CREATE TABLE IF NOT EXISTS blink_comments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id     uuid NOT NULL REFERENCES blink_news(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES blink_comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_npc      BOOLEAN DEFAULT false,
  extra_likes INT DEFAULT 0,       -- curtidas artificiais definidas pelo admin
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_news    ON blink_comments (news_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent  ON blink_comments (parent_id);

-- Curtidas reais (unique por usuário)
CREATE TABLE IF NOT EXISTS blink_comment_likes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES blink_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes ON blink_comment_likes (comment_id);

-- Presets de injeção em massa (persistidos no Supabase)
CREATE TABLE IF NOT EXISTS blink_bulk_presets (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS — habilite no Supabase Dashboard e aplique as políticas:
-- ============================================================
-- ALTER TABLE blink_comments       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blink_comment_likes  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blink_bulk_presets   ENABLE ROW LEVEL SECURITY;
--
-- -- Comentários: leitura pública, escrita autenticada
-- CREATE POLICY "read_comments"  ON blink_comments FOR SELECT USING (true);
-- CREATE POLICY "write_comments" ON blink_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "delete_own"     ON blink_comments FOR DELETE USING (auth.uid() IS NOT NULL);
--
-- -- Likes: leitura pública, toggle autenticado
-- CREATE POLICY "read_likes"  ON blink_comment_likes FOR SELECT USING (true);
-- CREATE POLICY "write_likes" ON blink_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "delete_likes" ON blink_comment_likes FOR DELETE USING (auth.uid() = user_id);
--
-- -- Presets: apenas admin (restringir por email no dashboard ou usar service role)
-- CREATE POLICY "read_presets"  ON blink_bulk_presets FOR SELECT USING (true);
-- CREATE POLICY "write_presets" ON blink_bulk_presets FOR ALL USING (true);
