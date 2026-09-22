-- ============ CONFIGURAÇÕES ============
create table public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null default 'Meu Ateliê',
  percentual_lucro_padrao numeric not null default 50,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.configuracoes to authenticated;
grant all on public.configuracoes to service_role;
alter table public.configuracoes enable row level security;
create policy "auth_all_configuracoes" on public.configuracoes for all to authenticated using (true) with check (true);

-- ============ CLIENTES ============
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text,
  instagram text,
  endereco text,
  observacoes text,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
create index clientes_whatsapp_idx on public.clientes (whatsapp);
grant select, insert, update, delete on public.clientes to authenticated;
grant all on public.clientes to service_role;
alter table public.clientes enable row level security;
create policy "auth_all_clientes" on public.clientes for all to authenticated using (true) with check (true);

-- ============ MATERIAIS ============
create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default 'outro',
  unidade text not null default 'unidade',
  quantidade_atual numeric not null default 0,
  estoque_minimo numeric not null default 0,
  custo_unitario numeric not null default 0,
  fornecedor text,
  observacoes text,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.materiais to authenticated;
grant all on public.materiais to service_role;
alter table public.materiais enable row level security;
create policy "auth_all_materiais" on public.materiais for all to authenticated using (true) with check (true);

-- ============ HISTÓRICO DE CUSTOS ============
create table public.custos_materiais (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materiais(id) on delete cascade,
  quantidade_comprada numeric not null default 0,
  valor_pago numeric not null default 0,
  custo_unitario numeric not null default 0,
  vigente_desde timestamptz not null default now(),
  observacao text,
  criado_em timestamptz not null default now()
);
create index custos_materiais_material_idx on public.custos_materiais (material_id, vigente_desde desc);
grant select, insert, update, delete on public.custos_materiais to authenticated;
grant all on public.custos_materiais to service_role;
alter table public.custos_materiais enable row level security;
create policy "auth_all_custos_materiais" on public.custos_materiais for all to authenticated using (true) with check (true);

-- ============ PRODUTOS ============
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default 'vela',
  descricao text,
  ficha_tecnica text,
  ativo boolean not null default true,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.produtos to authenticated;
grant all on public.produtos to service_role;
alter table public.produtos enable row level security;
create policy "auth_all_produtos" on public.produtos for all to authenticated using (true) with check (true);

-- ============ RECEITAS ============
create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  nome text not null default 'Receita padrão',
  rendimento numeric not null default 1,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.receitas to authenticated;
grant all on public.receitas to service_role;
alter table public.receitas enable row level security;
create policy "auth_all_receitas" on public.receitas for all to authenticated using (true) with check (true);

create table public.receita_materiais (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references public.receitas(id) on delete cascade,
  material_id uuid not null references public.materiais(id) on delete restrict,
  quantidade numeric not null default 0
);
grant select, insert, update, delete on public.receita_materiais to authenticated;
grant all on public.receita_materiais to service_role;
alter table public.receita_materiais enable row level security;
create policy "auth_all_receita_materiais" on public.receita_materiais for all to authenticated using (true) with check (true);

