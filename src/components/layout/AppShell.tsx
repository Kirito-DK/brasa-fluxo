import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Factory,
  Package,
  Boxes,
  Users,
  Wallet,
  CalendarDays,
  Settings,
  Menu,
  X,
  Flame,
  Search,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/painel", rotulo: "Dashboard", icone: LayoutDashboard },
  { to: "/orcamentos", rotulo: "Orçamentos", icone: FileText },
  { to: "/pedidos", rotulo: "Pedidos", icone: ClipboardList },
  { to: "/producao", rotulo: "Produção", icone: Factory },
  { to: "/calendario", rotulo: "Calendário", icone: CalendarDays },
  { to: "/produtos", rotulo: "Produtos", icone: Package },
  { to: "/estoque", rotulo: "Estoque", icone: Boxes },
  { to: "/clientes", rotulo: "Clientes", icone: Users },
  { to: "/financeiro", rotulo: "Financeiro", icone: Wallet },
  { to: "/configuracoes", rotulo: "Configurações", icone: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!busca.trim()) return;
    setAberto(false);
    navigate({ to: "/busca", search: { q: busca.trim() } });
  }

  const menu = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const ativo = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setAberto(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              ativo
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <item.icone className="size-4 shrink-0" />
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="rounded-full bg-primary/12 p-2">
            <Flame className="size-5 text-primary" />
          </div>
          <span className="font-display text-lg">Ateliê</span>
        </div>
        <div className="flex-1 overflow-y-auto">{menu}</div>
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={sair}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Drawer mobile */}
      {aberto ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setAberto(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-soft">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-display text-lg">Ateliê</span>
              <Button variant="ghost" size="icon" onClick={() => setAberto(false)} aria-label="Fechar menu">
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">{menu}</div>
            <div className="border-t border-sidebar-border p-3">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={sair}>
                <LogOut className="size-4" /> Sair
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
          <form onSubmit={buscar} className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar pedido, cliente, WhatsApp..."
              className="pl-9"
              aria-label="Busca global"
            />
          </form>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-muted-foreground">{descricao}</p> : null}
      </div>
      {acao}
    </div>
  );
}
