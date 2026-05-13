---
title: Interface Terminal da Rede Social (Blinkmotion)
description: Implementação da página principal com estética de terminal cyberpunk, comandos de navegação e logs de conexão.
last_updated: 2026-04-27
status: estável
漫
---

# ST-002: Interface Terminal da Rede Social

## 🎯 Escopo
Esta tarefa foca na criação da UI base da rede social dentro do projeto `blinkmotion-app`. O objetivo é criar uma interface que simule um terminal de hacking/segurança de alto nível.

- **Tipo**: Frontend (Módulo Social)
- **Localização**: `site/blinkmotion-app/src/`

## 🗂️ Arquivos Afetados
- `src/hooks/useTerminalNavigation.ts`: Lógica de comandos e estados de navegação.
- `src/hooks/useStatusRotator.ts`: Lógica para as mensagens aleatórias do topo.
- `src/components/SocialTerminal/StatusHeader.tsx`: Barra superior com mensagens de segurança.
- `src/components/SocialTerminal/NavigationMenu.tsx`: Lista de comandos [1-4].
- `src/components/SocialTerminal/CommandConsole.tsx`: Input `command:` e logs de conexão.
- `src/components/SocialTerminal/MainDisplay.tsx`: Área preta vazia para conteúdo futuro.
- `src/App.tsx`: Orquestração dos novos componentes.

## ✅ Critérios de Aceitação
1. **Status Rotator**: No topo, mensagens como "criptografia reescrita" e "tentativas de acesso (x/45)" devem alternar ou atualizar visualmente.
2. **Menu de Comandos**: Exibir:
   - `[1] FEED`
   - `[2] MENSAGENS`
   - `[3] MERCADO_NEGRO`
   - `[4] DESCONECTAR`
3. **Console Interativo**: 
   - Ao digitar um número ou comando, exibir logs criativos (IPs, "connecting to via...", etc).
   - Atualizar a linha de navegação (ex: `/LOCAL_BROADCAST`).
4. **Área de Conteúdo**: Abaixo do console, manter uma área preta dedicada a componentes futuros.
5. **Arquitetura**: Uso obrigatório de Hooks para separar lógica de UI. Sem "god components".
6. **Estética**: Seguir o padrão visual "Blinkmotion" (Cores vibrantes sobre fundo escuro, fontes mono, micro-animações).

## 🤝 Protocolo de Confirmação
> **IA**: Story ST-002 criada. Esta alteração afeta o **Módulo Social** (Frontend). Posso começar a implementação dos componentes e hooks conforme planejado?
