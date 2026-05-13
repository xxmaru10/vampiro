---
title: Feed de Notícias Semanais e Painel Admin
description: Implementação de um carrossel de notícias em tempo real no Feed e funcionalidades de gerenciamento no Painel Admin.
last_updated: 2026-04-27
status: concluído (com lições aprendidas pós-deploy)
---

# ST-003: Feed de Notícias Semanais e Painel Admin

## 🎯 Escopo
Adicionar uma seção de "Notícias da Semana" no topo do Feed (`/LOCAL_BROADCAST`). Esta seção será uma galeria horizontal (slider) de notícias inseridas em tempo real pelo administrador. Cada notícia conterá título, descrição, data e uma miniatura de imagem em ASCII. O administrador terá ferramentas para upload e exclusão dessas notícias.

- **Tipo**: Fullstack (Frontend + Supabase)
- **Localização**: `site/blinkmotion-app/src/` e Supabase Dashboard (DB/Storage)

## 🗂️ Arquivos Afetados
- `site/blinkmotion-app/src/components/SocialTerminal/WeeklyNews.tsx`: Novo componente para exibição do slider de notícias.
- `site/blinkmotion-app/src/components/SocialTerminal/AdminPanel.tsx`: Atualização para incluir o formulário de gerenciamento de notícias (upload/delete).
- `site/blinkmotion-app/src/components/SocialTerminal/MainDisplay.tsx`: Integração do componente `WeeklyNews` na rota do Feed.
- `site/blinkmotion-app/src/hooks/useNews.ts`: Novo hook para busca (fetch), upload e deleção de notícias via Supabase.
- `site/blinkmotion-app/src/lib/supabaseClient.ts`: Verificação/configuração de Storage se necessário.
- `database/migrations/20260427_create_news_table.sql`: Script SQL para criação da tabela `blink_news` e configuração de Storage.

## ✅ Critérios de Aceitação
1. **Componente de Notícias (Feed)**:
   - Exibir no topo da tela de Feed (`/LOCAL_BROADCAST`), abaixo do console de comandos.
   - Layout horizontal com setas de navegação (Slide).
   - Exibir: Título, Descrição, Data formatada e Miniatura ASCII.
   - Carregamento em tempo real (Realtime subscription opcional, ou fetch on mount).
2. **Painel Administrativo**:
   - Seção dedicada para "GERENCIAR NOTÍCIAS".
   - Formulário para upload: Título (texto), Descritiva (textarea), Imagem ASCII (upload de arquivo ou texto) e Data (automática ou manual).
   - Lista de notícias existentes com opção de "APAGAR".
3. **Gestão de Dados**:
   - Ao deletar uma notícia no banco, o arquivo de imagem ASCII associado no Storage também deve ser removido.
   - Tabela `blink_news` deve conter: `id`, `title`, `content`, `image_url`, `created_at`.
4. **Estética**:
   - Seguir o padrão visual Terminal Cyberpunk (fontes mono, bordas pixeladas, cores neon).
   - Imagens ASCII devem ser renderizadas respeitando a formatação de texto original (pre-wrap).

## 🤝 Protocolo de Confirmação
> **IA**: Story ST-003 criada. Esta alteração afeta o **Core de Dados** (Supabase) e o **Módulo Social** (Frontend). Para confirmar o escopo: as imagens ASCII mencionadas serão tratadas como arquivos de texto (.txt) ou imagens reais que o sistema processará? Existe algum limite de tamanho para essas notícias? Posso prosseguir com a criação da migração SQL após aprovação?

---

## 🐛 Lições Aprendidas (2026-04-27 — Pós-implementação)

### Sintoma reportado pelo usuário
- "No site não está aparecendo botão de salvar login"
- "Na tela de admin não está mostrando o painel de gerenciamento de feed"

### Causa raiz (não era bug de código)
1. **`dist/` desatualizado**: o bundle `index-Bt08kGVM.js` em produção precedeu as adições do checkbox `LEMBRAR_LOGIN_E_SENHA` ([App.tsx:131](../site/blinkmotion-app/src/App.tsx)) e das abas `[ GERENCIAR_NPCS ] / [ GERENCIAR_NOTICIAS ]` ([AdminPanel.tsx:130](../site/blinkmotion-app/src/components/SocialTerminal/AdminPanel.tsx)).
2. **Erro de sintaxe silencioso**: havia um `</div>` extra no fim de [AdminPanel.tsx:277](../site/blinkmotion-app/src/components/SocialTerminal/AdminPanel.tsx) que fazia o `tsc` falhar. Como `npm run build` é `tsc && vite build`, o vite **nunca rodava** e o `dist/` antigo persistia, criando a ilusão de que o build funcionava.
3. **Cache do navegador** poderia mascarar o fix mesmo após rebuild bem-sucedido.

### Correção aplicada
- Removido `</div>` órfão em `AdminPanel.tsx`.
- `npm run build` rodado com sucesso → novo bundle `index-E84ComFL.js`.
- Confirmado via `grep` que `LEMBRAR_LOGIN_E_SENHA`, `GERENCIAR_NPCS`, `GERENCIAR_NOTICIAS`, `admin-tabs` estão presentes no novo `dist/`.

### Regras para evitar reincidência
1. **Sempre rodar `npx tsc --noEmit` após editar `.tsx`** — flagra erros que `tsc && vite build` esconde quando o vite não chega a executar.
2. **Sempre verificar o bundle após `npm run build`**: `grep -o "STRING" dist/assets/*.js`.
3. **Quando o usuário reportar "feature ausente"**: seguir o **🩺 Protocolo de Diagnóstico** em `AI.md` antes de tocar em código.
4. **Nunca declarar uma feature do front-end "concluída" sem rebuild + grep no `dist/`**.
5. **Avisar o usuário sobre Ctrl+F5** ao entregar fixes de UI — caches enganam.

### Sugestões de melhoria estrutural (próximas stories)
- **ST-XXX**: Adicionar hook de pré-commit (`husky` + `lint-staged`) que roda `tsc --noEmit` para impedir commits com erro de tipo.
- **ST-XXX**: Adicionar versionamento visível no rodapé do app (lendo `package.json` ou hash do build) para o usuário conseguir confirmar qual build está vendo.
- **ST-XXX**: Adicionar etapa de CI que falha se `dist/` não bate com `src/` (ex.: `npm run build` no CI e `git diff --exit-code dist/`).
