# Planejamento Lumme V6

V6 adiciona controle de estoque de materiais e cadastro de fornecedores, mantendo login e Supabase.

## Banco
Aplique a migration `supabase/migrations/20260923113000_estoque_fornecedores.sql` no banco do projeto Lovable/Supabase.

Ela cria `fornecedores`, liga materiais a fornecedores e amplia o histórico de movimentações de estoque.

## Funcionalidades
- Cadastro/edição/exclusão de fornecedores.
- Cadastro/edição/exclusão de materiais.
- Estoque mínimo e alerta visual.
- Entrada e saída de estoque.
- Fornecedor principal por material.
- Custo unitário do material.
- Histórico das movimentações no Supabase.
