import { Link } from "wouter";
import { useGetAudit } from "@workspace/api-client-react";
import type { AuditCheck } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Lock,
  Sparkles,
  Globe,
  Gauge,
  Building2,
  Wrench,
  MapPin,
  LineChart,
  ArrowUpRight,
} from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { AiPlanCard } from "@/components/AiPlanCard";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  performance: { label: "Performance", icon: Gauge },
  gbp: { label: "Google Business Profile", icon: Building2 },
  seo: { label: "On-page SEO", icon: Sparkles },
  tech: { label: "Technical", icon: Wrench },
  nap: { label: "Citations · NAP", icon: MapPin },
  analytics: { label: "Analytics & Search", icon: LineChart },
};

function statusBits(status: AuditCheck["status"]): {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  dot: string;
  border: string;
} {
  switch (status) {
    case "pass":
      return {
        Icon: CheckCircle2,
        label: "Pass",
        dot: "bg-emerald-500",
        border: "border-l-emerald-500",
      };
    case "warn":
      return {
        Icon: AlertTriangle,
        label: "Needs work",
        dot: "bg-amber-500",
        border: "border-l-amber-500",
      };
    case "fail":
      return {
        Icon: XCircle,
        label: "Fail",
        dot: "bg-red-500",
        border: "border-l-red-500",
      };
    case "stub":
      return {
        Icon: Lock,
        label: "Connect to verify",
        dot: "bg-slate-400",
        border: "border-l-slate-300/60",
      };
    case "error":
    default:
      return {
        Icon: AlertCircle,
        label: "Error",
        dot: "bg-slate-400",
        border: "border-l-slate-300/60",
      };
  }
}

function fixThisNext(checks: AuditCheck[]): AuditCheck[] {
  const candidates = checks.filter(
    (c) => c.status === "fail" || c.status === "warn",
  );
  candidates.sort(
    (a, b) => b.weight * (100 - b.score) - a.weight * (100 - a.score),
  );
  return candidates.slice(0, 5);
}

function groupByCategory(checks: AuditCheck[]): Record<string, AuditCheck[]> {
  const out: Record<string, AuditCheck[]> = {};
  for (const c of checks) {
    (out[c.category] ??= []).push(c);
  }
  return out;
}

const CATEGORY_ORDER = ["performance", "gbp", "seo", "nap", "tech", "analytics"];

export default function AuditView({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetAudit(id, {
    query: {
      refetchInterval: (q: {
        state: { data?: { audit: { status: string } } };
      }) => {
        return q.state.data?.audit.status === "running" ? 2000 : false;
      },
    } as any,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-destructive">
          Audit not found.
        </div>
      </div>
    );
  }

  const { audit, client, checks } = data;
  const grouped = groupByCategory(checks);
  const topFixes = fixThisNext(checks);

  const counts = {
    pass: checks.filter((c) => c.status === "pass").length,
    warn: checks.filter((c) => c.status === "warn").length,
    fail: checks.filter((c) => c.status === "fail").length,
    stub: checks.filter((c) => c.status === "stub").length,
    error: checks.filter((c) => c.status === "error").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-14">
      <Link href="/">
        <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -ml-1 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to overview
        </button>
      </Link>

      {/* Hero score panel */}
      <section className="relative overflow-hidden rounded-3xl bg-sidebar text-white">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div
          aria-hidden
          className="absolute -top-40 -right-32 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(18 95% 56%) 0%, transparent 60%)",
          }}
        />
        <div className="relative p-8 lg:p-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/50 mb-8">
            <Sparkles className="h-3 w-3 text-accent" />
            SEO Audit
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16">
            <div className="lg:flex-1 min-w-0">
              <h1 className="font-display text-5xl lg:text-6xl leading-[1.02] tracking-tight text-balance">
                {client.name}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm text-white/60">
                {client.websiteUrl && (
                  <a
                    href={client.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {client.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
                <span>{new Date(audit.startedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="lg:flex-shrink-0">
              <ScoreBadge
                score={audit.score ?? null}
                status={audit.status}
                size="xl"
                tone="dark"
              />
            </div>
          </div>

          {/* Status breakdown */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <CountStat color="bg-emerald-500" n={counts.pass} label="Passing" />
            <CountStat color="bg-amber-500" n={counts.warn} label="Warnings" />
            <CountStat color="bg-red-500" n={counts.fail} label="Failing" />
            <CountStat color="bg-white/40" n={counts.stub} label="To connect" />
          </div>
        </div>

        {audit.status === "failed" && (
          <div className="relative px-8 lg:px-12 py-4 border-t border-white/10 bg-red-500/10 text-red-200 text-sm">
            Audit failed: {audit.error}
          </div>
        )}
      </section>

      {/* AI improvement plan */}
      {audit.status === "complete" && <AiPlanCard auditId={audit.id} />}

      {/* Fix this next */}
      {topFixes.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Priority queue
              </div>
              <h2 className="font-display text-3xl tracking-tight">
                Fix <span className="font-display-italic text-accent">this</span> next
              </h2>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden bg-card divide-y">
            {topFixes.map((c, i) => {
              const meta = CATEGORY_META[c.category];
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-5 px-5 sm:px-6 py-5"
                >
                  <div className="font-display text-3xl tabular-nums text-muted-foreground/70 w-8 shrink-0 leading-none pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[15px] tracking-tight">
                      {c.title}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {c.recommendation}
                    </p>
                  </div>
                  {meta && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 pt-1">
                      <meta.icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Findings by category */}
      <div className="space-y-12">
        {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => {
          const meta = CATEGORY_META[cat] ?? {
            label: cat,
            icon: Sparkles,
          };
          const Icon = meta.icon;
          return (
            <section key={cat}>
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/[0.04] border text-foreground/70">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl tracking-tight">
                  {meta.label}
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {grouped[cat].map((c) => (
                  <CheckCard key={c.id} check={c} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CountStat({
  color,
  n,
  label,
}: {
  color: string;
  n: number;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">
          {label}
        </span>
      </div>
      <div className="font-display text-4xl tabular-nums text-white">{n}</div>
    </div>
  );
}

function CheckCard({ check }: { check: AuditCheck }) {
  const s = statusBits(check.status);
  return (
    <div
      className={cn(
        "border-l-2 border rounded-xl bg-card p-5 transition-all hover:shadow-sm",
        s.border,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium text-[15px] tracking-tight leading-snug">
          {check.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 mt-0.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">
        {check.finding}
      </p>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {check.recommendation}
      </p>
    </div>
  );
}
