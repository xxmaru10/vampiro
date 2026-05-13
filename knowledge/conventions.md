---
title: Convenções e Regras
description: Padrões de desenvolvimento e diretrizes de "O que nunca fazer".
last_updated: 2026-04-27
status: ativo
---

# 📏 Convenções

## Nomenclatura
- **Arquivos React**: PascalCase para componentes (`Header.tsx`), camelCase para hooks (`useAuth.ts`).
- **Variáveis/Funções**: camelCase.
- **Pastas**: kebab-case.

## Padrões de Código
- Usar **TypeScript** estritamente; evitar o uso de `any`.
- Preferir **Componentes Funcionais** com Hooks.
- **Terminal Logic**: Sempre separar a lógica de processamento de comandos e rotação de estados em hooks customizados (`use...`) para manter os componentes de UI limpos.
- Centralizar chamadas de API em serviços ou hooks dedicados.

## 🚫 O que NUNCA fazer
1. **NUNCA** fazer varredura global (grep) sem alvo específico.
2. **NUNCA** ignorar o arquivo `AI.md`.
3. **NUNCA** subir segredos (chaves de API) no código.
4. **NUNCA** alterar a estrutura de pastas do AGDF sem autorização.
5. **NUNCA** escrever código sem confirmar o escopo primeiro.
