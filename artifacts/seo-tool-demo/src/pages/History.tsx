import { Link } from "wouter";
import {
  useGetCurrentUser,
  useListClientAudits,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowUpRight, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function History() {
  const { data: me } = useGetCurrentUser();
  const businessId = me?.businessId ?? "";
  const { data: audits, isLoading } = useListClientAudits(businessId, {
    query: { enabled: !!businessId } as any,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-10">
      <header>
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
          Past audits
        </div>
        <h1 className="font-display text-5xl tracking-tight">History</h1>
      </header>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : !audits || audits.length === 0 ? (
        <div className="border rounded-2xl bg-card px-6 py-14 text-center">
          <Clock className="h-7 w-7 mx-auto mb-3 text-muted-foreground/60" />
          <h3 className="font-display text-2xl tracking-tight">
            No audits yet
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Head to the Overview to run your first one.
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
    </div>
  );
}

function StatusInline({ status }: { status: string }) {
  if (status === "running")
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    );
  if (status === "complete")
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full bg-emerald-500")} />
        Complete
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <XCircle className="h-3 w-3" />
        Failed
      </span>
    );
  return null;
}
