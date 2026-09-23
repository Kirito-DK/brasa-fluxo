import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Pencil, Trash2, Boxes } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useKitComponentes, useKits, useMateriais, useProdutos } from "@/lib/dados";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { brl, numeroBR } from "@/lib/format";
import { CATEGORIAS_PRODUTO, rotulo } from "@/lib/dominio";
import type { Kit, Produto } from "@/lib/tipos";

export const Route = createFileRoute("/_authenticated/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos e receitas — Ateliê" },
      { name: "description", content: "Modelos de velas, gesso e kits com ficha técnica e custo de produção." },
      { property: "og:title", content: "Produtos e receitas — Ateliê" },
      { property: "og:description", content: "Modelos de velas, gesso e kits com ficha técnica e custo de produção." },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  return (
    <div>
      <PageHeader
        titulo="Produtos e kits"
        descricao="Cadastre os modelos uma vez. Cor, essência e tamanho você escolhe no orçamento."
      />
      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="kits">Modelos de kit</TabsTrigger>
        </TabsList>
        <TabsContent value="produtos" className="mt-4">
          <AbaProdutos />
        </TabsContent>
        <TabsContent value="kits" className="mt-4">
          <AbaKits />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- PRODUTOS ---------------- */

const produtoVazio = { nome: "", categoria: "vela", descricao: "", ficha_tecnica: "" };

function AbaProdutos() {
  const qc = useQueryClient();
  const { data: produtos = [], isLoading } = useProdutos();
  const { data: materiais = [] } = useMateriais();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(produtoVazio);
  const [receitaDe, setReceitaDe] = useState<Produto | null>(null);
  const [excluir, setExcluir] = useState<Produto | null>(null);

  const { data: receitas = [] } = useQuery({
    queryKey: ["receitas_resumo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receitas")
        .select("id, produto_id, rendimento, receita_materiais(material_id, quantidade)");
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        produto_id: string;
        rendimento: number;
        receita_materiais: { material_id: string; quantidade: number }[];
      }[];
    },
  });

  const custoDoProduto = (produtoId: string) => {
    const r = receitas.find((x) => x.produto_id === produtoId);
    if (!r) return null;
    const rend = Number(r.rendimento) || 1;
    return (r.receita_materiais ?? []).reduce((t, i) => {
      const m = materiais.find((x) => x.id === i.material_id);
      return t + (m ? (Number(i.quantidade) / rend) * Number(m.custo_unitario) : 0);
    }, 0);
  };

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim() || null,
      ficha_tecnica: form.ficha_tecnica.trim() || null,
    };
    const { error } = editando
      ? await supabase.from("produtos").update(payload).eq("id", editando.id)
      : await supabase.from("produtos").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar o produto.");
      return;
    }
    toast.success("Produto salvo.");
    setAberto(false);
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    const { error } = await supabase.from("produtos").update({ ativo: false }).eq("id", excluir.id);
    if (error) toast.error("Não foi possível desativar o produto.");
    else toast.success("Produto desativado (o histórico é preservado).");
    setExcluir(null);
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  const ativos = produtos.filter((p) => p.ativo);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          className="gap-2"
          onClick={() => {
            setEditando(null);
            setForm(produtoVazio);
            setAberto(true);
          }}
        >
          <Plus className="size-4" /> Novo produto
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : ativos.length === 0 ? (
        <EstadoVazio
          icone={Package}
          titulo="Nenhum produto cadastrado"
          descricao="Crie modelos como 'Vela coração 80g' ou 'Gesso anjo 8cm' e defina a receita."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {ativos.map((p) => {
            const custo = custoDoProduto(p.id);
            return (
              <div key={p.id} className="card-artesanal p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg">{p.nome}</h3>
                    <p className="text-xs text-muted-foreground uppercase">
                      {rotulo(CATEGORIAS_PRODUTO, p.categoria)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setEditando(p);
                        setForm({
                          nome: p.nome,
                          categoria: p.categoria,
                          descricao: p.descricao ?? "",
                          ficha_tecnica: p.ficha_tecnica ?? "",
                        });
                        setAberto(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Desativar" onClick={() => setExcluir(p)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {p.descricao ? <p className="mt-2 text-sm text-muted-foreground">{p.descricao}</p> : null}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm">
                    Custo de materiais:{" "}
                    <strong>{custo === null ? "sem receita" : brl(custo)}</strong>
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setReceitaDe(p)}>
                    Ficha técnica
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pnome">Nome *</Label>
              <Input
                id="pnome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_PRODUTO.map((c) => (
                    <SelectItem key={c.valor} value={c.valor}>
                      {c.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdesc">Descrição</Label>
              <Input
                id="pdesc"
                value={form.descricao}
                maxLength={300}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pficha">Observações da ficha técnica</Label>
              <Textarea
                id="pficha"
                value={form.ficha_tecnica}
                maxLength={1000}
                onChange={(e) => setForm({ ...form, ficha_tecnica: e.target.value })}
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

      <Dialog open={!!receitaDe} onOpenChange={(o) => !o && setReceitaDe(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ficha técnica — {receitaDe?.nome}</DialogTitle>
          </DialogHeader>
          {receitaDe ? <EditorReceita produto={receitaDe} /> : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar {excluir?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto sai da lista, mas continua nos orçamentos e pedidos antigos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EditorReceita({ produto }: { produto: Produto }) {
  const qc = useQueryClient();
  const { data: materiais = [] } = useMateriais();
  const [materialId, setMaterialId] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const { data: receita, isLoading } = useQuery({
    queryKey: ["receita", produto.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("receitas")
        .select("id, rendimento, receita_materiais(id, material_id, quantidade)")
        .eq("produto_id", produto.id)
        .maybeSingle();
      return data as unknown as {
        id: string;
        rendimento: number;
        receita_materiais: { id: string; material_id: string; quantidade: number }[];
      } | null;
    },
  });

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!materialId || !Number(quantidade)) {
      toast.error("Escolha o material e informe a quantidade.");
      return;
    }
    let receitaId = receita?.id;
    if (!receitaId) {
      const { data, error } = await supabase
        .from("receitas")
        .insert({ produto_id: produto.id })
        .select("id")
        .single();
      if (error || !data) {
        toast.error("Não foi possível criar a receita.");
        return;
      }
      receitaId = data.id;
    }
    const { error } = await supabase
      .from("receita_materiais")
      .insert({ receita_id: receitaId, material_id: materialId, quantidade: Number(quantidade) });
    if (error) {
      toast.error("Não foi possível adicionar o material.");
      return;
    }
    setMaterialId("");
    setQuantidade("");
    toast.success("Material adicionado à ficha técnica.");
    qc.invalidateQueries({ queryKey: ["receita", produto.id] });
    qc.invalidateQueries({ queryKey: ["receitas_resumo"] });
  }

  async function remover(id: string) {
    await supabase.from("receita_materiais").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["receita", produto.id] });
    qc.invalidateQueries({ queryKey: ["receitas_resumo"] });
  }

  const linhas = receita?.receita_materiais ?? [];
  const custo = linhas.reduce((t, l) => {
    const m = materiais.find((x) => x.id === l.material_id);
    return t + (m ? Number(l.quantidade) * Number(m.custo_unitario) : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quanto de cada material é usado para produzir <strong>1 unidade</strong> deste produto.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : linhas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Nenhum material na ficha ainda.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {linhas.map((l) => {
            const m = materiais.find((x) => x.id === l.material_id);
            return (
              <li key={l.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span>
                  {m?.nome ?? "Material"} — {numeroBR(l.quantidade, 3)} {m?.unidade}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {brl(Number(l.quantidade) * Number(m?.custo_unitario ?? 0))}
                  </span>
                  <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remover(l.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm">
        Custo de materiais por unidade: <strong>{brl(custo)}</strong>
      </p>

      <form onSubmit={adicionar} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
        <Select value={materialId} onValueChange={setMaterialId}>
          <SelectTrigger>
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            {materiais.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome} ({m.unidade})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          step="any"
          min="0"
          placeholder="Qtd"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <Button type="submit">Adicionar</Button>
      </form>
    </div>
  );
}

/* ---------------- KITS ---------------- */

function AbaKits() {
  const qc = useQueryClient();
  const { data: kits = [], isLoading } = useKits();
  const { data: componentes = [] } = useKitComponentes();
  const { data: produtos = [] } = useProdutos();
  const { data: materiais = [] } = useMateriais();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [componentesDe, setComponentesDe] = useState<Kit | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do kit.");
      return;
    }
    const { error } = await supabase
      .from("kits")
      .insert({ nome: form.nome.trim(), descricao: form.descricao.trim() || null });
    if (error) {
      toast.error("Não foi possível salvar o kit.");
      return;
    }
    toast.success("Kit criado.");
    setForm({ nome: "", descricao: "" });
    setAberto(false);
    qc.invalidateQueries({ queryKey: ["kits"] });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button className="gap-2" onClick={() => setAberto(true)}>
          <Plus className="size-4" /> Novo modelo de kit
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : kits.length === 0 ? (
        <EstadoVazio
          icone={Boxes}
          titulo="Nenhum kit cadastrado"
          descricao="Monte kits reutilizáveis: 1 vela + 1 gesso + embalagem + etiqueta, por exemplo."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {kits.map((k) => {
            const meus = componentes.filter((c) => c.kit_id === k.id);
            return (
              <div key={k.id} className="card-artesanal p-4">
                <h3 className="font-display text-lg">{k.nome}</h3>
                {k.descricao ? (
                  <p className="text-sm text-muted-foreground">{k.descricao}</p>
                ) : null}
                <ul className="mt-3 space-y-1 text-sm">
                  {meus.length === 0 ? (
                    <li className="text-muted-foreground">Sem componentes ainda.</li>
                  ) : (
                    meus.map((c) => (
                      <li key={c.id}>
                        • {numeroBR(c.quantidade)}× {c.descricao}
                      </li>
                    ))
                  )}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setComponentesDe(k)}
                >
                  Editar composição
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo modelo de kit</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="knome">Nome *</Label>
              <Input
                id="knome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kdesc">Descrição</Label>
              <Input
                id="kdesc"
                value={form.descricao}
                maxLength={300}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar kit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!componentesDe} onOpenChange={(o) => !o && setComponentesDe(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Composição — {componentesDe?.nome}</DialogTitle>
          </DialogHeader>
          {componentesDe ? (
            <EditorKit
              kit={componentesDe}
              produtos={produtos}
              materiais={materiais.map((m) => ({ id: m.id, nome: m.nome, unidade: m.unidade }))}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditorKit({
  kit,
  produtos,
  materiais,
}: {
  kit: Kit;
  produtos: Produto[];
  materiais: { id: string; nome: string; unidade: string }[];
}) {
  const qc = useQueryClient();
  const { data: componentes = [] } = useKitComponentes();
  const [alvo, setAlvo] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const meus = componentes.filter((c) => c.kit_id === kit.id);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!alvo || !Number(quantidade)) {
      toast.error("Escolha um item e a quantidade.");
      return;
    }
    const [tipo, id] = alvo.split(":");
    const nome =
      tipo === "produto"
        ? (produtos.find((p) => p.id === id)?.nome ?? "Produto")
        : (materiais.find((m) => m.id === id)?.nome ?? "Material");
    const { error } = await supabase.from("kit_componentes").insert({
      kit_id: kit.id,
      produto_id: tipo === "produto" ? id : null,
      material_id: tipo === "material" ? id : null,
      descricao: nome,
      quantidade: Number(quantidade),
    });
    if (error) {
      toast.error("Não foi possível adicionar o componente.");
      return;
    }
    setAlvo("");
    setQuantidade("1");
    qc.invalidateQueries({ queryKey: ["kit_componentes"] });
  }

  async function remover(id: string) {
    await supabase.from("kit_componentes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["kit_componentes"] });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quantos de cada item entram em <strong>1 kit</strong>. Ao vender 50 kits o sistema multiplica
        tudo por 50.
      </p>

      {meus.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Nenhum componente ainda.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {meus.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span>
                {numeroBR(c.quantidade)}× {c.descricao}
              </span>
              <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remover(c.id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionar} className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
        <Select value={alvo} onValueChange={setAlvo}>
          <SelectTrigger>
            <SelectValue placeholder="Produto ou material" />
          </SelectTrigger>
          <SelectContent>
            {produtos
              .filter((p) => p.ativo && p.categoria !== "kit")
              .map((p) => (
                <SelectItem key={p.id} value={`produto:${p.id}`}>
                  Produto · {p.nome}
                </SelectItem>
              ))}
            {materiais.map((m) => (
              <SelectItem key={m.id} value={`material:${m.id}`}>
                Material · {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          step="any"
          min="0"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <Button type="submit">Adicionar</Button>
      </form>
    </div>
  );
}
