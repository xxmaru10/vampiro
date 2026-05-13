---
title: Arquitetura do Sistema
description: Visão geral técnica da estrutura do Blinkmotion e fluxos de dados.
last_updated: 2026-04-27
status: estável
---

# 🏗️ Arquitetura

## Visão Geral
O sistema é composto por um frontend em React hospedado no subdiretório `site/blinkmotion-app`, consumindo serviços do Supabase para backend-as-a-service.

## Fluxo de Dados
1. **Autenticação**: Gerenciada pelo Supabase Auth através de hooks customizados (`useBlinkAuth`).
2. **Estado Global**: Gerenciado via React Context ou Hooks de Estado dentro da aplicação.
3. **Persistência**: Dados de RPG e perfis de usuário são armazenados em tabelas do Supabase.

## Divisão de Responsabilidades
- **Root**: Documentação AGDF e metadados do projeto.
- **site/blinkmotion-app/src**: Código fonte da aplicação.
  - `/hooks`: Lógica reutilizável (Ex: `useTerminalNavigation`, `useStatusRotator`).
  - `/components/SocialTerminal`: Elementos de interface do terminal cyberpunk.
  - `App.tsx`: Orquestrador principal da autenticação e layout social.

## Módulo Social Terminal (ST-002)
Implementado como um sistema de terminal interativo.
- **Estados**: Gerenciados via hooks customizados para desacoplar lógica de log e navegação.
- **Interface**: Baseada em linhas de comando e logs simulados para imersão.
- **Navegação**: Sistema de rotas internas baseadas em comandos numéricos/texto que atualizam o `currentPath` e preparam o `MainDisplay` para injeção de conteúdo.