-- ============ KITS ============
create table public.kits (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.kits to authenticated;
grant all on public.kits to service_role;
alter table public.kits enable row level security;
create policy "auth_all_kits" on public.kits for all to authenticated using (true) with check (true);

create table public.kit_componentes (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  material_id uuid references public.materiais(id) on delete set null,
  descricao text not null,
  quantidade numeric not null default 1
);
grant select, insert, update, delete on public.kit_componentes to authenticated;
grant all on public.kit_componentes to service_role;
alter table public.kit_componentes enable row level security;
create policy "auth_all_kit_componentes" on public.kit_componentes for all to authenticated using (true) with check (true);

-- ============ OUTROS CUSTOS (catálogo) ============
create table public.outros_custos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default 'outro',
  valor numeric not null default 0,
  no_custo_interno boolean not null default true,
  repassado_cliente boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.outros_custos to authenticated;
grant all on public.outros_custos to service_role;
alter table public.outros_custos enable row level security;
create policy "auth_all_outros_custos" on public.outros_custos for all to authenticated using (true) with check (true);

-- ============ ORÇAMENTOS ============
create sequence public.orcamento_numero_seq start 1;
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.orcamento_numero_seq'),
  cliente_id uuid references public.clientes(id) on delete set null,
  data date not null default current_date,
  canal text not null default 'whatsapp',
  data_entrega_desejada date,
  status text not null default 'novo',
  observacoes text,
  custo_materiais numeric not null default 0,
  outros_custos_valor numeric not null default 0,
  custo_total numeric not null default 0,
  percentual_lucro numeric not null default 50,
  preco_sugerido numeric not null default 0,
  preco_final numeric not null default 0,
  preco_manual boolean not null default false,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.orcamentos to authenticated;
grant all on public.orcamentos to service_role;
alter table public.orcamentos enable row level security;
create policy "auth_all_orcamentos" on public.orcamentos for all to authenticated using (true) with check (true);

create table public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  categoria text not null default 'vela',
  produto_id uuid references public.produtos(id) on delete set null,
  kit_id uuid references public.kits(id) on delete set null,
  descricao text not null default '',
  formato text,
  cor text,
  essencia text,
  tamanho text,
  quantidade numeric not null default 1,
  personalizacao text,
  texto text,
  observacoes text,
  foto_url text,
  custo_unitario numeric not null default 0,
  custo_total numeric not null default 0,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.orcamento_itens to authenticated;
grant all on public.orcamento_itens to service_role;
alter table public.orcamento_itens enable row level security;
create policy "auth_all_orcamento_itens" on public.orcamento_itens for all to authenticated using (true) with check (true);

-- ============ PEDIDOS ============
create sequence public.pedido_numero_seq start 100;
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.pedido_numero_seq'),
  orcamento_id uuid references public.orcamentos(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete set null,
  data date not null default current_date,
  data_entrega date,
  canal text not null default 'whatsapp',
  status text not null default 'confirmado',
  valor_total numeric not null default 0,
  custo_materiais numeric not null default 0,
  custo_total numeric not null default 0,
  forma_pagamento text,
  observacoes text,
  entregue_em timestamptz,
  entrega_observacao text,
  estoque_baixado boolean not null default false,
  demo boolean not null default false,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.pedidos to authenticated;
grant all on public.pedidos to service_role;
alter table public.pedidos enable row level security;
create policy "auth_all_pedidos" on public.pedidos for all to authenticated using (true) with check (true);

create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  categoria text not null default 'vela',
  produto_id uuid references public.produtos(id) on delete set null,
  kit_id uuid references public.kits(id) on delete set null,
  descricao text not null default '',
  formato text,
  cor text,
  essencia text,
  tamanho text,
  quantidade numeric not null default 1,
  quantidade_produzida numeric not null default 0,
  status_producao text not null default 'aguardando',
  personalizacao text,
  texto text,
  observacoes text,
  foto_url text,
  custo_unitario numeric not null default 0,
  custo_total numeric not null default 0,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.pedido_itens to authenticated;
grant all on public.pedido_itens to service_role;
alter table public.pedido_itens enable row level security;
create policy "auth_all_pedido_itens" on public.pedido_itens for all to authenticated using (true) with check (true);

create table public.pedido_checklist (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  etapa text not null,
  ordem integer not null default 0,
  concluido boolean not null default false,
  concluido_em timestamptz
);
grant select, insert, update, delete on public.pedido_checklist to authenticated;
grant all on public.pedido_checklist to service_role;
alter table public.pedido_checklist enable row level security;
create policy "auth_all_pedido_checklist" on public.pedido_checklist for all to authenticated using (true) with check (true);

-- ============ PAGAMENTOS ============
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  valor numeric not null default 0,
  data date not null default current_date,
  forma text,
  observacao text,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.pagamentos to authenticated;
grant all on public.pagamentos to service_role;
alter table public.pagamentos enable row level security;
create policy "auth_all_pagamentos" on public.pagamentos for all to authenticated using (true) with check (true);

-- ============ ESTOQUE ============
create table public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materiais(id) on delete cascade,
  tipo text not null default 'saida',
  quantidade numeric not null default 0,
  pedido_id uuid references public.pedidos(id) on delete set null,
  observacao text,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.movimentacoes_estoque to authenticated;
grant all on public.movimentacoes_estoque to service_role;
alter table public.movimentacoes_estoque enable row level security;
create policy "auth_all_mov_estoque" on public.movimentacoes_estoque for all to authenticated using (true) with check (true);

-- ============ HISTÓRICO ============
create table public.historico_pedidos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references public.pedidos(id) on delete cascade,
  orcamento_id uuid references public.orcamentos(id) on delete cascade,
  evento text not null,
  detalhe text,
  criado_em timestamptz not null default now()
);
create index historico_pedido_idx on public.historico_pedidos (pedido_id, criado_em desc);
create index historico_orcamento_idx on public.historico_pedidos (orcamento_id, criado_em desc);
grant select, insert, update, delete on public.historico_pedidos to authenticated;
grant all on public.historico_pedidos to service_role;
alter table public.historico_pedidos enable row level security;
create policy "auth_all_historico" on public.historico_pedidos for all to authenticated using (true) with check (true);

-- ============ CUSTO DE MATERIAL: histórico automático ============
create or replace function public.registrar_custo_material()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (new.custo_unitario is distinct from old.custo_unitario) then
    insert into public.custos_materiais (material_id, custo_unitario, vigente_desde)
    values (new.id, new.custo_unitario, now());
  end if;
  return new;
end;
$$;

create trigger trg_custo_material
after insert or update of custo_unitario on public.materiais
for each row execute function public.registrar_custo_material();

-- configuração inicial
insert into public.configuracoes (nome_empresa, percentual_lucro_padrao) values ('Meu Ateliê', 50);