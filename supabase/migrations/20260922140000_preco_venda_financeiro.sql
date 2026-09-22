-- Planejamento Lumme: preço de venda persistido no catálogo.
alter table public.produtos
  add column if not exists preco_venda numeric(12,2) not null default 0;
