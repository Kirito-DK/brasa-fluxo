import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {PageHeader} from "@/components/layout/AppShell";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {getData,setData,useAppData,money,uid,type Produto} from "@/lib/appStore";
import {toast} from "sonner";

export const Route=createFileRoute("/_authenticated/produtos")({component:Produtos});
const novo=()=>({nome:"",categoria:"Vela",unidade:"un",custo:"",preco:"",estoque:"0",estoqueMin:"0"});
function Produtos(){
 const d=useAppData(); const [f,setF]=useState(novo()); const [editId,setEditId]=useState<string|null>(null);
 function save(e:React.FormEvent){e.preventDefault(); if(!f.nome.trim()) return toast.error("Informe o nome do produto"); const x=getData(); const dados:Produto={id:editId??uid(),nome:f.nome.trim(),categoria:f.categoria,unidade:f.unidade,custo:Number(f.custo)||0,preco:Number(f.preco)||0,estoque:Number(f.estoque)||0,estoqueMin:Number(f.estoqueMin)||0,ativo:true};
   if(editId){const i=x.produtos.findIndex(p=>p.id===editId); if(i>=0)x.produtos[i]=dados; toast.success("Produto atualizado")} else {x.produtos.unshift(dados); toast.success("Produto cadastrado")}
   setData(x); setF(novo()); setEditId(null);
 }
 function editar(p:Produto){setEditId(p.id);setF({nome:p.nome,categoria:p.categoria,unidade:p.unidade,custo:String(p.custo),preco:String(p.preco),estoque:String(p.estoque),estoqueMin:String(p.estoqueMin)})}
 function del(id:string){const x=getData();x.produtos=x.produtos.filter(p=>p.id!==id);setData(x);toast.success("Produto excluído")}
 return <><PageHeader titulo="Produtos" descricao="Catálogo, preços e custos"/><div className="grid gap-5 lg:grid-cols-[360px_1fr]">
  <form onSubmit={save} className="card-artesanal p-5 space-y-3"><h2 className="font-display text-xl">{editId?"Editar produto":"Novo produto"}</h2>
   <div><Label>Nome</Label><Input value={f.nome} onChange={e=>setF({...f,nome:e.target.value})}/></div><div><Label>Categoria</Label><Input value={f.categoria} onChange={e=>setF({...f,categoria:e.target.value})}/></div><div><Label>Unidade</Label><Input value={f.unidade} onChange={e=>setF({...f,unidade:e.target.value})}/></div>
   {[['custo','Custo'],['preco','Preço de venda'],['estoque','Estoque inicial/atual'],['estoqueMin','Estoque mínimo']].map(([k,l])=><div key={k}><Label>{l}</Label><Input type="number" step="0.01" min="0" value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}
   <div className="flex gap-2"><Button className="flex-1">{editId?"Salvar alterações":"Cadastrar"}</Button>{editId&&<Button type="button" variant="outline" onClick={()=>{setEditId(null);setF(novo())}}>Cancelar</Button>}</div>
  </form><section className="card-artesanal p-5"><h2 className="font-display text-xl mb-3">Produtos cadastrados</h2><div className="space-y-2">{d.produtos.map(p=><div className="grid gap-3 rounded-lg bg-muted p-3 sm:grid-cols-[1fr_auto_auto]" key={p.id}><div><b>{p.nome}</b><p className="text-xs text-muted-foreground">{p.categoria} · custo {money(p.custo)} · venda {money(p.preco)}</p></div><div className="text-right text-sm"><b>{money(p.preco)}</b><p>estoque: {p.estoque}</p></div><div className="flex gap-1"><Button variant="outline" size="sm" onClick={()=>editar(p)}>Editar</Button><Button variant="ghost" size="sm" onClick={()=>del(p.id)}>Excluir</Button></div></div>)}{!d.produtos.length&&<p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>}</div></section>
 </div></>;
}
