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
export type Historico = { id:string; pedidoId:string|null; orcamentoId:string|null; evento:string; detalhe:string; criadoEm:string };
export type AppData = { clientes:Cliente[]; produtos:Produto[]; orcamentos:Orcamento[]; pedidos:Pedido[]; movimentos:Movimento[]; pagamentos:Pagamento[]; historico:Historico[]; configuracoes:{nome:string; telefone:string; whatsapp:string; email:string} };

const empty:AppData={clientes:[],produtos:[],orcamentos:[],pedidos:[],movimentos:[],pagamentos:[],historico:[],configuracoes:{nome:"Planejamento Lumme",telefone:"",whatsapp:"",email:""}};
let cache:AppData = structuredClone(empty);
let persisted:AppData = structuredClone(empty);
let loaded = false;
let loading: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let lastError: string | null = null;
const listeners = new Set<()=>void>();

function emit(){ listeners.forEach(fn=>fn()); }
function clone<T>(v:T):T { return structuredClone(v); }
export function uid(_prefix="id"){ return crypto.randomUUID(); }
export function getData(){ return cache; }
export function nextNumber(list:{numero:number}[], start=1){ return list.reduce((m,x)=>Math.max(m,x.numero),start-1)+1; }
export function money(n:number){ return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
export function clienteNome(data:AppData,id:string){ return data.clientes.find(c=>c.id===id)?.nome ?? "Sem cliente"; }
export function pedidoTotal(itens:OrcamentoItem[],desconto=0){ return Math.max(0,itens.reduce((s,i)=>s+i.quantidade*i.valor,0)-desconto); }

async function requireSession(){
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("Sessão expirada. Faça login novamente.");
  return data.session;
}

async function readTable<T>(label:string, query: PromiseLike<{data:T[]|null; error:any}>): Promise<T[]> {
  const {data,error}=await query;
  if(error){
    console.error(`[Planejamento Lumme] Falha ao carregar ${label}:`, error);
    throw new Error(`Não foi possível carregar ${label}: ${error.message ?? error}`);
  }
  return data ?? [];
}

async function loadFromSupabase(){
  await requireSession();
  const [clientes,produtos,materiais,orcamentos,oi,pedidos,pi,pagamentos,movimentos,check,historico,config] = await Promise.all([
    readTable("clientes",supabase.from("clientes").select("*").order("criado_em",{ascending:false})),
    readTable("produtos",supabase.from("produtos").select("*").order("criado_em",{ascending:false})),
    readTable("materiais",supabase.from("materiais").select("*").order("criado_em",{ascending:false})),
    readTable("orçamentos",supabase.from("orcamentos").select("*").order("criado_em",{ascending:false})),
    readTable("itens de orçamento",supabase.from("orcamento_itens").select("*").order("criado_em")),
    readTable("pedidos",supabase.from("pedidos").select("*").order("criado_em",{ascending:false})),
    readTable("itens de pedido",supabase.from("pedido_itens").select("*").order("criado_em")),
    readTable("pagamentos",supabase.from("pagamentos").select("*")),
    readTable("movimentações de estoque",supabase.from("movimentacoes_estoque").select("*")),
    readTable("checklist",supabase.from("pedido_checklist").select("*").order("ordem")),
    readTable("histórico",supabase.from("historico_pedidos").select("*" ).order("criado_em",{ascending:false})),
    readTable("configurações",supabase.from("configuracoes").select("*").order("criado_em",{ascending:false}).limit(1)),
  ]);

  const mats = materiais as any[];
  const matById = new Map(mats.map(m=>[m.id,m]));
  const prods = produtos as any[];
  const uiProdutos:Produto[] = prods.map(p=>{
    const m=matById.get(p.id);
    return {id:p.id,nome:p.nome,categoria:p.categoria,unidade:m?.unidade??"un",custo:Number(m?.custo_unitario??0),preco:Number((p as any).preco_venda??0),estoque:Number(m?.quantidade_atual??0),estoqueMin:Number(m?.estoque_minimo??0),ativo:Boolean(p.ativo)};
  });

  const orcItemBy = new Map<string,any[]>();
  for(const i of oi as any[]) { const a=orcItemBy.get(i.orcamento_id)??[]; a.push(i); orcItemBy.set(i.orcamento_id,a); }
  const pedidoItemBy = new Map<string,any[]>();
  for(const i of pi as any[]) { const a=pedidoItemBy.get(i.pedido_id)??[]; a.push(i); pedidoItemBy.set(i.pedido_id,a); }
  const checkBy = new Map<string,string[]>();
  for(const c of check as any[]) { const a=checkBy.get(c.pedido_id)??[]; if(c.concluido) a.push(c.etapa); checkBy.set(c.pedido_id,a); }
  const paysBy = new Map<string,number>();
  for(const p of pagamentos as any[]) paysBy.set(p.pedido_id,(paysBy.get(p.pedido_id)??0)+Number(p.valor??0));

  cache={
    clientes:(clientes as any[]).map(c=>({id:c.id,nome:c.nome,telefone:c.whatsapp??"",email:"",endereco:c.endereco??"",observacao:c.observacoes??""})),
    produtos:uiProdutos,
    orcamentos:(orcamentos as any[]).map(o=>({id:o.id,numero:o.numero,clienteId:o.cliente_id??"",data:o.data,validade:o.data_entrega_desejada??"",status:o.status,itens:(orcItemBy.get(o.id)??[]).map((i:any)=>({id:i.id,produtoId:i.produto_id??"",descricao:i.descricao,quantidade:Number(i.quantidade),valor:Number(i.custo_unitario??0)})),desconto:Math.max(0,Number(o.preco_sugerido??0)-Number(o.preco_final??0)),observacao:o.observacoes??""})),
    pedidos:(pedidos as any[]).map(p=>({id:p.id,numero:p.numero,clienteId:p.cliente_id??"",data:p.data,entrega:p.data_entrega??"",status:p.status,itens:(pedidoItemBy.get(p.id)??[]).map((i:any)=>({id:i.id,produtoId:i.produto_id??"",descricao:i.descricao,quantidade:Number(i.quantidade),valor:Number(i.custo_unitario??0)})),total:Number(p.valor_total??0),pago:paysBy.get(p.id)??0,observacao:p.observacoes??"",checklist:checkBy.get(p.id)??[],entregueEm:p.entregue_em??undefined})),
    movimentos:(movimentos as any[]).map((m:any)=>({id:m.id,produtoId:m.material_id,tipo:m.tipo==="entrada"?"entrada":"saida",quantidade:Number(m.quantidade),data:m.criado_em,observacao:m.observacao??""})),
    pagamentos:(pagamentos as any[]).map((p:any)=>({id:p.id,pedidoId:p.pedido_id,valor:Number(p.valor),data:p.data,forma:p.forma??"",observacao:p.observacao??""})),
    historico:(historico as any[]).map((h:any)=>({id:h.id,pedidoId:h.pedido_id??null,orcamentoId:h.orcamento_id??null,evento:h.evento,detalhe:h.detalhe??"",criadoEm:h.criado_em})),
    configuracoes:{nome:(config as any[])[0]?.nome_empresa??"Planejamento Lumme",telefone:"",whatsapp:"",email:""}
  };
  persisted=clone(cache); loaded=true; lastError=null; emit();
}

export async function ensureLoaded(){
  if(loaded) return;
  if(!loading) loading=loadFromSupabase().catch(err=>{
    lastError=err instanceof Error ? err.message : String(err);
    console.error("Falha ao carregar dados do Supabase",err);
    emit();
    throw err;
  }).finally(()=>{loading=null;});
  await loading;
}

export function getStoreError(){ return lastError; }

function ids(a:any[]){return new Set(a.map(x=>x.id));}
async function must<T>(label:string, promise:PromiseLike<{data:T|null; error:any}>):Promise<T|null>{
  const {data,error}=await promise;
  if(error) throw new Error(`${label}: ${error.message ?? error.details ?? error}`);
  return data;
}

function rows<T>(arr:T[]){ return arr.length ? arr : null; }

async function sync(){
  await requireSession();
  const old=persisted, cur=clone(cache);
  // Salva na mesma ordem das chaves estrangeiras: pais antes dos filhos.
  await must("clientes", supabase.from("clientes").upsert(cur.clientes.map(c=>({id:c.id,nome:c.nome,whatsapp:c.telefone||null,endereco:c.endereco||null,observacoes:c.observacao||null})),{onConflict:"id"}));
  const cliDel=[...ids(old.clientes)].filter(id=>!ids(cur.clientes).has(id));
  if(cliDel.length) await must("exclusão de clientes",supabase.from("clientes").delete().in("id",cliDel));

  const prodRows=cur.produtos.map(p=>({id:p.id,nome:p.nome,categoria:p.categoria,preco_venda:p.preco,ativo:p.ativo}));
  const matRows=cur.produtos.map(p=>({id:p.id,nome:p.nome,categoria:p.categoria,unidade:p.unidade,quantidade_atual:p.estoque,estoque_minimo:p.estoqueMin,custo_unitario:p.custo}));
  await must("produtos",supabase.from("produtos").upsert(prodRows,{onConflict:"id"}));
  await must("materiais",supabase.from("materiais").upsert(matRows,{onConflict:"id"}));
  const prodDel=[...ids(old.produtos)].filter(id=>!ids(cur.produtos).has(id));
  if(prodDel.length){
    await must("exclusão de materiais",supabase.from("materiais").delete().in("id",prodDel));
    await must("exclusão de produtos",supabase.from("produtos").delete().in("id",prodDel));
  }

  const orcRows=cur.orcamentos.map(o=>({id:o.id,numero:o.numero,cliente_id:o.clienteId||null,data:o.data,canal:"whatsapp",data_entrega_desejada:o.validade||null,status:o.status,observacoes:o.observacao||null,preco_final:pedidoTotal(o.itens,o.desconto),preco_sugerido:pedidoTotal(o.itens,o.desconto),custo_total:0,custo_materiais:0,outros_custos_valor:0,percentual_lucro:0,preco_manual:true}));
  await must("orçamentos",supabase.from("orcamentos").upsert(orcRows,{onConflict:"id"}));
  const oldOi=old.orcamentos.flatMap(o=>o.itens.map(i=>i.id)); const curOi=cur.orcamentos.flatMap(o=>o.itens.map(i=>i.id)); const oiDel=oldOi.filter(id=>!new Set(curOi).has(id));
  if(oiDel.length) await must("exclusão de itens de orçamento",supabase.from("orcamento_itens").delete().in("id",oiDel));
  const oiRows=cur.orcamentos.flatMap(o=>o.itens.map(i=>({id:i.id,orcamento_id:o.id,produto_id:i.produtoId||null,descricao:i.descricao,categoria:"produto",quantidade:i.quantidade,custo_unitario:i.valor,custo_total:i.quantidade*i.valor}))); 
  await must("itens de orçamento",supabase.from("orcamento_itens").upsert(oiRows,{onConflict:"id"}));
  const orcDel=[...ids(old.orcamentos)].filter(id=>!ids(cur.orcamentos).has(id)); if(orcDel.length){ const hdel=cur.historico.filter(h=>h.orcamentoId && orcDel.includes(h.orcamentoId)).map(h=>h.id); if(hdel.length) await must("exclusão de histórico de orçamentos",supabase.from("historico_pedidos").delete().in("id",hdel)); await must("exclusão de orçamentos",supabase.from("orcamentos").delete().in("id",orcDel)); }

  const pedRows=cur.pedidos.map(p=>({id:p.id,numero:p.numero,cliente_id:p.clienteId||null,data:p.data,data_entrega:p.entrega||null,status:p.status,valor_total:p.total,observacoes:p.observacao||null,entregue_em:p.entregueEm||null}));
  await must("pedidos",supabase.from("pedidos").upsert(pedRows,{onConflict:"id"}));
  const oldPi=old.pedidos.flatMap(p=>p.itens.map(i=>i.id)); const curPi=cur.pedidos.flatMap(p=>p.itens.map(i=>i.id)); const piDel=oldPi.filter(id=>!new Set(curPi).has(id)); if(piDel.length) await must("exclusão de itens de pedido",supabase.from("pedido_itens").delete().in("id",piDel));
  const piRows=cur.pedidos.flatMap(p=>p.itens.map(i=>({id:i.id,pedido_id:p.id,produto_id:i.produtoId||null,descricao:i.descricao,categoria:"produto",quantidade:i.quantidade,custo_unitario:i.valor,custo_total:i.quantidade*i.valor,quantidade_produzida:0,status_producao:"aguardando"}))); 
  await must("itens de pedido",supabase.from("pedido_itens").upsert(piRows,{onConflict:"id"}));
  const pedDel=[...ids(old.pedidos)].filter(id=>!ids(cur.pedidos).has(id)); if(pedDel.length){ const hdel=cur.historico.filter(h=>h.pedidoId && pedDel.includes(h.pedidoId)).map(h=>h.id); if(hdel.length) await must("exclusão de histórico de pedidos",supabase.from("historico_pedidos").delete().in("id",hdel)); await must("exclusão de pedidos",supabase.from("pedidos").delete().in("id",pedDel)); }

  const payRows=cur.pagamentos.map(p=>({id:p.id,pedido_id:p.pedidoId,valor:p.valor,data:p.data,forma:p.forma||null,observacao:p.observacao||null})); await must("pagamentos",supabase.from("pagamentos").upsert(payRows,{onConflict:"id"}));
  const payDel=[...ids(old.pagamentos)].filter(id=>!ids(cur.pagamentos).has(id)); if(payDel.length) await must("exclusão de pagamentos",supabase.from("pagamentos").delete().in("id",payDel));

  const histRows=cur.historico.map(h=>({id:h.id,pedido_id:h.pedidoId||null,orcamento_id:h.orcamentoId||null,evento:h.evento,detalhe:h.detalhe||null}));
  await must("histórico",supabase.from("historico_pedidos").upsert(histRows,{onConflict:"id"}));
  const histDel=[...ids(old.historico)].filter(id=>!ids(cur.historico).has(id)); if(histDel.length) await must("exclusão de histórico",supabase.from("historico_pedidos").delete().in("id",histDel));

  const movRows=cur.movimentos.map(m=>({id:m.id,material_id:m.produtoId,tipo:m.tipo,quantidade:m.quantidade,observacao:m.observacao||null})); await must("movimentações de estoque",supabase.from("movimentacoes_estoque").upsert(movRows,{onConflict:"id"}));
  const movDel=[...ids(old.movimentos)].filter(id=>!ids(cur.movimentos).has(id)); if(movDel.length) await must("exclusão de movimentações",supabase.from("movimentacoes_estoque").delete().in("id",movDel));

  const cfg=(await must<any[]>("configurações",supabase.from("configuracoes").select("id").limit(1)))?.[0];
  if(cfg) await must("configuração",supabase.from("configuracoes").update({nome_empresa:cur.configuracoes.nome}).eq("id",cfg.id));
  else await must("configuração",supabase.from("configuracoes").insert({nome_empresa:cur.configuracoes.nome}));

  persisted=clone(cur); lastError=null; emit();
}

export function setData(data:AppData){
  cache=clone(data); emit();
  writeQueue=writeQueue.then(()=>ensureLoaded()).then(sync).catch(err=>{
    lastError=err instanceof Error ? err.message : String(err);
    console.error("Falha ao salvar no Supabase",err);
    emit();
  });
  return writeQueue;
}

export async function resetData(){ loaded=false; await loadFromSupabase(); }

export function useAppData(){
  const [data,setState]=useState<AppData>(clone(cache));
  const [error,setError]=useState<string|null>(lastError);
  useEffect(()=>{
    let active=true;
    ensureLoaded().catch(()=>{}).finally(()=>{if(active){setState(clone(cache));setError(lastError);}});
    const f=()=>{if(active){setState(clone(cache));setError(lastError);}};
    listeners.add(f); return()=>{active=false;listeners.delete(f)};
  },[]);
  return Object.assign(data,{__error:error});
}
