import type { LucideIcon } from "lucide-react";

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-accent/60 p-4">
        <Icone className="size-6 text-accent-foreground" />
      </div>
      <h3 className="font-display text-lg">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      {acao ? <div className="mt-5">{acao}</div> : null}
    </div>
  );
}
