import { cn } from "@/lib/utils";
import type { TomBadge } from "@/lib/dominio";

const tons: Record<TomBadge, string> = {
  neutro: "bg-muted text-muted-foreground border-border",
  andamento: "bg-accent text-accent-foreground border-accent",
  sucesso: "bg-success/15 text-success border-success/30",
  alerta: "bg-warning/20 text-warning-foreground border-warning/40",
  perigo: "bg-destructive/12 text-destructive border-destructive/30",
};

export function StatusBadge({
  children,
  tom = "neutro",
  className,
}: {
  children: React.ReactNode;
  tom?: TomBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tons[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
