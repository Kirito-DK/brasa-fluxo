import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Cliente = { id:string; nome:string; telefone:string; email:string; endereco:string; observacao:string };
export type Produto = { id:string; nome:string; categoria:string; unidade:string; custo:number; preco:number; estoque:number; estoqueMin:number; ativo:boolean };
export type OrcamentoItem = { id:string; produtoId:string; descricao:string; quantidade:number; valor:number };
export type Orcamento = { id:string; numero:number; clienteId:string; data:string; validade:string; status:string; itens:OrcamentoItem[]; desconto:number; observacao:string };
export type PedidoItem = OrcamentoItem;
export type Pedido = { id:string; numero:number; clienteId:string; data:string; entrega:string; status:string; itens:PedidoItem[]; total:number; pago:number; observacao:string; checklist:string[]; entregueEm?:string };
export type Movimento = { id:string; produtoId:string; tipo:"entrada"|"saida"; quantidade:number; data:string; observacao:string };
export type Pagamento = { id:string; pedidoId:string; valor:number; data:string; forma:string; observacao:string };
export type AppData = { clientes:Cliente[]; produtos:Produto[]; orcamentos:Orcamento[]; pedidos:Pedido[]; movimentos:Movimento[]; pagamentos:Pagamento[]; configuracoes:{nome:string; telefone:string; whatsapp:string; email:string} };

const empty:AppData={clientes:[],produtos:[],orcamentos:[],pedidos:[],movimentos:[],pagamentos:[],configuracoes:{nome:"Meu Ateliê",telefone:"",whatsapp:"",email:""}};
let cache:AppData = structuredClone(empty);
let persisted:AppData = structuredClone(empty);
let loaded = false;
let loading: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
const listeners = new Set<()=>void>();

