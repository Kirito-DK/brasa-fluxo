import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Cliente,
  Configuracoes,
  Kit,
  KitComponente,
  Material,
  OutroCusto,
  Pedido,
  Produto,
} from "@/lib/tipos";

async function pegar<T>(tabela: string, colunas = "*", ordem?: string): Promise<T[]> {
  let q = supabase.from(tabela).select(colunas);
  if (ordem) q = q.order(ordem);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as T[];
}

export const useClientes = () =>
  useQuery({ queryKey: ["clientes"], queryFn: () => pegar<Cliente>("clientes", "*", "nome") });

export const useMateriais = () =>
  useQuery({ queryKey: ["materiais"], queryFn: () => pegar<Material>("materiais", "*", "nome") });

export const useProdutos = () =>
  useQuery({ queryKey: ["produtos"], queryFn: () => pegar<Produto>("produtos", "*", "nome") });

export const useKits = () =>
  useQuery({ queryKey: ["kits"], queryFn: () => pegar<Kit>("kits", "*", "nome") });

export const useKitComponentes = () =>
  useQuery({
    queryKey: ["kit_componentes"],
    queryFn: () => pegar<KitComponente>("kit_componentes"),
  });

export const useOutrosCustos = () =>
  useQuery({
    queryKey: ["outros_custos"],
    queryFn: () => pegar<OutroCusto>("outros_custos", "*", "nome"),
  });

export const usePedidos = () =>
  useQuery({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("numero", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Pedido[];
    },
  });

export const useConfiguracoes = () =>
  useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracoes").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Configuracoes | null;
    },
  });

export const usePagamentosTodos = () =>
  useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .order("data", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; pedido_id: string; valor: number; data: string; forma: string | null; observacao: string | null }[];
    },
  });
