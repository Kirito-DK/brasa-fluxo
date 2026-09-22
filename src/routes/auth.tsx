import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route=createFileRoute('/auth')({
  component:Auth,
});

function Auth(){
  const nav=useNavigate();
  const [email,setEmail]=useState(""); const [senha,setSenha]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(data.session) nav({to:"/painel",replace:true})})},[nav]);
  async function login(e:React.FormEvent){e.preventDefault();setLoading(true);const {error}=await supabase.auth.signInWithPassword({email, password:senha});setLoading(false);if(error)return toast.error(error.message);toast.success("Login realizado");nav({to:"/painel",replace:true});}
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><form onSubmit={login} className="card-artesanal w-full max-w-md space-y-4 p-6"><div><h1 className="font-display text-3xl">Brasa Fluxo</h1><p className="mt-1 text-sm text-muted-foreground">Entre para acessar o sistema.</p></div><div><Label>E-mail</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div><div><Label>Senha</Label><Input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} /></div><Button className="w-full" disabled={loading}>{loading?"Entrando...":"Entrar"}</Button></form></main>
}
