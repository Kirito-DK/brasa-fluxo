import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Pencil, Instagram, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClientes, usePagamentosTodos, usePedidos } from "@/lib/dados";
import { PageHeader } from "@/components/layout/AppShell";
import { EstadoVazio } from "@/components/EstadoVazio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl } from "@/lib/format";
import type { Cliente } from "@/lib/tipos";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Ateliê" },
      { name: "description", content: "Cadastro de clientes com histórico de pedidos e valores." },
      { property: "og:title", content: "Clientes — Ateliê" },
      { property: "og:description", content: "Cadastro de clientes com histórico de pedidos e valores." },
    ],
  }),
  component: ClientesPage,
});

const vazio = { nome: "", whatsapp: "", instagram: "", endereco: "", observacoes: "" };

function ClientesPage() {
  const qc = useQueryClient();
  const { data: clientes = [], isLoading } = useClientes();
  const { data: pedidos = [] } = usePedidos();
  const { data: pagamentos = [] } = usePagamentosTodos();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(vazio);
  const [filtro, setFiltro] = useState("");

  function abrirNovo() {
    setEditando(null);
    setForm(vazio);
    setAberto(true);
  }

  function abrirEdicao(c: Cliente) {
    setEditando(c);
    setForm({
      nome: c.nome,
      whatsapp: c.whatsapp ?? "",
      instagram: c.instagram ?? "",
      endereco: c.endereco ?? "",
      observacoes: c.observacoes ?? "",
    });
    setAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    const duplicado = clientes.find(
      (c) => form.whatsapp.trim() && c.whatsapp === form.whatsapp.trim() && c.id !== editando?.id,
    );
    if (duplicado) {
      toast.error(`Este WhatsApp já pertence a ${duplicado.nome}.`);
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      whatsapp: form.whatsapp.trim() || null,
      instagram: form.instagram.trim() || null,
      endereco: form.endereco.trim() || null,
      observacoes: form.observacoes.trim() || null,
    };
    const { error } = editando
      ? await supabase.from("clientes").update(payload).eq("id", editando.id)
      : await supabase.from("clientes").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar o cliente.");
      return;
    }
    toast.success(editando ? "Cliente atualizado." : "Cliente cadastrado.");
    setAberto(false);
    qc.invalidateQueries({ queryKey: ["clientes"] });
  }

  const pagoPorPedido = new Map<string, number>();
  for (const p of pagamentos)
    pagoPorPedido.set(p.pedido_id, (pagoPorPedido.get(p.pedido_id) ?? 0) + Number(p.valor));

  const lista = clientes.filter((c) =>
    [c.nome, c.whatsapp, c.instagram].join(" ").toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        titulo="Clientes"
        descricao="Quem já comprou com você e o histórico de cada um."
        acao={
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="size-4" /> Novo cliente
          </Button>
        }
      />

      <Input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar por nome, WhatsApp ou Instagram"
        className="mb-4 max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : lista.length === 0 ? (
        <EstadoVazio
          icone={Users}
          titulo="Nenhum cliente por aqui"
          descricao="Cadastre o primeiro cliente para começar a criar orçamentos."
          acao={<Button onClick={abrirNovo}>Cadastrar cliente</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lista.map((c) => {
            const meus = pedidos.filter((p) => p.cliente_id === c.id && p.status !== "cancelado");
            const total = meus.reduce((t, p) => t + Number(p.valor_total), 0);
            const pago = meus.reduce((t, p) => t + (pagoPorPedido.get(p.id) ?? 0), 0);
            return (
              <div key={c.id} className="card-artesanal p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg">
                      {c.nome} {c.demo ? <span className="text-xs text-muted-foreground">(exemplo)</span> : null}
                    </h3>
                    <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                      {c.whatsapp ? (
                        <p className="flex items-center gap-1.5">
                          <Phone className="size-3.5" /> {c.whatsapp}
                        </p>
                      ) : null}
                      {c.instagram ? (
                        <p className="flex items-center gap-1.5">
                          <Instagram className="size-3.5" /> {c.instagram}
                        </p>
                      ) : null}
                      {c.endereco ? <p>{c.endereco}</p> : null}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(c)} aria-label="Editar cliente">
                    <Pencil className="size-4" />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedidos</p>
                    <p className="font-medium">{meus.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="font-medium text-success">{brl(pago)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pendente</p>
                    <p className="font-medium text-destructive">{brl(Math.max(0, total - pago))}</p>
                  </div>
                </div>
                {c.observacoes ? (
                  <p className="mt-3 text-sm text-muted-foreground">{c.observacoes}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                maxLength={120}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  maxLength={30}
                  placeholder="(11) 90000-0000"
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  maxLength={60}
                  placeholder="@perfil"
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco}
                maxLength={200}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                value={form.observacoes}
                maxLength={1000}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
