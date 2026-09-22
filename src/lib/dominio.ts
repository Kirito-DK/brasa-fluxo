export const CANAIS = [
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "instagram", rotulo: "Instagram" },
  { valor: "outro", rotulo: "Outro" },
] as const;

export const STATUS_ORCAMENTO = [
  { valor: "novo", rotulo: "Novo" },
  { valor: "em_preparacao", rotulo: "Em preparação" },
  { valor: "enviado", rotulo: "Enviado" },
  { valor: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { valor: "aprovado", rotulo: "Aprovado" },
  { valor: "recusado", rotulo: "Recusado" },
  { valor: "expirado", rotulo: "Expirado" },
  { valor: "convertido", rotulo: "Convertido em pedido" },
] as const;

export const STATUS_PEDIDO = [
  { valor: "confirmado", rotulo: "Confirmado" },
  { valor: "aguardando_producao", rotulo: "Aguardando produção" },
  { valor: "em_producao", rotulo: "Em produção" },
  { valor: "pronto", rotulo: "Pronto" },
  { valor: "aguardando_pagamento", rotulo: "Aguardando pagamento" },
  { valor: "pago", rotulo: "Pago" },
  { valor: "entregue", rotulo: "Entregue" },
  { valor: "cancelado", rotulo: "Cancelado" },
] as const;

export const CATEGORIAS_ITEM = [
  { valor: "vela", rotulo: "Vela" },
  { valor: "gesso", rotulo: "Gesso" },
  { valor: "kit", rotulo: "Kit" },
  { valor: "outro", rotulo: "Outro" },
] as const;

export const CATEGORIAS_PRODUTO = [
  { valor: "vela", rotulo: "Velas" },
  { valor: "gesso", rotulo: "Gesso" },
  { valor: "kit", rotulo: "Kits" },
  { valor: "outro", rotulo: "Outros" },
] as const;

export const UNIDADES = ["g", "kg", "ml", "litro", "unidade", "metro"] as const;

export const CATEGORIAS_MATERIAL = [
  "cera",
  "essencia",
  "pavio",
  "corante",
  "gesso",
  "pigmento",
  "recipiente",
  "tampa",
  "etiqueta",
  "caixa",
  "sacola",
  "fita",
  "outro",
] as const;

export const TIPOS_OUTRO_CUSTO = [
  "mao_de_obra",
  "embalagem",
  "taxa",
  "frete",
  "personalizacao",
  "outro",
] as const;

export const ETAPAS_CHECKLIST = [
  "Materiais separados",
  "Produção realizada",
  "Acabamento",
  "Personalização",
  "Embalagem",
  "Conferência",
  "Pedido pronto",
];

export const FORMAS_PAGAMENTO = ["Pix", "Dinheiro", "Cartão", "Transferência", "Outro"];

export function rotulo(lista: readonly { valor: string; rotulo: string }[], valor: string): string {
  return lista.find((i) => i.valor === valor)?.rotulo ?? valor;
}

export function rotuloSimples(valor: string | null | undefined): string {
  if (!valor) return "—";
  return valor.charAt(0).toUpperCase() + valor.slice(1).replace(/_/g, " ");
}

export type TomBadge = "neutro" | "andamento" | "sucesso" | "alerta" | "perigo";

export function tomStatusPedido(status: string): TomBadge {
  switch (status) {
    case "entregue":
    case "pago":
      return "sucesso";
    case "em_producao":
    case "confirmado":
      return "andamento";
    case "pronto":
    case "aguardando_pagamento":
      return "alerta";
    case "cancelado":
      return "perigo";
    default:
      return "neutro";
  }
}

export function tomStatusOrcamento(status: string): TomBadge {
  switch (status) {
    case "aprovado":
    case "convertido":
      return "sucesso";
    case "enviado":
    case "aguardando_aprovacao":
      return "alerta";
    case "recusado":
    case "expirado":
      return "perigo";
    case "em_preparacao":
      return "andamento";
    default:
      return "neutro";
  }
}
