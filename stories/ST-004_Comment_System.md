---
title: Sistema de Comentários e Inserção em Massa
description: Implementação de comentários em estilo ASCII terminal nas notícias, com curtidas, respostas, identidades de NPC para o admin e injeção em massa de comentários pré-definidos.
last_updated: 2026-04-27
status: pendente
---

# ST-004: Sistema de Comentários e Inserção em Massa

## 🎯 Escopo
Adicionar uma seção de comentários abaixo de cada notícia no Feed (`/LOCAL_BROADCAST`). O sistema deve respeitar a estética de rede social ASCII dos anos 90/cyberpunk do BLiNKMOTiON. O admin pode postar como qualquer identidade (NPC ou conta própria). Jogadores postam como suas próprias identidades. Todos podem responder e curtir. O admin também pode injetar um bloco de comentários pré-roteirizados com um único clique (para preparar sessões de RPG com interações de NPCs já escritas).

- **Tipo**: Fullstack (Frontend + Supabase DB)
- **Localização**: `site/blinkmotion-app/src/` e Supabase Dashboard

---

## 🗂️ Arquivos Afetados

### Novos
- `src/components/SocialTerminal/CommentSection.tsx` — renderiza thread de comentários de uma notícia
- `src/components/SocialTerminal/CommentItem.tsx` — componente de um único comentário (texto, autor, data, curtidas, reply)
- `src/components/SocialTerminal/BulkCommentModal.tsx` — modal/painel de inserção em massa (admin only)
- `src/hooks/useComments.ts` — hook de fetch, create, delete e like de comentários
- `database/migrations/20260427_create_comments_tables.sql` — migração SQL

### Modificados
- `src/components/SocialTerminal/WeeklyNews.tsx` — adicionar `<CommentSection newsId={currentNews.id} />` abaixo do conteúdo
- `src/components/SocialTerminal/AdminPanel.tsx` — adicionar aba `[ GERENCIAR_COMENTÁRIOS ]` e botão de inserção em massa
- `src/hooks/useNews.ts` — sem alterações esperadas

---

## 🗃️ Modelo de Dados (SQL)

```sql
-- Comentários
CREATE TABLE IF NOT EXISTS blink_comments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id     uuid NOT NULL REFERENCES blink_news(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES blink_comments(id) ON DELETE CASCADE, -- NULL = raiz; preenchido = resposta
  identity_id uuid REFERENCES blink_identities(id) ON DELETE SET NULL, -- NPC ou identidade escolhida
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,        -- autor real
  author_name TEXT NOT NULL,          -- exibido no feed (alias/apelido)
  content     TEXT NOT NULL,
  is_npc      BOOLEAN DEFAULT false,  -- flag visual para estilizar comentários de NPCs diferente
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Curtidas (unique por usuário por comentário)
CREATE TABLE IF NOT EXISTS blink_comment_likes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES blink_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

-- RLS: habilitar e criar políticas
-- SELECT: todos os usuários autenticados
-- INSERT: usuários autenticados (jogadores) e admin
-- DELETE: apenas o próprio autor ou admin
-- LIKE: qualquer autenticado, mas UNIQUE impede duplo like

-- Índices de performance
CREATE INDEX ON blink_comments (news_id, created_at);
CREATE INDEX ON blink_comments (parent_id);
CREATE INDEX ON blink_comment_likes (comment_id);
```

---

## ✅ Critérios de Aceitação

### 1. Feed de Comentários (jogadores e admin)
- Abaixo do conteúdo de cada notícia em `/LOCAL_BROADCAST`, exibir seção `[ THREAD_DE_COMENTÁRIOS ]`.
- Comentários em árvore: raiz + respostas indentadas com `> ` no estilo IRC/BBS.
- Cada comentário exibe:
  - `[HANDLE]` — alias do autor (nome do NPC ou usuário)
  - Conteúdo do comentário
  - Data/hora formatada como `TIMESTAMP: DD/MM/AAAA HH:MM`
  - Contador de curtidas: `♥ N`
  - Botões: `[ RESPONDER ]` e `[ ♥ CURTIR ]`
  - Se NPC: exibir badge `[NPC]` em cor diferente (ex.: ciano `#00ffff`)
- Formulário de novo comentário no rodapé da thread: textarea + botão `[ TRANSMITIR ]`
- Máximo de 2 níveis de indentação para manter legibilidade ASCII.

### 2. Admin — Escolha de Identidade
- Antes de comentar, o admin vê um seletor: `COMENTAR_COMO: [ IDENTIDADE_PROPRIA | NPC_X | NPC_Y... ]`
- O select é populado a partir de `blink_identities` (NPCs cadastrados).
- Ao selecionar um NPC, o comentário é postado com `author_name = npc.name` e `is_npc = true`.

### 3. Curtidas
- Botão `[ ♥ CURTIR ]` faz toggle: curtir/descurtir.
- Contador atualiza otimisticamente no front, confirma no Supabase.
- Usuário não pode curtir o próprio comentário.
- Visual quando já curtido: `[ ♥ CURTIDO ]` com cor destacada.

### 4. Inserção em Massa (admin only)
- No painel admin (`/ROOT_ACCESS`), aba `[ GERENCIAR_COMENTÁRIOS ]`.
- Botão `[ INSERIR_LOTE ]` abre modal `BulkCommentModal`.
- O modal tem uma textarea onde o admin cola um JSON com estrutura pré-definida:

```json
[
  {
    "author": "Zero_Cool",
    "is_npc": true,
    "content": "Alguém mais notou o sinal intermitente no setor 7?",
    "replies": [
      {
        "author": "Ph4ntom",
        "is_npc": true,
        "content": "Sim. Parece codificado em Morse."
      },
      {
        "author": "Admin",
        "is_npc": false,
        "content": "> verificando logs... confirmado."
      }
    ]
  }
]
```

- O admin seleciona **qual notícia** receberá o lote (dropdown com títulos das notícias).
- Botão `[ EXECUTAR_INJEÇÃO ]` insere todos os comentários em ordem, respeitando hierarquia pai/filho.
- Feedback visual de progresso: `INJETANDO 1/3... 2/3... CONCLUÍDO`.
- O admin pode salvar scripts de lote como **presets** nomeados (localStorage) para reutilizar em sessões futuras.

### 5. Estética ASCII Terminal
- Fonte: `VT323`, cores neon verde (`#00ff00`) para jogadores, ciano (`#00ffff`) para NPCs.
- Separadores entre comentários: linha de traços `────────────────────`
- Thread de resposta indentada com borda esquerda `▏` ou `│` em verde escuro.
- Sem avatares — apenas o `[HANDLE]` em maiúsculas.
- Animação de novo comentário: fade-in com efeito de typing (opcional).

---

## 🤝 Protocolo de Confirmação
> **IA**: Story ST-004 criada. Esta alteração afeta o **Core de Dados** (Supabase — novas tabelas e RLS) e o **Módulo Social** (frontend — novos componentes). Antes de implementar, confirmar:
> 1. O campo `author_name` do jogador deve vir do `email` (ex.: `ph4ntom@blinkmotion.com` → exibe `ph4ntom`) ou de um campo de perfil separado?
> 2. Os presets de lote devem ser salvos só em `localStorage` ou também persistidos no Supabase para compartilhar entre máquinas?
> 3. O limite de 2 níveis de indentação está correto, ou deve permitir aninhamento ilimitado?
> 4. Curtidas de NPCs (postados pelo admin) devem ser contadas ou apenas humanos podem curtir?
