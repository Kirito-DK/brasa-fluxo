export type Cliente = {
  id: string;
  nome: string;
  whatsapp: string | null;
  instagram: string | null;
  endereco: string | null;
  observacoes: string | null;
  demo: boolean;
  criado_em: string;
};

export type Material = {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade_atual: number;
  estoque_minimo: number;
  custo_unitario: number;
  fornecedor: string | null;
  observacoes: string | null;
  demo: boolean;
};

export type CustoMaterial = {
  id: string;
  material_id: string;
  quantidade_comprada: number;
  valor_pago: number;
  custo_unitario: number;
  vigente_desde: string;
  observacao: string | null;
};

export type Produto = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  ficha_tecnica: string | null;
  ativo: boolean;
  demo: boolean;
};

export type Kit = { id: string; nome: string; descricao: string | null; demo: boolean };

export type KitComponente = {
  id: string;
  kit_id: string;
  produto_id: string | null;
  material_id: string | null;
  descricao: string;
  quantidade: number;
};

export type Orcamento = {
  id: string;
  numero: number;
  cliente_id: string | null;
  data: string;
  canal: string;
  data_entrega_desejada: string | null;
  status: string;
  observacoes: string | null;
  custo_materiais: number;
  outros_custos_valor: number;
  custo_total: number;
  percentual_lucro: number;
  preco_sugerido: number;
  preco_final: number;
  preco_manual: boolean;
  demo: boolean;
  criado_em: string;
};

export type ItemBase = {
  id: string;
  categoria: string;
  produto_id: string | null;
  kit_id: string | null;
  descricao: string;
  formato: string | null;
  cor: string | null;
  essencia: string | null;
  tamanho: string | null;
  quantidade: number;
  personalizacao: string | null;
  texto: string | null;
  observacoes: string | null;
  foto_url: string | null;
  custo_unitario: number;
  custo_total: number;
};

export type OrcamentoItem = ItemBase & { orcamento_id: string };

export type PedidoItem = ItemBase & {
  pedido_id: string;
  quantidade_produzida: number;
  status_producao: string;
};

export type Pedido = {
  id: string;
  numero: number;
  orcamento_id: string | null;
  cliente_id: string | null;
  data: string;
  data_entrega: string | null;
  canal: string;
  status: string;
  valor_total: number;
  custo_materiais: number;
  custo_total: number;
  forma_pagamento: string | null;
  observacoes: string | null;
  entregue_em: string | null;
  entrega_observacao: string | null;
  estoque_baixado: boolean;
  demo: boolean;
  criado_em: string;
};

export type Pagamento = {
  id: string;
  pedido_id: string;
  valor: number;
  data: string;
  forma: string | null;
  observacao: string | null;
};

export type ChecklistItem = {
  id: string;
  pedido_id: string;
  etapa: string;
  ordem: number;
  concluido: boolean;
  concluido_em: string | null;
};

export type EventoHistorico = {
  id: string;
  pedido_id: string | null;
  orcamento_id: string | null;
  evento: string;
  detalhe: string | null;
  criado_em: string;
};

export type OutroCusto = {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  no_custo_interno: boolean;
  repassado_cliente: boolean;
};

export type Configuracoes = {
  id: string;
  nome_empresa: string;
  percentual_lucro_padrao: number;
};
