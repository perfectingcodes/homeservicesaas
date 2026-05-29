import { Link, useLocation } from "wouter";
import {
  useGetClient,
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
  ChevronLeft,
  Globe,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientDetail({ id }: { id: string }) {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const { data: client, isLoading: clientLoading, isError } = useGetClient(id);
  const { data: audits, isLoading: auditsLoading } = useListClientAudits(id);

  const runMut = useRunAudit({
    mutation: {
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: getListClientAuditsQueryKey(id) });
        setLocation(`/audits/${res.audit.id}`);
      },
    },
  });

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-destructive">
          Client not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-10">
      <Link href="/clients">
        <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -ml-1 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          All clients
        </button>
      </Link>

      {clientLoading || !client ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Client
            </div>
            <h1 className="font-display text-5xl tracking-tight text-balance">
              {client.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
              {client.websiteUrl && (
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {client.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
              {client.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.city}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {client.phone}
                </span>
              )}
            </div>
          </div>

          <Button
            size="lg"
            className="gap-2 shrink-0 h-12 px-6 text-base"
            disabled={runMut.isPending}
            onClick={() => runMut.mutate({ data: { clientId: client.id } })}
          >
            {runMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running audit…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run audit
              </>
            )}
          </Button>
        </header>
      )}

      <section>
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4">
          History
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
              Click <strong className="text-foreground">Run audit</strong> above to get the first score.
              A full audit takes ~30–60 seconds.
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
