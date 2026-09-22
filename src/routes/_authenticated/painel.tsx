import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Factory,
  FileText,
  PiggyBank,
  Truck,
  Wallet,
} from "lucide-react";
import { useMateriais, usePagamentosTodos, usePedidos, useClientes } from "@/lib/dados";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, diasAte, hojeISO, numeroBR } from "@/lib/format";
import { PageHeader } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { rotulo, STATUS_PEDIDO, tomStatusPedido } from "@/lib/dominio";
import type { Orcamento } from "@/lib/tipos";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ateliê" },
      { name: "description", content: "Visão do dia: pedidos, prazos, pagamentos e estoque." },
      { property: "og:title", content: "Dashboard — Ateliê" },
      { property: "og:description", content: "Visão do dia: pedidos, prazos, pagamentos e estoque." },
    ],
  }),
  component: Painel,
});

function Cartao({
  titulo,
  valor,
  icone: Icone,
  destaque,
}: {
  titulo: string;
  valor: string;
  icone: typeof FileText;
  destaque?: "alerta" | "sucesso";
}) {
  return (
    <div className="card-artesanal p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {titulo}
        </span>
        <Icone
          className={
            destaque === "alerta"
              ? "size-4 text-destructive"
              : destaque === "sucesso"
                ? "size-4 text-success"
                : "size-4 text-primary"
          }
        />
      </div>
      <p className="mt-2 font-display text-2xl">{valor}</p>
    </div>
  );
}

