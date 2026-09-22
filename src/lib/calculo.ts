import { supabase } from "@/integrations/supabase/client";

export type ReceitaCusto = {
  produtoId: string;
  custoUnitario: number;
  materiais: { materialId: string; nome: string; quantidade: number; unidade: string }[];
};

/** Mapa produtoId -> custo unitário de materiais, calculado a partir das receitas e custos vigentes. */
export async function carregarCustosProdutos(): Promise<Record<string, ReceitaCusto>> {
  const [{ data: receitas }, { data: materiais }] = await Promise.all([
    supabase.from("receitas").select("id, produto_id, rendimento, receita_materiais(material_id, quantidade)"),
    supabase.from("materiais").select("id, nome, custo_unitario, unidade"),
  ]);

  const matById = new Map((materiais ?? []).map((m) => [m.id, m]));
  const mapa: Record<string, ReceitaCusto> = {};

  for (const r of receitas ?? []) {
    const itens = (r.receita_materiais ?? []) as { material_id: string; quantidade: number }[];
    const rendimento = Number(r.rendimento) || 1;
    let custo = 0;
    const detalhes: ReceitaCusto["materiais"] = [];
    for (const it of itens) {
      const m = matById.get(it.material_id);
      if (!m) continue;
      const qtd = Number(it.quantidade) / rendimento;
      custo += qtd * Number(m.custo_unitario);
      detalhes.push({ materialId: m.id, nome: m.nome, quantidade: qtd, unidade: m.unidade });
    }
    mapa[r.produto_id] = { produtoId: r.produto_id, custoUnitario: custo, materiais: detalhes };
  }
  return mapa;
}

export type ComponenteKit = {
  kit_id: string;
  produto_id: string | null;
  material_id: string | null;
  quantidade: number;
  descricao: string;
};

/** Custo unitário de um kit = soma dos componentes (produtos via receita + materiais diretos). */
export function custoKit(
  componentes: ComponenteKit[],
  custosProdutos: Record<string, ReceitaCusto>,
  custosMateriais: Record<string, number>,
): number {
  return componentes.reduce((total, c) => {
    const qtd = Number(c.quantidade) || 0;
    if (c.produto_id) return total + qtd * (custosProdutos[c.produto_id]?.custoUnitario ?? 0);
    if (c.material_id) return total + qtd * (custosMateriais[c.material_id] ?? 0);
    return total;
  }, 0);
}

export function precoSugerido(custoTotal: number, percentual: number): number {
  return custoTotal * (1 + (Number(percentual) || 0) / 100);
}

export function lucroEstimado(precoFinal: number, custoTotal: number): number {
  return Number(precoFinal || 0) - Number(custoTotal || 0);
}

/** Consumo de materiais necessário para um conjunto de itens de pedido. */
export type LinhaConsumo = { materialId: string; nome: string; unidade: string; quantidade: number };

export function consumoDeItens(
  itens: { produto_id: string | null; kit_id: string | null; quantidade: number }[],
  custosProdutos: Record<string, ReceitaCusto>,
  componentesKits: Record<string, ComponenteKit[]>,
  materiaisById: Record<string, { nome: string; unidade: string }>,
): LinhaConsumo[] {
  const acc = new Map<string, LinhaConsumo>();

  const somar = (materialId: string, quantidade: number) => {
    const info = materiaisById[materialId];
    if (!info) return;
    const atual = acc.get(materialId);
    if (atual) atual.quantidade += quantidade;
    else acc.set(materialId, { materialId, nome: info.nome, unidade: info.unidade, quantidade });
  };

  const somarProduto = (produtoId: string, multiplicador: number) => {
    const receita = custosProdutos[produtoId];
    if (!receita) return;
    for (const m of receita.materiais) somar(m.materialId, m.quantidade * multiplicador);
  };

  for (const item of itens) {
    const qtd = Number(item.quantidade) || 0;
    if (item.produto_id) somarProduto(item.produto_id, qtd);
    if (item.kit_id) {
      for (const c of componentesKits[item.kit_id] ?? []) {
        const q = (Number(c.quantidade) || 0) * qtd;
        if (c.produto_id) somarProduto(c.produto_id, q);
        else if (c.material_id) somar(c.material_id, q);
      }
    }
  }

  return [...acc.values()].sort((a, b) => a.nome.localeCompare(b.nome));
}
