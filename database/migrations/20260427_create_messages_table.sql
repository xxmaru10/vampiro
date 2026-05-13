CREATE TABLE IF NOT EXISTS blink_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  receiver_name text NOT NULL,
  content text NOT NULL,
  is_npc_sender boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blink_messages_sender ON blink_messages(sender_name);
CREATE INDEX IF NOT EXISTS idx_blink_messages_receiver ON blink_messages(receiver_name);
CREATE INDEX IF NOT EXISTS idx_blink_messages_created ON blink_messages(created_at);

-- Habilitar no painel do Supabase: Authentication > Policies > Enable RLS on blink_messages
-- ALTER TABLE blink_messages ENABLE ROW LEVEL SECURITY;

-- Leitura pública (ajuste conforme necessidade)
-- CREATE POLICY "read_messages" ON blink_messages FOR SELECT USING (true);
-- CREATE POLICY "insert_messages" ON blink_messages FOR INSERT WITH CHECK (true);