function emit(){ listeners.forEach(fn=>fn()); }
function clone<T>(v:T):T { return structuredClone(v); }
export function uid(prefix="id"){ return `${prefix}_${crypto.randomUUID()}`; }
export function getData(){ return cache; }
export function nextNumber(list:{numero:number}[], start=1){ return list.reduce((m,x)=>Math.max(m,x.numero),start-1)+1; }
export function money(n:number){ return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
export function clienteNome(data:AppData,id:string){ return data.clientes.find(c=>c.id===id)?.nome ?? "Sem cliente"; }
export function pedidoTotal(itens:OrcamentoItem[],desconto=0){ return Math.max(0,itens.reduce((s,i)=>s+i.quantidade*i.valor,0)-desconto); }

async function loadFromSupabase(){
  const [{data:clientes,error:e1},{data:produtos,error:e2},{data:materiais,error:e3},{data:orcamentos,error:e4},{data:oi,error:e5},{data:pedidos,error:e6},{data:pi,error:e7},{data:pagamentos,error:e8},{data:movimentos,error:e9},{data:check,error:e10},{data:config,error:e11}] = await Promise.all([
    supabase.from("clientes").select("*").order("criado_em",{ascending:false}),
    supabase.from("produtos").select("*").order("criado_em",{ascending:false}),
    supabase.from("materiais").select("*").order("criado_em",{ascending:false}),
    supabase.from("orcamentos").select("*").order("criado_em",{ascending:false}),
    supabase.from("orcamento_itens").select("*").order("criado_em"),
    supabase.from("pedidos").select("*").order("criado_em",{ascending:false}),
    supabase.from("pedido_itens").select("*").order("criado_em"),
    supabase.from("pagamentos").select("*"),
    supabase.from("movimentacoes_estoque").select("*"),
    supabase.from("pedido_checklist").select("*").order("ordem"),
    supabase.from("configuracoes").select("*").order("criado_em",{ascending:false}).limit(1),
  ]);
  const err=[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10,e11].find(Boolean);
  if(err) throw err;

  const mats = (materiais ?? []) as any[];
  const matById = new Map(mats.map(m=>[m.id,m]));
  const prods = (produtos ?? []) as any[];
  const uiProdutos:Produto[] = prods.map(p=>{
    const m=matById.get(p.id);
    return {id:p.id,nome:p.nome,categoria:p.categoria,unidade:m?.unidade??"un",custo:Number(m?.custo_unitario??0),preco:0,estoque:Number(m?.quantidade_atual??0),estoqueMin:Number(m?.estoque_minimo??0),ativo:Boolean(p.ativo)};
  });

  const orcItemBy = new Map<string,any[]>();
  for(const i of (oi??[]) as any[]) { const a=orcItemBy.get(i.orcamento_id)??[]; a.push(i); orcItemBy.set(i.orcamento_id,a); }
  const pedidoItemBy = new Map<string,any[]>();
  for(const i of (pi??[]) as any[]) { const a=pedidoItemBy.get(i.pedido_id)??[]; a.push(i); pedidoItemBy.set(i.pedido_id,a); }
  const checkBy = new Map<string,string[]>();
  for(const c of (check??[]) as any[]) { const a=checkBy.get(c.pedido_id)??[]; if(c.concluido) a.push(c.etapa); checkBy.set(c.pedido_id,a); }
  const paysBy = new Map<string,number>();
  for(const p of (pagamentos??[]) as any[]) paysBy.set(p.pedido_id,(paysBy.get(p.pedido_id)??0)+Number(p.valor??0));

  cache={
    clientes:(clientes??[]).map((c:any)=>({id:c.id,nome:c.nome,telefone:c.whatsapp??"",email:"",endereco:c.endereco??"",observacao:c.observacoes??""})),
    produtos:uiProdutos,
    orcamentos:(orcamentos??[]).map((o:any)=>({id:o.id,numero:o.numero,clienteId:o.cliente_id??"",data:o.data,validade:o.data_entrega_desejada??"",status:o.status,itens:(orcItemBy.get(o.id)??[]).map((i:any)=>({id:i.id,produtoId:i.produto_id??"",descricao:i.descricao,quantidade:Number(i.quantidade),valor:Number(i.custo_unitario??0)+Number(i.custo_total??0)/Math.max(1,Number(i.quantidade??1))})),desconto:0,observacao:o.observacoes??""})),
    pedidos:(pedidos??[]).map((p:any)=>({id:p.id,numero:p.numero,clienteId:p.cliente_id??"",data:p.data,entrega:p.data_entrega??"",status:p.status,itens:(pedidoItemBy.get(p.id)??[]).map((i:any)=>({id:i.id,produtoId:i.produto_id??"",descricao:i.descricao,quantidade:Number(i.quantidade),valor:Number(i.custo_total??0)/Math.max(1,Number(i.quantidade??1))})),total:Number(p.valor_total??0),pago:paysBy.get(p.id)??0,observacao:p.observacoes??"",checklist:checkBy.get(p.id)??[],entregueEm:p.entregue_em??undefined})),
    movimentos:(movimentos??[]).map((m:any)=>({id:m.id,produtoId:m.material_id,tipo:m.tipo==="entrada"?"entrada":"saida",quantidade:Number(m.quantidade),data:m.criado_em,observacao:m.observacao??""})),
    pagamentos:(pagamentos??[]).map((p:any)=>({id:p.id,pedidoId:p.pedido_id,valor:Number(p.valor),data:p.data,forma:p.forma??"",observacao:p.observacao??""})),
    configuracoes:{nome:(config?.[0] as any)?.nome_empresa??"Meu Ateliê",telefone:"",whatsapp:"",email:""}
  };
  persisted=clone(cache); loaded=true; emit();
}

export async function ensureLoaded(){
  if(loaded) return;
  if(!loading) loading=loadFromSupabase().catch(err=>{ console.error("Falha ao carregar dados do Supabase",err); throw err; }).finally(()=>{loading=null;});
  await loading;
}

function ids(a:any[]){return new Set(a.map(x=>x.id));}
async function sync(){
  const old=persisted, cur=cache;
  // Clientes
  await supabase.from("clientes").upsert(cur.clientes.map(c=>({id:c.id,nome:c.nome,whatsapp:c.telefone||null,endereco:c.endereco||null,observacoes:c.observacao||null})),{onConflict:"id"});
  const cliDel=[...ids(old.clientes)].filter(id=>!ids(cur.clientes).has(id)); if(cliDel.length) await supabase.from("clientes").delete().in("id",cliDel);
  // Produtos + material mirror (same UUID keeps UI and DB relationships consistent)
  const prodRows=cur.produtos.map(p=>({id:p.id,nome:p.nome,categoria:p.categoria,ativo:p.ativo}));
  const matRows=cur.produtos.map(p=>({id:p.id,nome:p.nome,categoria:p.categoria,unidade:p.unidade,quantidade_atual:p.estoque,estoque_minimo:p.estoqueMin,custo_unitario:p.custo}));
  if(prodRows.length) await supabase.from("produtos").upsert(prodRows,{onConflict:"id"});
  if(matRows.length) await supabase.from("materiais").upsert(matRows,{onConflict:"id"});
  const prodDel=[...ids(old.produtos)].filter(id=>!ids(cur.produtos).has(id)); if(prodDel.length){await supabase.from("produtos").delete().in("id",prodDel);await supabase.from("materiais").delete().in("id",prodDel);}
  // Orçamentos and items
  const orcRows=cur.orcamentos.map(o=>({id:o.id,numero:o.numero,cliente_id:o.clienteId||null,data:o.data,canal:"whatsapp",data_entrega_desejada:o.validade||null,status:o.status,observacoes:o.observacao||null,preco_final:pedidoTotal(o.itens,o.desconto),preco_sugerido:pedidoTotal(o.itens,o.desconto),custo_total:0,custo_materiais:0,outros_custos_valor:0}));
  if(orcRows.length) await supabase.from("orcamentos").upsert(orcRows,{onConflict:"id"});
  const oldOi=old.orcamentos.flatMap(o=>o.itens.map(i=>i.id)); const curOi=cur.orcamentos.flatMap(o=>o.itens.map(i=>i.id)); const oiDel=oldOi.filter(id=>!new Set(curOi).has(id)); if(oiDel.length) await supabase.from("orcamento_itens").delete().in("id",oiDel);
  const oiRows=cur.orcamentos.flatMap(o=>o.itens.map(i=>({id:i.id,orcamento_id:o.id,produto_id:i.produtoId||null,descricao:i.descricao,categoria:"produto",quantidade:i.quantidade,custo_unitario:i.valor,custo_total:i.quantidade*i.valor}))); if(oiRows.length) await supabase.from("orcamento_itens").upsert(oiRows,{onConflict:"id"});
  const orcDel=[...ids(old.orcamentos)].filter(id=>!ids(cur.orcamentos).has(id)); if(orcDel.length) await supabase.from("orcamentos").delete().in("id",orcDel);
  // Pedidos/items/checklist
  const pedRows=cur.pedidos.map(p=>({id:p.id,numero:p.numero,cliente_id:p.clienteId||null,data:p.data,data_entrega:p.entrega||null,status:p.status,valor_total:p.total,observacoes:p.observacao||null,entregue_em:p.entregueEm||null})); if(pedRows.length) await supabase.from("pedidos").upsert(pedRows,{onConflict:"id"});
  const oldPi=old.pedidos.flatMap(p=>p.itens.map(i=>i.id)); const curPi=cur.pedidos.flatMap(p=>p.itens.map(i=>i.id)); const piDel=oldPi.filter(id=>!new Set(curPi).has(id)); if(piDel.length) await supabase.from("pedido_itens").delete().in("id",piDel);
  const piRows=cur.pedidos.flatMap(p=>p.itens.map(i=>({id:i.id,pedido_id:p.id,produto_id:i.produtoId||null,descricao:i.descricao,categoria:"produto",quantidade:i.quantidade,custo_unitario:i.valor,custo_total:i.quantidade*i.valor}))); if(piRows.length) await supabase.from("pedido_itens").upsert(piRows,{onConflict:"id"});
  const pedDel=[...ids(old.pedidos)].filter(id=>!ids(cur.pedidos).has(id)); if(pedDel.length) await supabase.from("pedidos").delete().in("id",pedDel);
  // Payments: current UI records full/remaining payments; sync by id
  const payRows=cur.pagamentos.map(p=>({id:p.id,pedido_id:p.pedidoId,valor:p.valor,data:p.data,forma:p.forma||null,observacao:p.observacao||null})); if(payRows.length) await supabase.from("pagamentos").upsert(payRows,{onConflict:"id"});
  const payDel=[...ids(old.pagamentos)].filter(id=>!ids(cur.pagamentos).has(id)); if(payDel.length) await supabase.from("pagamentos").delete().in("id",payDel);
  // Movements
  const movRows=cur.movimentos.map(m=>({id:m.id,material_id:m.produtoId,tipo:m.tipo,quantidade:m.quantidade,observacao:m.observacao||null})); if(movRows.length) await supabase.from("movimentacoes_estoque").upsert(movRows,{onConflict:"id"});
  const movDel=[...ids(old.movimentos)].filter(id=>!ids(cur.movimentos).has(id)); if(movDel.length) await supabase.from("movimentacoes_estoque").delete().in("id",movDel);
  // Configuration
  const cfg=(await supabase.from("configuracoes").select("id").limit(1)).data?.[0] as any;
  if(cfg) await supabase.from("configuracoes").update({nome_empresa:cur.configuracoes.nome}).eq("id",cfg.id); else await supabase.from("configuracoes").insert({nome_empresa:cur.configuracoes.nome});
  persisted=clone(cur);
}

export function setData(data:AppData){
  cache=data; emit();
  writeQueue=writeQueue.then(sync).catch(err=>{console.error("Falha ao salvar no Supabase",err);});
}
export async function resetData(){ await loadFromSupabase(); }

export function useAppData(){
  const [data,setState]=useState<AppData>(cache);
  useEffect(()=>{
    let active=true;
    ensureLoaded().catch(()=>{}).finally(()=>{if(active)setState(cache);});
    const f=()=>setState(cache); listeners.add(f); return()=>{active=false;listeners.delete(f)};
  },[]);
  return data;
}
