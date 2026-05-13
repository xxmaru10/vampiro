---
title: Melhorias no Sistema de Notificações e Identificação de Jogadores
description: Refinamento visual das notificações (verde), marcação de leitura, navegação direta para conteúdos e identificação visual de Jogadores vs NPCs.
last_updated: 2026-04-28
status: concluída
---

# ST-006: Melhorias no Sistema de Notificações e Identificação de Jogadores

## 🎯 Escopo
Aprimorar a experiência do usuário no Terminal Social (Blinkmotion) melhorando a visibilidade das notificações, permitindo o controle de leitura e facilitando a distinção entre personagens controlados pelo mestre (NPCs) e jogadores reais.

- **Tipo**: Frontend / Logic
- **Localização**: `site/blinkmotion-app/src/`

---

## 🗂️ Arquivos Afetados

### Modificados
- `src/hooks/useNotifications.ts` — Lógica de persistência de "lido" (localStorage) e geração de links específicos.
- `src/components/SocialTerminal/NotificationsView.tsx` — Mudança de cor para verde, adição de botão "Marcar como lida" e estilos.
- `src/components/SocialTerminal/CommentItem.tsx` — Adição do sufixo `**` em nomes de jogadores.
- `src/components/SocialTerminal/NewsItem.tsx` (se existir) ou onde o autor da notícia/post é exibido.
- `src/components/SocialTerminal/WeeklyNews.tsx` — Verificação de onde mais nomes aparecem.

---

## ✅ Critérios de Aceitação

### 1. Estética de Notificação (Verde)
- Todas as notificações devem seguir a paleta de cores verde neon do terminal.
- Remover bordas laranjas ou azuis que quebrem a estética monocromática verde pedida pelo usuário.
- O estado de "não lido" deve ser mais vibrante que o "lido".

### 2. Gestão de Leitura
- Adicionar um botão/ícone `[ LIDO ]` ou `[ ✔ ]` em cada notificação na `NotificationsView`.
- Clicar no botão marca aquela notificação específica como lida.
- O estado de leitura deve persistir (usar `localStorage` para simplificar, já que não temos tabela de notificações no DB).
- Adicionar opção "Marcar todas como lidas".

### 3. Navegação Direta
- Ao clicar em uma notificação de comentário, o sistema deve levar o usuário diretamente para a notícia e, se possível, fazer scroll até o comentário específico (usar IDs de elemento ou fragmentos de URL).
- Notificações de aprovação de post devem levar ao painel admin na aba correta.

### 4. Identificação de Jogadores (`**`)
- Nomes de usuários que **não** são NPCs devem ser exibidos com `**` ao final (ex: `PH4NTOM**`).
- Nomes de NPCs permanecem normais ou com o badge `[NPC]` já existente.
- Isso deve ser aplicado em:
  - Lista de comentários.
  - Feed de postagens.
  - Notificações.

---

## 🛠️ Plano de Implementação Sugerido

1.  **useNotifications Hook**:
    - Criar um Set de IDs lidos no `localStorage`.
    - Modificar `fetchNotifications` para marcar como `read: true` se o ID estiver no Set.
    - Implementar `markAsRead(id)` que atualiza o Set e o estado.
2.  **NotificationsView**:
    - Atualizar CSS para forçar tons de verde.
    - Renderizar o botão de ação para marcar como lida.
3.  **Componentes de Nome**:
    - Criar um helper ou componente `UserName` que recebe `name` e `isNpc` e aplica a regra do `**`.
    - Substituir as renderizações manuais de nome por este novo padrão.

---

## 🤝 Protocolo de Confirmação
> **IA**: Story ST-006 criada. Esta alteração é majoritariamente de **Frontend e UX**. Antes de implementar, confirmar:
> 1. A marcação de leitura via `localStorage` é suficiente para esta fase, ou devemos criar uma tabela `blink_notifications_read` no Supabase para persistência multi-dispositivo?
> 2. O sufixo `**` deve ser aplicado apenas no "handle" (ex: `[USER**]`) ou em qualquer menção ao nome?
> 3. Para a navegação direta ao comentário, precisamos garantir que cada comentário tenha um `id` HTML único (ex: `id="comment-{id}"`). Posso prosseguir com essa alteração nos componentes?
