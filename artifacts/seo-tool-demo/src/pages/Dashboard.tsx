import { Link } from "wouter";
import { useListClients } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Plus,
  ArrowRight,
  Sparkles,
  Globe,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const { data: clients, isLoading } = useListClients();

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-16">
      <header className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          Overview
        </div>
        <h1 className="font-display text-5xl lg:text-6xl leading-[1.02] tracking-tight text-balance">
          Live SEO audits for{" "}
          <span className="font-display-italic text-accent">home service</span>{" "}
          businesses.
        </h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground max-w-2xl">
          Add a client, run a real audit on their live site + Google Business
          Profile, and walk them through what to fix next.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border">
        <Stat n={clients?.length ?? 0} label="Clients" sub="In your agency" />
        <Stat n={19} label="Checks per audit" sub="GBP · SEO · Perf · NAP" />
        <Stat
          n="60s"
          label="Average run"
          sub="Real Places + PSI calls"
        />
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Clients
            </div>
            <h2 className="font-display text-3xl tracking-tight">Recent activity</h2>
          </div>
          <Link href="/clients">
            <Button variant="ghost" className="gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : !clients || clients.length === 0 ? (
          <EmptyClients />
        ) : (
          <div className="border rounded-2xl overflow-hidden bg-card divide-y">
            {clients.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`}>
                <div className="group flex items-center gap-5 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0 font-display italic text-lg text-foreground/70">
                    {c.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium tracking-tight truncate">{c.name}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[12px] text-muted-foreground">
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {c.city}
                        </span>
                      )}
                      {c.websiteUrl && (
                        <span className="flex items-center gap-1 truncate max-w-[240px]">
                          <Globe className="h-3 w-3" />
                          {c.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                      )}
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

function Stat({
  n,
  label,
  sub,
}: {
  n: number | string;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-card px-6 py-7">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-5xl tracking-tight tabular-nums">
        {n}
      </div>
      <div className="text-[12px] text-muted-foreground mt-1.5">{sub}</div>
    </div>
  );
}

function EmptyClients() {
  return (
    <div className="border rounded-2xl bg-card px-6 py-16 text-center">
      <div
        aria-hidden
        className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center"
      >
        <Building2 className="h-6 w-6 text-accent" />
      </div>
      <h3 className="font-display text-2xl tracking-tight">No clients yet</h3>
      <p className="text-muted-foreground mt-2 text-[15px] max-w-md mx-auto">
        Add the agency's first real client to run a live audit. It takes about a
        minute end-to-end.
      </p>
      <Link href="/clients">
        <Button className="mt-6 gap-1.5">
          <Plus className="h-4 w-4" />
          Add a client
        </Button>
      </Link>
    </div>
  );
}
