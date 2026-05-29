import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null;
  status?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "light" | "dark";
}

function scoreMeta(score: number | null): {
  text: string;
  bar: string;
  label: string;
} {
  if (score == null)
    return {
      text: "text-muted-foreground",
      bar: "bg-muted-foreground/30",
      label: "Pending",
    };
  if (score >= 85)
    return { text: "text-emerald-500", bar: "bg-emerald-500", label: "Excellent" };
  if (score >= 70)
    return { text: "text-lime-500", bar: "bg-lime-500", label: "Solid" };
  if (score >= 50)
    return { text: "text-amber-500", bar: "bg-amber-500", label: "Needs work" };
  return { text: "text-red-500", bar: "bg-red-500", label: "Critical" };
}

const SIZE: Record<NonNullable<ScoreBadgeProps["size"]>, {
  num: string;
  label: string;
  width: string;
  barHeight: string;
}> = {
  sm: { num: "text-3xl", label: "text-[10px] tracking-[0.18em]", width: "w-14", barHeight: "h-[2px]" },
  md: { num: "text-5xl", label: "text-[11px] tracking-[0.22em]", width: "w-20", barHeight: "h-[2px]" },
  lg: { num: "text-7xl", label: "text-xs tracking-[0.24em]", width: "w-28", barHeight: "h-[3px]" },
  xl: { num: "text-[10rem] leading-[0.85]", label: "text-xs tracking-[0.28em]", width: "w-40", barHeight: "h-[3px]" },
};

export function ScoreBadge({
  score,
  status,
  size = "lg",
  tone = "light",
}: ScoreBadgeProps) {
  const meta = scoreMeta(score);
  const s = SIZE[size];
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score));

  const display =
    score == null
      ? status === "failed"
        ? "—"
        : status === "running"
          ? "··"
          : "—"
      : String(score);

  const labelColor = tone === "dark" ? "text-white/60" : "text-muted-foreground";

  return (
    <div className="flex flex-col items-start gap-3">
      <span
        className={cn(
          "font-display tabular-nums leading-none",
          s.num,
          score == null ? (tone === "dark" ? "text-white/70" : "text-foreground/60") : tone === "dark" ? "text-white" : "text-foreground",
        )}
      >
        {display}
      </span>
      <div className={cn(s.width, "flex flex-col gap-1.5")}>
        <div className={cn(s.barHeight, "w-full rounded-full overflow-hidden", tone === "dark" ? "bg-white/10" : "bg-foreground/8 bg-black/5")}>
          <div
            className={cn(s.barHeight, meta.bar, "rounded-full transition-all duration-700 ease-out")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn("uppercase font-medium", s.label, labelColor)}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}
