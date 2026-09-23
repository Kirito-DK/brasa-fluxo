import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const db = supabase as any;

export const Route = createFileRoute("/_authenticated/fornecedores")({ component: Fornecedores });

type Fornecedor = { id:string; nome:string; documento:string|null; telefone:string|null; whatsapp:string|null; email:string|null; endereco:string|null; observacoes:string|null; ativo:boolean };
const vazio = {nome:"", documento:"", telefone:"", whatsapp:"", email:"", endereco:"", observacoes:""};

function Fornecedores(){
  const [lista,setLista]=useState<Fornecedor[]>([]); const [f,setF]=useState(vazio); const [editId,setEditId]=useState<string|null>(null); const [q,setQ]=useState(""); const [loading,setLoading]=useState(true);
  async function carregar(){setLoading(true); const {data,error}=await db.from("fornecedores").select("*").order("nome"); if(error){toast.error(error.message);setLoading(false);return} setLista((data??[]) as any);setLoading(false)}
  useEffect(()=>{carregar()},[]);
  async function salvar(e:React.FormEvent){e.preventDefault();if(!f.nome.trim())return toast.error("Informe o nome do fornecedor"); const row={nome:f.nome.trim(),documento:f.documento||null,telefone:f.telefone||null,whatsapp:f.whatsapp||null,email:f.email||null,endereco:f.endereco||null,observacoes:f.observacoes||null,ativo:true}; const {error}=editId?await db.from("fornecedores").update(row).eq("id",editId):await db.from("fornecedores").insert(row); if(error){toast.error(error.message);return} toast.success(editId?"Fornecedor atualizado":"Fornecedor cadastrado");setF(vazio);setEditId(null);carregar()}
  function editar(x:Fornecedor){setEditId(x.id);setF({nome:x.nome,documento:x.documento??"",telefone:x.telefone??"",whatsapp:x.whatsapp??"",email:x.email??"",endereco:x.endereco??"",observacoes:x.observacoes??""})}
  async function excluir(id:string){if(!confirm("Excluir este fornecedor? Materiais vinculados ficarão sem fornecedor."))return;const {error}=await db.from("fornecedores").delete().eq("id",id);if(error){toast.error(error.message);return}toast.success("Fornecedor excluído");carregar()}
  const filtrados=lista.filter(x=>(x.nome+" "+(x.documento??"")+" "+(x.whatsapp??"")).toLowerCase().includes(q.toLowerCase()));
  return <><PageHeader titulo="Fornecedores" descricao="Cadastre quem fornece seus materiais"/><div className="grid gap-5 lg:grid-cols-[380px_1fr]"><form onSubmit={salvar} className="card-artesanal p-5 space-y-3"><h2 className="font-display text-xl">{editId?"Editar fornecedor":"Novo fornecedor"}</h2>{[["nome","Nome *"],["documento","CNPJ / CPF"],["telefone","Telefone"],["whatsapp","WhatsApp"],["email","E-mail"],["endereco","Endereço"]].map(([k,l])=><div key={k}><Label>{l}</Label><Input value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}<div><Label>Observações</Label><textarea className="w-full rounded-md border bg-background p-2 text-sm" rows={3} value={f.observacoes} onChange={e=>setF({...f,observacoes:e.target.value})}/></div><div className="flex gap-2"><Button className="flex-1">{editId?"Salvar alterações":"Cadastrar fornecedor"}</Button>{editId&&<Button type="button" variant="outline" onClick={()=>{setEditId(null);setF(vazio)}}>Cancelar</Button>}</div></form><section className="card-artesanal p-5"><div className="flex gap-2"><Input placeholder="Buscar fornecedor..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="mt-4 space-y-2">{loading?<p className="text-sm text-muted-foreground">Carregando...</p>:filtrados.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-3"><div><b>{x.nome}</b><p className="text-sm text-muted-foreground">{x.whatsapp||x.telefone||x.email||"Sem contato"}</p>{x.documento&&<p className="text-xs text-muted-foreground">{x.documento}</p>}</div><div className="flex gap-1"><Button variant="outline" size="sm" onClick={()=>editar(x)}>Editar</Button><Button variant="ghost" size="sm" onClick={()=>excluir(x.id)}>Excluir</Button></div></div>)}{!loading&&!filtrados.length&&<p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>}</div></section></div></>;
}