function Painel() {
  const { data: pedidos = [], isLoading } = usePedidos();
  const { data: pagamentos = [] } = usePagamentosTodos();
  const { data: materiais = [] } = useMateriais();
  const { data: clientes = [] } = useClientes();
  const { data: orcamentos = [] } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("numero", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Orcamento[];
    },
  });

  const nomeCliente = (id: string | null) => clientes.find((c) => c.id === id)?.nome ?? "Sem cliente";

  const pagoPorPedido = new Map<string, number>();
  for (const p of pagamentos) {
    pagoPorPedido.set(p.pedido_id, (pagoPorPedido.get(p.pedido_id) ?? 0) + Number(p.valor));
  }

  const ativos = pedidos.filter((p) => p.status !== "cancelado");
  const naoEntregues = ativos.filter((p) => p.status !== "entregue");
  const atrasados = naoEntregues.filter((p) => (diasAte(p.data_entrega) ?? 99) < 0);
  const proximos = naoEntregues.filter((p) => {
    const d = diasAte(p.data_entrega);
    return d !== null && d >= 0 && d <= 3;
  });
  const hoje = hojeISO();
  const entregasHoje = naoEntregues.filter((p) => p.data_entrega === hoje);

  const porStatus = (s: string) => ativos.filter((p) => p.status === s);
  const aguardandoResposta = orcamentos.filter((o) =>
    ["enviado", "aguardando_aprovacao"].includes(o.status),
  );

  const totalEmAberto = naoEntregues.reduce((t, p) => t + Number(p.valor_total), 0);
  const totalRecebido = pagamentos.reduce((t, p) => t + Number(p.valor), 0);
  const totalPendente = ativos.reduce(
    (t, p) => t + Math.max(0, Number(p.valor_total) - (pagoPorPedido.get(p.id) ?? 0)),
    0,
  );

  const materiaisBaixos = materiais.filter(
    (m) => Number(m.quantidade_atual) <= Number(m.estoque_minimo),
  );
  const pagamentosPendentes = ativos.filter(
    (p) => Number(p.valor_total) - (pagoPorPedido.get(p.id) ?? 0) > 0.009 && p.status !== "cancelado",
  );
  const paraProduzir = ativos.filter((p) =>
    ["confirmado", "aguardando_producao", "em_producao"].includes(p.status),
  );

  return (
    <div>
      <PageHeader
        titulo="Bom trabalho hoje ✨"
        descricao={
          isLoading ? "Carregando..." : `${dataBR(hoje)} · ${ativos.length} pedidos ativos no ateliê`
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cartao titulo="Orçamentos aguardando" valor={String(aguardandoResposta.length)} icone={FileText} />
        <Cartao titulo="Pedidos novos" valor={String(porStatus("confirmado").length)} icone={CheckCircle2} />
        <Cartao titulo="Em produção" valor={String(porStatus("em_producao").length)} icone={Factory} />
        <Cartao titulo="Prontos" valor={String(porStatus("pronto").length)} icone={CheckCircle2} destaque="sucesso" />
        <Cartao titulo="Próximos do prazo" valor={String(proximos.length)} icone={CalendarClock} />
        <Cartao titulo="Atrasados" valor={String(atrasados.length)} icone={AlertTriangle} destaque="alerta" />
        <Cartao titulo="Aguardando pagamento" valor={String(porStatus("aguardando_pagamento").length)} icone={Wallet} />
        <Cartao titulo="Entregas de hoje" valor={String(entregasHoje.length)} icone={Truck} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Cartao titulo="Pedidos em aberto" valor={brl(totalEmAberto)} icone={PiggyBank} />
        <Cartao titulo="Valor recebido" valor={brl(totalRecebido)} icone={Wallet} destaque="sucesso" />
        <Cartao titulo="Valor pendente" valor={brl(totalPendente)} icone={Wallet} destaque="alerta" />
      </div>

      <section className="card-artesanal mt-6 p-5">
        <h2 className="font-display text-xl">O que preciso fazer hoje</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tudo o que precisa da sua atenção, em um só lugar.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Bloco titulo="Produzir" vazio="Nenhum pedido aguardando produção.">
            {paraProduzir.map((p) => (
              <LinhaPedido
                key={p.id}
                id={p.id}
                numero={p.numero}
                cliente={nomeCliente(p.cliente_id)}
                entrega={p.data_entrega}
                status={p.status}
              />
            ))}
          </Bloco>

          <Bloco titulo="Prazos" vazio="Nenhum prazo apertado por enquanto.">
            {[...atrasados, ...proximos].map((p) => (
              <LinhaPedido
                key={p.id}
                id={p.id}
                numero={p.numero}
                cliente={nomeCliente(p.cliente_id)}
                entrega={p.data_entrega}
                status={p.status}
              />
            ))}
          </Bloco>

          <Bloco titulo="Pagamentos pendentes" vazio="Nenhum valor a receber.">
            {pagamentosPendentes.map((p) => (
              <Link
                key={p.id}
                to="/pedidos/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent/40"
              >
                <span>
                  #{p.numero} · {nomeCliente(p.cliente_id)}
                </span>
                <span className="font-medium text-destructive">
                  {brl(Number(p.valor_total) - (pagoPorPedido.get(p.id) ?? 0))}
                </span>
              </Link>
            ))}
          </Bloco>

          <Bloco titulo="Materiais abaixo do mínimo" vazio="Estoque em dia.">
            {materiaisBaixos.map((m) => (
              <Link
                key={m.id}
                to="/estoque"
                className="flex items-center justify-between gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm"
              >
                <span>⚠️ {m.nome}</span>
                <span className="text-muted-foreground">
                  {numeroBR(m.quantidade_atual)} {m.unidade} (mín. {numeroBR(m.estoque_minimo)})
                </span>
              </Link>
            ))}
          </Bloco>
        </div>
      </section>
    </div>
  );
}

function Bloco({
  titulo,
  vazio,
  children,
}: {
  titulo: string;
  vazio: string;
  children: React.ReactNode;
}) {
  const vazioDeVerdade = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {titulo}
      </h3>
      {vazioDeVerdade ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          {vazio}
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function LinhaPedido({
  id,
  numero,
  cliente,
  entrega,
  status,
}: {
  id: string;
  numero: number;
  cliente: string;
  entrega: string | null;
  status: string;
}) {
  const dias = diasAte(entrega);
  return (
    <Link
      to="/pedidos/$id"
      params={{ id }}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent/40"
    >
      <span className="font-medium">
        #{numero} · {cliente}
      </span>
      <span className="flex items-center gap-2">
        <StatusBadge tom={tomStatusPedido(status)}>{rotulo(STATUS_PEDIDO, status)}</StatusBadge>
        <span className={dias !== null && dias < 0 ? "text-destructive" : "text-muted-foreground"}>
          {entrega ? dataBR(entrega) : "sem prazo"}
          {dias !== null && dias < 0 ? ` (${Math.abs(dias)}d atrasado)` : ""}
        </span>
      </span>
    </Link>
  );
}
