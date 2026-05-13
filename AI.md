---
title: Dashboard do Projeto
description: Hub central de documentação e controle de tarefas para agentes de IA.
last_updated: 2026-04-27
status: ativo
---

> ⚠️ **LEIA ANTES DE TUDO — BUG RECORRENTE**: Quando o usuário relatar "feature X não está aparecendo no site", **NÃO** assuma que o código está errado. O frontend é Vite/React em `site/blinkmotion-app/` e o navegador serve `dist/`. Em 2026-04-27 perdemos tempo debugando uma feature que **já existia no `src/`** mas estava ausente no `dist/` por falta de rebuild + erro de sintaxe silencioso. Siga o **🩺 Protocolo de Diagnóstico de Feature Ausente** abaixo antes de editar qualquer código.

# AI-Guided Development Framework (AGDF) - Blinkmotion / Vampiro

## 📝 Descrição do Projeto
Este projeto é uma aplicação web (Blinkmotion App) voltada para o suporte ao sistema de RPG "Vampiro". A aplicação utiliza React, Vite e Supabase para gerenciar autenticação, estados e possivelmente fichas ou interações de jogo.

## 🗺️ Mapa de Arquivos Críticos
| Documento | Caminho | Descrição |
| :--- | :--- | :--- |
| **Arquitetura** | [/knowledge/architecture.md](./knowledge/architecture.md) | Visão técnica do sistema e fluxo de dados. |
| **Stack Tecnológica** | [/knowledge/stack.md](./knowledge/stack.md) | Detalhes das tecnologias e versões utilizadas. |
| **Convenções** | [/knowledge/conventions.md](./knowledge/conventions.md) | Padrões de código e regras de "Nunca Fazer". |
| **Guia de IA** | [/knowledge/ai-usage.md](./knowledge/ai-usage.md) | Instruções de eficiência e economia de tokens. |

## 🚀 Épicos e Stories
### Épicos
- [ ] **EP-001: Configuração Inicial do Framework** - *Em andamento*
- [ ] **EP-002: Integração com Supabase** - *Pendente*

### Stories Ativas
- [x] ST-001: Estruturação das pastas /knowledge, /epics, /stories.
- [x] ST-002: Interface Terminal da Rede Social e Painel Admin
- [x] ST-003: Feed de Notícias Semanais e Painel Admin
- [ ] ST-004: Sistema de Comentários e Inserção em Massa *(pendente)*
- [ ] ST-005: Documentação da stack e arquitetura base.
- [x] ST-006: Melhorias no Sistema de Notificações e Identificação de Jogadores.

## 🏗️ Arquitetura de Camadas
- **Frontend (Vite/React)**: Localizado em `/site/blinkmotion-app`.
- **Backend (Supabase)**: Lógica de banco de dados e autenticação via SDK do Supabase.
- **Documentação (AGDF)**: Camada de governança para agentes de IA no root.

## 📜 Regras de Comportamento
1. **Leitura Obrigatória**: Sempre comece qualquer tarefa lendo este `AI.md`.
2. **Proibido Varredura Cega**: Não use `grep` ou busca global em todo o repositório sem necessidade. Use o Mapa de Arquivos Críticos.
3. **Gestão de Contexto**: Mantenha o uso de contexto entre **50-70%**. Se exceder, resuma as informações e limpe o histórico.
4. **Protocolo de Escopo**: Antes de qualquer implementação, confirme o escopo: *"Isso afeta o Core ou apenas um Módulo específico?"*.

## 🤝 Protocolo de Confirmação (OBRIGATÓRIO)
Antes de iniciar qualquer tarefa de codificação, a IA deve perguntar:
> **"Para confirmar o escopo: esta alteração afeta o Core do sistema ou apenas um Módulo/Componente específico? Existe algum impacto colateral previsto?"**

## 🩺 Protocolo de Diagnóstico de "Feature Ausente"
Quando o usuário disser "X não aparece", "botão sumiu", "tela não carrega Y" — **antes de editar código**, execute em ordem:

1. **Confirme onde a feature deveria estar no `src/`**
   - Use `Grep` em `site/blinkmotion-app/src/` pela string visível (ex.: label do botão, classe CSS).
   - Se não existir no `src/`, é uma nova feature: pare e crie story.
2. **Compare `src/` ↔ `dist/`** (build pode estar desatualizado)
   ```bash
   grep -o "STRING_DA_FEATURE" site/blinkmotion-app/dist/assets/*.js
   ```
   - Se a string existe no `src/` mas **não** no `dist/`: o build está velho.
3. **Antes de rebuildar, valide o TypeScript**
   ```bash
   cd site/blinkmotion-app && npx tsc --noEmit
   ```
   - O script `npm run build` é `tsc && vite build`: **se `tsc` falhar, o vite nem roda e o `dist/` antigo permanece intacto**, criando a ilusão de que tudo compilou. Sempre rode `tsc --noEmit` antes para flagrar erros silenciosos.
4. **Rebuilde e confirme**
   ```bash
   cd site/blinkmotion-app && npm run build
   grep -o "STRING_DA_FEATURE" site/blinkmotion-app/dist/assets/*.js
   ```
5. **Oriente o usuário** a fazer **Ctrl+F5** (hard refresh) — o navegador pode ter cacheado o bundle antigo.

**Sinais de que é stale build (não bug de código):**
- O hash do arquivo em `dist/assets/index-*.js` é antigo (verifique `mtime` com `ls -la`).
- A feature funciona em `npm run dev` mas não no `dist/`.
- Múltiplas features recentes "sumiram" simultaneamente.

## 🛠️ Regra de Build (OBRIGATÓRIA)
Toda edição em `site/blinkmotion-app/src/**` exige **rebuild + verificação** antes de declarar a tarefa concluída:
1. `npx tsc --noEmit` → zero erros.
2. `npm run build` → zero erros.
3. `grep` da string visível no novo bundle de `dist/assets/`.
4. Mencionar ao usuário que ele precisa de hard refresh.

**Nunca** confie que o `dist/` reflete o `src/` sem essa verificação.
