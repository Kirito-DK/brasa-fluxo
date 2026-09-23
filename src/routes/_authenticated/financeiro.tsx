import {createFileRoute} from "@tanstack/react-router";
import {useMemo,useState} from "react";
import {PageHeader} from "@/components/layout/AppShell";
import {useAppData,money,clienteNome} from "@/lib/appStore";

export const Route=createFileRoute("/_authenticated/financeiro")({component:Financeiro});
function Financeiro(){
 const d=useAppData(); const hoje=new Date(); const [mes,setMes]=useState(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`);
 const ativos=d.pedidos.filter(p=>p.status!=="cancelado");
 const total=ativos.reduce((s,p)=>s+p.total,0), pago=ativos.reduce((s,p)=>s+p.pago,0);
 const recebimentos=d.pagamentos.filter(pg=>{const pedido=d.pedidos.find(p=>p.id===pg.pedidoId); return pedido?.status!=="cancelado" && pg.data?.slice(0,7)===mes;}).sort((a,b)=>b.data.localeCompare(a.data));
 const mensal=useMemo(()=>{const map=new Map<string,number>();d.pagamentos.forEach(pg=>{const pedido=d.pedidos.find(p=>p.id===pg.pedidoId);if(pedido?.status==="cancelado")return;const k=pg.data?.slice(0,7)||"Sem data";map.set(k,(map.get(k)||0)+Number(pg.valor||0));});return [...map.entries()].sort((a,b)=>b[0].localeCompare(a[0]));},[d.pagamentos,d.pedidos]);
 const fmt=(m:string)=>{if(m==="Sem data")return m;const [y,mo]=m.split("-");return `${mo}/${y}`};
 return <><PageHeader titulo="Financeiro" descricao="Vendas, recebimentos e histórico por período"/>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="card-artesanal p-5"><span className="text-xs text-muted-foreground">Vendas ativas</span><b className="mt-2 block font-display text-2xl">{money(total)}</b></div><div className="card-artesanal p-5"><span className="text-xs text-muted-foreground">Recebido</span><b className="mt-2 block font-display text-2xl">{money(pago)}</b></div><div className="card-artesanal p-5"><span className="text-xs text-muted-foreground">Pendente</span><b className="mt-2 block font-display text-2xl text-destructive">{money(Math.max(0,total-pago))}</b></div></div>
  <div className="grid gap-5 lg:grid-cols-2 mt-5"><section className="card-artesanal p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl">Recebimentos por mês</h2><input type="month" value={mes} onChange={e=>setMes(e.target.value)} className="h-9 rounded border bg-background px-2 text-sm"/></div><div className="mt-3 space-y-2">{mensal.map(([m,v])=><button key={m} onClick={()=>setMes(m)} className={`flex w-full justify-between rounded bg-muted p-3 text-left text-sm ${m===mes?"ring-2 ring-primary":""}`}><span>{fmt(m)}</span><b>{money(v)}</b></button>)}{!mensal.length&&<p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>}</div></section>
  <section className="card-artesanal p-5"><h2 className="font-display text-xl">Recebimentos de {fmt(mes)}</h2><div className="mt-3 space-y-2">{recebimentos.map(pg=><div className="rounded bg-muted p-3 text-sm" key={pg.id}><div className="flex justify-between gap-3"><span>{pg.data} · {pg.forma||"Não informado"}</span><b>{money(pg.valor)}</b></div><p className="text-xs text-muted-foreground">{clienteNome(d,d.pedidos.find(p=>p.id===pg.pedidoId)?.clienteId||"")} · Pedido #{d.pedidos.find(p=>p.id===pg.pedidoId)?.numero}</p>{pg.observacao&&<p className="text-xs">{pg.observacao}</p>}</div>)}{!recebimentos.length&&<p className="text-sm text-muted-foreground">Nenhum recebimento neste mês.</p>}</div></section></div>
  <div className="card-artesanal mt-5 p-5"><h2 className="font-display text-xl">Contas a receber</h2><p className="text-xs text-muted-foreground mt-1">Pedidos cancelados não entram nos totais financeiros.</p><div className="mt-3 space-y-2">{ativos.filter(p=>p.total>p.pago).map(p=><div className="flex justify-between rounded bg-muted p-3 text-sm" key={p.id}><span>#{p.numero} · {clienteNome(d,p.clienteId)}</span><b>{money(p.total-p.pago)}</b></div>)}</div></div>
 </>;
}
