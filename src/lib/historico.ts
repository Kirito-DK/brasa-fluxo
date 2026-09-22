import { supabase } from "@/integrations/supabase/client";

export async function registrarEvento(params: {
  pedidoId?: string | null;
  orcamentoId?: string | null;
  evento: string;
  detalhe?: string | null;
}) {
  await supabase.from("historico_pedidos").insert({
    pedido_id: params.pedidoId ?? null,
    orcamento_id: params.orcamentoId ?? null,
    evento: params.evento,
    detalhe: params.detalhe ?? null,
  });
}
