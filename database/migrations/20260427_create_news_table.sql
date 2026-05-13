-- Migração: Criar tabela de notícias semanais
-- Data: 2026-04-27

CREATE TABLE IF NOT EXISTS blink_news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ascii_url TEXT, -- URL do arquivo ASCII no storage
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE blink_news ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Public can view news" ON blink_news;
CREATE POLICY "Public can view news" ON blink_news
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage news" ON blink_news;
CREATE POLICY "Admins can manage news" ON blink_news
  FOR ALL USING (auth.jwt()->>'email' = 'admin@blinkmotion.com');

-- STORAGE BUCKET (Deve ser criado manualmente no painel ou via API se possível)
-- Nome sugerido do bucket: 'news_assets'
-- Política de Storage sugerida: Public read, Admin manage
