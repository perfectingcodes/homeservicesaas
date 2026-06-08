import { Link, useLocation } from "wouter";
import {
  useGetCurrentUser,
  useListClientAudits,
  useRunAudit,
  getListClientAuditsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Loader2,
  Sparkles,
  ArrowUpRight,
  Globe,
  MapPin,
  Phone,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: me, isLoading } = useGetCurrentUser();
  const businessId = me?.businessId ?? "";
  const { data: audits, isLoading: auditsLoading } = useListClientAudits(
    businessId,
    { query: { enabled: !!businessId } as any },
  );

  const runMut = useRunAudit({
    mutation: {
      onSuccess: (res) => {
        qc.invalidateQueries({
          queryKey: getListClientAuditsQueryKey(businessId),
        });
        setLocation(`/audits/${res.audit.id}`);
      },
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const latest = audits?.[0];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-14">
      {/* Header */}
      <header className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          {me?.businessName ?? "Your business"}
        </div>
        <h1 className="font-display text-5xl lg:text-6xl leading-[1.02] tracking-tight text-balance">
          Hey there{me?.name ? `, ${me.name.split(" ")[0]}` : ""}.{" "}
          <span className="font-display-italic text-accent">Ready</span> for
          your next audit?
        </h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground max-w-2xl">
          One click runs a fresh audit on your Google Business Profile, mobile
          speed, on-page SEO, and citation consistency. Takes about a minute.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            className="gap-2 h-12 px-6 text-base"
            disabled={runMut.isPending || !businessId}
            onClick={() =>
              businessId && runMut.mutate({ data: { clientId: businessId } })
            }
          >
            {runMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running your audit…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run audit now
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Latest audit summary */}
      {latest && (
        <section>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Latest audit
          </div>
          <Link href={`/audits/${latest.id}`}>
            <div className="group border rounded-2xl bg-card px-6 py-7 hover:bg-muted/40 cursor-pointer transition-colors flex items-center gap-8">
              <div>
                <div className="font-display text-6xl tabular-nums tracking-tight leading-none">
                  {latest.score ?? "—"}
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-2">
                  Score
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium tracking-tight">
                  {new Date(latest.startedAt).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <StatusInline status={latest.status} />
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
            </div>
          </Link>
        </section>
      )}

      {/* Business profile card */}
      <section>
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">
          Your business
        </div>
        <div className="border rounded-2xl bg-card px-6 py-6">
          <div className="font-display text-3xl tracking-tight">
            {me?.businessName ?? "—"}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Website on file
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              City on file
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Edit in settings
            </span>
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">
          Audit history
        </div>
        {auditsLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : !audits || audits.length === 0 ? (
          <div className="border rounded-2xl bg-card px-6 py-14 text-center">
            <Clock className="h-7 w-7 mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="font-display text-2xl tracking-tight">
              No audits yet
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Run your first audit above. It takes about a minute and the
              results stick around so you can compare.
            </p>
          </div>
        ) : (
          <div className="border rounded-2xl overflow-hidden bg-card divide-y">
            {audits.map((a) => (
              <Link key={a.id} href={`/audits/${a.id}`}>
                <div className="group flex items-center gap-5 px-5 sm:px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="w-14 shrink-0">
                    <div className="font-display text-3xl tabular-nums tracking-tight">
                      {a.score ?? "—"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px] tracking-tight">
                      {new Date(a.startedAt).toLocaleString()}
                    </div>
                    <div className="text-[12px] mt-0.5">
                      <StatusInline status={a.status} />
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusInline({ status }: { status: string }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    );
  }
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full bg-emerald-500")} />
        Complete
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <XCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }
  return null;
}
