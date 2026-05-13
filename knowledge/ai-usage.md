---
title: Guia de Uso da IA
description: Diretrizes para maximizar a eficiência e reduzir custos de tokens.
last_updated: 2026-04-27
status: ativo
---

# 🤖 Eficiência da IA

## Gestão de Tokens
- **Limpeza de Contexto**: Se a conversa ficar longa, peça ao usuário para resumir o progresso em um arquivo de história e inicie um novo chat se possível (ou limpe mentalmente o que for irrelevante).
- **Leitura Seletiva**: Não leia arquivos inteiros se apenas uma função for necessária. Use `view_file` com ranges de linhas.
- **Resumos**: Sempre que concluir uma tarefa grande, atualize o `AI.md` e a story correspondente para manter o estado atualizado sem precisar reler todo o histórico.

## Autonomia e Segurança
- Use ferramentas de terminal para verificar o estado real do sistema.
- Não assuma que arquivos existem; liste o diretório antes.
- Sempre valide mudanças críticas com o usuário.
漫
