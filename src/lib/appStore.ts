import { useEffect, useState } from "react";

export type Cliente = { id:string; nome:string; telefone:string; email:string; endereco:string; observacao:string };
export type Produto = { id:string; nome:string; categoria:string; unidade:string; custo:number; preco:number; estoque:number; estoqueMin:number; ativo:boolean };
export type OrcamentoItem = { id:string; produtoId:string; descricao:string; quantidade:number; valor:number };
export type Orcamento = { id:string; numero:number; clienteId:string; data:string; validade:string; status:string; itens:OrcamentoItem[]; desconto:number; observacao:string };
export type PedidoItem = OrcamentoItem;
export type Pedido = { id:string; numero:number; clienteId:string; data:string; entrega:string; status:string; itens:PedidoItem[]; total:number; pago:number; observacao:string; checklist:string[]; entregueEm?:string };
export type Movimento = { id:string; produtoId:string; tipo:"entrada"|"saida"; quantidade:number; data:string; observacao:string };
export type Pagamento = { id:string; pedidoId:string; valor:number; data:string; forma:string; observacao:string };
export type AppData = { clientes:Cliente[]; produtos:Produto[]; orcamentos:Orcamento[]; pedidos:Pedido[]; movimentos:Movimento[]; pagamentos:Pagamento[]; configuracoes:{nome:string; telefone:string; whatsapp:string; email:string} };

const KEY="brasa-fluxo-v2";
const seed:AppData={
 clientes:[],
 produtos:[
  {id:"p1",nome:"Vela personalizada",categoria:"Vela",unidade:"un",custo:8,preco:20,estoque:0,estoqueMin:5,ativo:true},
  {id:"p2",nome:"Peça de gesso",categoria:"Gesso",unidade:"un",custo:12,preco:30,estoque:0,estoqueMin:3,ativo:true},
 ],orcamentos:[],pedidos:[],movimentos:[],pagamentos:[],configuracoes:{nome:"Meu Ateliê",telefone:"",whatsapp:"",email:""}
};
function read():AppData { if(typeof window==="undefined") return seed; try { const v=localStorage.getItem(KEY); return v?JSON.parse(v):seed; } catch { return seed; } }
export function getData(){ return read(); }
export function setData(data:AppData){ localStorage.setItem(KEY,JSON.stringify(data)); window.dispatchEvent(new Event("brasa-data")); }
export function resetData(){ setData(seed); }
export function uid(prefix="id"){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
export function nextNumber(list:{numero:number}[], start=1){ return list.reduce((m,x)=>Math.max(m,x.numero),start-1)+1; }
export function money(n:number){ return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
export function useAppData(){ const [data,setState]=useState<AppData>(read); useEffect(()=>{ const f=()=>setState(read()); window.addEventListener("brasa-data",f); return()=>window.removeEventListener("brasa-data",f); },[]); return data; }
export function clienteNome(data:AppData,id:string){ return data.clientes.find(c=>c.id===id)?.nome ?? "Sem cliente"; }
export function pedidoTotal(itens:OrcamentoItem[],desconto=0){ return Math.max(0,itens.reduce((s,i)=>s+i.quantidade*i.valor,0)-desconto); }
