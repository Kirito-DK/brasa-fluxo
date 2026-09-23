import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Plus, Pencil, History, ShoppingCart, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMateriais } from "@/lib/dados";
import { PageHeader } from "@/components/layout/AppShell";
import { EstadoVazio } from "@/components/EstadoVazio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl, dataHoraBR, numeroBR } from "@/lib/format";
import { CATEGORIAS_MATERIAL, UNIDADES, rotuloSimples } from "@/lib/dominio";
import type { CustoMaterial, Material } from "@/lib/tipos";

export const Route = createFileRoute("/_authenticated/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Ateliê" },
      { name: "description", content: "Materiais, custos por unidade, histórico de preços e lista de compras." },
      { property: "og:title", content: "Estoque — Ateliê" },
      { property: "og:description", content: "Materiais, custos por unidade, histórico de preços e lista de compras." },
    ],
  }),
  component: EstoquePage,
});

const vazio = {
  nome: "",
  categoria: "outro",
  unidade: "unidade",
  quantidade_atual: "0",
  estoque_minimo: "0",
  quantidade_comprada: "",
  valor_pago: "",
  custo_unitario: "0",
  fornecedor: "",
  observacoes: "",
};

function EstoquePage() {
  const qc = useQueryClient();
  const { data: materiais = [], isLoading } = useMateriais();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Material | null>(null);
  const [form, setForm] = useState(vazio);
  const [historicoDe, setHistoricoDe] = useState<Material | null>(null);
  const [movimentoDe, setMovimentoDe] = useState<Material | null>(null);
  const [movimento, setMovimento] = useState({ tipo: "entrada", quantidade: "", observacao: "" });

  const custoCalculado =
    Number(form.quantidade_comprada) > 0
      ? Number(form.valor_pago) / Number(form.quantidade_comprada)
      : Number(form.custo_unitario) || 0;

  function abrirNovo() {
    setEditando(null);
    setForm(vazio);
    setAberto(true);
  }

  function abrirEdicao(m: Material) {
    setEditando(m);
    setForm({
      nome: m.nome,
      categoria: m.categoria,
      unidade: m.unidade,
      quantidade_atual: String(m.quantidade_atual),
      estoque_minimo: String(m.estoque_minimo),
      quantidade_comprada: "",
      valor_pago: "",
      custo_unitario: String(m.custo_unitario),
      fornecedor: m.fornecedor ?? "",
      observacoes: m.observacoes ?? "",
    });
    setAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do material.");
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      unidade: form.unidade,
      quantidade_atual: Number(form.quantidade_atual) || 0,
      estoque_minimo: Number(form.estoque_minimo) || 0,
      custo_unitario: Number(custoCalculado.toFixed(6)),
      fornecedor: form.fornecedor.trim() || null,
      observacoes: form.observacoes.trim() || null,
    };
    const { data, error } = editando
      ? await supabase.from("materiais").update(payload).eq("id", editando.id).select("id").single()
      : await supabase.from("materiais").insert(payload).select("id").single();
    if (error) {
      toast.error("Não foi possível salvar o material.");
      return;
    }
    if (Number(form.quantidade_comprada) > 0 && data) {
      await supabase
        .from("custos_materiais")
        .update({
          quantidade_comprada: Number(form.quantidade_comprada),
          valor_pago: Number(form.valor_pago) || 0,
          observacao: `Compra de ${form.quantidade_comprada} ${form.unidade} por ${brl(Number(form.valor_pago))}`,
        })
        .eq("material_id", data.id)
        .order("vigente_desde", { ascending: false })
        .limit(1);
    }
    toast.success(editando ? "Material atualizado." : "Material cadastrado.");
    setAberto(false);
    qc.invalidateQueries({ queryKey: ["materiais"] });
  }

  async function registrarMovimento(e: React.FormEvent) {
    e.preventDefault();
    if (!movimentoDe) return;
    const qtd = Number(movimento.quantidade);
    if (!qtd || qtd <= 0) {
      toast.error("Informe uma quantidade maior que zero.");
      return;
    }
    const delta = movimento.tipo === "entrada" ? qtd : -qtd;
    const nova = Number(movimentoDe.quantidade_atual) + delta;
    const { error } = await supabase
      .from("materiais")
      .update({ quantidade_atual: nova })
      .eq("id", movimentoDe.id);
    if (error) {
      toast.error("Não foi possível atualizar o estoque.");
      return;
    }
    await supabase.from("movimentacoes_estoque").insert({
      material_id: movimentoDe.id,
      tipo: movimento.tipo,
      quantidade: qtd,
      observacao: movimento.observacao || null,
    });
    toast.success("Movimentação registrada.");
    setMovimentoDe(null);
    setMovimento({ tipo: "entrada", quantidade: "", observacao: "" });
    qc.invalidateQueries({ queryKey: ["materiais"] });
  }

  const baixos = materiais.filter((m) => Number(m.quantidade_atual) <= Number(m.estoque_minimo));

  return (
    <div>
      <PageHeader
        titulo="Estoque e materiais"
        descricao="Cadastre o custo uma vez — os orçamentos calculam sozinhos."
        acao={
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="size-4" /> Novo material
          </Button>
        }
      />

      <Tabs defaultValue="materiais">
        <TabsList>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="comprar">Lista de compras ({baixos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="materiais" className="mt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : materiais.length === 0 ? (
            <EstadoVazio
              icone={Boxes}
              titulo="Nenhum material cadastrado"
              descricao="Cadastre cera, essências, pavios, gesso, embalagens e etiquetas com seus custos."
              acao={<Button onClick={abrirNovo}>Cadastrar material</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {materiais.map((m) => {
                const baixo = Number(m.quantidade_atual) <= Number(m.estoque_minimo);
                return (
                  <div key={m.id} className="card-artesanal p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg">{m.nome}</h3>
                        <p className="text-xs text-muted-foreground uppercase">
                          {rotuloSimples(m.categoria)} · {m.unidade}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Movimentar" onClick={() => setMovimentoDe(m)}>
                          <ArrowUpDown className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Histórico de custos" onClick={() => setHistoricoDe(m)}>
                          <History className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => abrirEdicao(m)}>
                          <Pencil className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Em estoque</p>
                        <p className={baixo ? "font-medium text-destructive" : "font-medium"}>
                          {numeroBR(m.quantidade_atual)} {m.unidade}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mínimo</p>
                        <p className="font-medium">{numeroBR(m.estoque_minimo)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Custo / {m.unidade}</p>
                        <p className="font-medium">{brl(m.custo_unitario)}</p>
                      </div>
                    </div>
                    {m.fornecedor ? (
                      <p className="mt-2 text-sm text-muted-foreground">Fornecedor: {m.fornecedor}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comprar" className="mt-4">
          {baixos.length === 0 ? (
            <EstadoVazio
              icone={ShoppingCart}
              titulo="Nada para comprar"
              descricao="Todos os materiais estão acima do estoque mínimo."
            />
          ) : (
            <div className="card-artesanal divide-y divide-border">
              {baixos.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="font-medium">⚠️ {m.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    Tem {numeroBR(m.quantidade_atual)} {m.unidade} · mínimo {numeroBR(m.estoque_minimo)}{" "}
                    {m.unidade}
                    {m.fornecedor ? ` · ${m.fornecedor}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogo material */}
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar material" : "Novo material"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="mnome">Nome *</Label>
              <Input
                id="mnome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_MATERIAL.map((c) => (
                      <SelectItem key={c} value={c}>
                        {rotuloSimples(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Unidade de medida</Label>
                <Select value={form.unidade} onValueChange={(v) => setForm({ ...form, unidade: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qatual">Quantidade atual</Label>
                <Input
                  id="qatual"
                  type="number"
                  step="any"
                  min="0"
                  value={form.quantidade_atual}
                  onChange={(e) => setForm({ ...form, quantidade_atual: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qmin">Estoque mínimo</Label>
                <Input
                  id="qmin"
                  type="number"
                  step="any"
                  min="0"
                  value={form.estoque_minimo}
                  onChange={(e) => setForm({ ...form, estoque_minimo: e.target.value })}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="mb-2 text-sm font-medium">Custo do material</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qcomp">Quantidade comprada ({form.unidade})</Label>
                  <Input
                    id="qcomp"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="ex: 5000"
                    value={form.quantidade_comprada}
                    onChange={(e) => setForm({ ...form, quantidade_comprada: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vpago">Valor pago (R$)</Label>
                  <Input
                    id="vpago"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="ex: 100"
                    value={form.valor_pago}
                    onChange={(e) => setForm({ ...form, valor_pago: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="cunit">Custo por {form.unidade}</Label>
                <Input
                  id="cunit"
                  type="number"
                  step="any"
                  min="0"
                  value={
                    Number(form.quantidade_comprada) > 0
                      ? custoCalculado.toFixed(4)
                      : form.custo_unitario
                  }
                  readOnly={Number(form.quantidade_comprada) > 0}
                  onChange={(e) => setForm({ ...form, custo_unitario: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente ao informar quantidade comprada e valor pago. Ao mudar o
                  custo, uma nova versão é registrada no histórico — pedidos antigos continuam com o
                  custo original.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="forn">Fornecedor</Label>
              <Input
                id="forn"
                value={form.fornecedor}
                maxLength={100}
                onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobs">Observações</Label>
              <Textarea
                id="mobs"
                value={form.observacoes}
                maxLength={500}
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

      {/* Movimentação */}
      <Dialog open={!!movimentoDe} onOpenChange={(o) => !o && setMovimentoDe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar {movimentoDe?.nome}</DialogTitle>
          </DialogHeader>
          <form onSubmit={registrarMovimento} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={movimento.tipo} onValueChange={(v) => setMovimento({ ...movimento, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (compra)</SelectItem>
                  <SelectItem value="saida">Saída (uso/perda)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qmov">Quantidade ({movimentoDe?.unidade})</Label>
              <Input
                id="qmov"
                type="number"
                step="any"
                min="0"
                value={movimento.quantidade}
                onChange={(e) => setMovimento({ ...movimento, quantidade: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="omov">Observação</Label>
              <Input
                id="omov"
                value={movimento.observacao}
                maxLength={200}
                onChange={(e) => setMovimento({ ...movimento, observacao: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMovimentoDe(null)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Histórico de custos */}
      <Dialog open={!!historicoDe} onOpenChange={(o) => !o && setHistoricoDe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de custo — {historicoDe?.nome}</DialogTitle>
          </DialogHeader>
          {historicoDe ? <HistoricoCustos material={historicoDe} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoricoCustos({ material }: { material: Material }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["custos_materiais", material.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custos_materiais")
        .select("*")
        .eq("material_id", material.id)
        .order("vigente_desde", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CustoMaterial[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhuma alteração registrada ainda.</p>;

  return (
    <ul className="divide-y divide-border text-sm">
      {data.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
          <span className="text-muted-foreground">{dataHoraBR(c.vigente_desde)}</span>
          <span className="font-medium">
            {brl(c.custo_unitario)} / {material.unidade}
          </span>
        </li>
      ))}
    </ul>
  );
}
