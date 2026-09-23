-- Planejamento Lumme V6: fornecedores + estoque de materiais
create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  observacoes text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.fornecedores to authenticated;
grant all on public.fornecedores to service_role;
alter table public.fornecedores enable row level security;
drop policy if exists "auth_all_fornecedores" on public.fornecedores;
create policy "auth_all_fornecedores" on public.fornecedores for all to authenticated using (true) with check (true);

alter table public.materiais add column if not exists fornecedor_id uuid references public.fornecedores(id) on delete set null;
create index if not exists materiais_fornecedor_idx on public.materiais(fornecedor_id);

alter table public.movimentacoes_estoque add column if not exists fornecedor_id uuid references public.fornecedores(id) on delete set null;
alter table public.movimentacoes_estoque add column if not exists valor_total numeric not null default 0;
alter table public.movimentacoes_estoque add column if not exists custo_unitario numeric not null default 0;
alter table public.movimentacoes_estoque add column if not exists data_movimentacao date not null default current_date;
create index if not exists mov_estoque_material_data_idx on public.movimentacoes_estoque(material_id, criado_em desc);

-- Mantém o texto antigo de fornecedor utilizável, quando existir.
update public.materiais m
set fornecedor_id = f.id
from public.fornecedores f
where m.fornecedor_id is null
  and m.fornecedor is not null
  and trim(m.fornecedor) <> ''
  and lower(trim(f.nome)) = lower(trim(m.fornecedor));
