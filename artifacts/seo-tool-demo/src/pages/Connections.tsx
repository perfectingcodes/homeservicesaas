import { useEffect, useState } from "react";
import {
  useListConnections,
  useDeleteConnection,
  startGoogleOAuth,
  getListConnectionsQueryKey,
} from "@workspace/api-client-react";
import type { Connection } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  BarChart3,
  Search,
  Check,
  Loader2,
  Unplug,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProviderKey = "gbp" | "ga4" | "gsc";

const PROVIDERS: {
  key: ProviderKey;
  name: string;
  blurb: string;
  unlocks: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  oauthAvailable: boolean;
  note?: string;
}[] = [
  {
    key: "ga4",
    name: "Google Analytics 4",
    blurb:
      "Pulls last-28-day sessions, conversions, and conversion rate so audits score what's actually driving calls.",
    unlocks: "Real traffic-aware scoring · Conversion attribution",
    Icon: BarChart3,
    iconBg: "bg-emerald-500/10 text-emerald-600",
    oauthAvailable: true,
  },
  {
    key: "gsc",
    name: "Google Search Console",
    blurb:
      "Pulls last-28-day impressions, clicks, CTR and your top queries for every page that ranks.",
    unlocks: "Real keyword data · CTR opportunities · Top-query insights",
    Icon: Search,
    iconBg: "bg-violet-500/10 text-violet-600",
    oauthAvailable: true,
  },
  {
    key: "gbp",
    name: "Google Business Profile",
    blurb:
      "Pulls your real GBP photos, hours, categories, posts and reviews — the single biggest local ranking signal.",
    unlocks: "Verified GBP checks · Review tracking · Post scheduling",
    Icon: Building2,
    iconBg: "bg-blue-500/10 text-blue-600",
    oauthAvailable: false,
    note: "GBP API access requires Google approval (1–2 weeks). Apply at developers.google.com/my-business — connect lights up the day they approve you.",
  },
];

function useUrlBanner(): {
  banner: { kind: "success" | "error"; msg: string } | null;
  clear: () => void;
} {
  const [banner, setBanner] = useState<{
    kind: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const connected = url.searchParams.get("connected");
    const err = url.searchParams.get("error");
    if (connected) {
      setBanner({
        kind: "success",
        msg: `${connected.toUpperCase()} connected. Your next audit will use real data.`,
      });
    } else if (err) {
      setBanner({ kind: "error", msg: decodeURIComponent(err) });
    }
    if (connected || err) {
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  return { banner, clear: () => setBanner(null) };
}

export default function Connections() {
  const qc = useQueryClient();
  const { data, isLoading } = useListConnections();
  const [starting, setStarting] = useState<ProviderKey | null>(null);
  const deleteMut = useDeleteConnection({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getListConnectionsQueryKey() }),
    },
  });
  const { banner, clear } = useUrlBanner();

  const byProvider = new Map<ProviderKey, Connection>();
  for (const c of data ?? []) {
    byProvider.set(c.provider as ProviderKey, c);
  }

  async function connect(provider: ProviderKey) {
    setStarting(provider);
    try {
      const res = await startGoogleOAuth({ provider });
      window.location.assign(res.url);
    } catch (e: any) {
      const msg =
        e?.status === 503
          ? (e?.data?.message ??
            "Google OAuth isn't configured on the server yet. See replit.md for setup.")
          : (e?.message ?? "Couldn't start OAuth.");
      alert(msg);
      setStarting(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 lg:py-14 space-y-10">
      <header className="space-y-3">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Plug it in
        </div>
        <h1 className="font-display text-5xl tracking-tight text-balance">
          Connect your <span className="font-display-italic">accounts.</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
          The more you connect, the smarter every audit gets. We only read —
          we never post, change, or share anything. Disconnect any time.
        </p>
      </header>

      {banner && (
        <div
          className={cn(
            "rounded-2xl border p-4 flex items-start gap-3 text-sm",
            banner.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700"
              : "border-destructive/30 bg-destructive/5 text-destructive",
          )}
        >
          {banner.kind === "success" ? (
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{banner.msg}</span>
          <button
            onClick={clear}
            className="text-xs underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card divide-y">
          {PROVIDERS.map((p) => {
            const connected = byProvider.get(p.key);
            return (
              <div
                key={p.key}
                className="flex items-start gap-5 px-5 sm:px-6 py-6"
              >
                <span
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                    p.iconBg,
                  )}
                >
                  <p.Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[15px] tracking-tight">
                      {p.name}
                    </span>
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : !p.oauthAvailable ? (
                      <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Awaiting Google approval
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {p.blurb}
                  </p>
                  <p className="text-[12px] text-muted-foreground/80 mt-2">
                    <span className="uppercase tracking-wider mr-1">
                      Unlocks:
                    </span>
                    {p.unlocks}
                  </p>
                  {connected?.externalAccountId && (
                    <p className="text-[11px] font-mono text-muted-foreground/70 mt-2 truncate">
                      {connected.externalAccountId}
                    </p>
                  )}
                  {p.note && (
                    <p className="text-[12px] text-amber-700 mt-2">{p.note}</p>
                  )}
                </div>

                <div className="shrink-0">
                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={deleteMut.isPending}
                      onClick={() =>
                        deleteMut.mutate({ provider: p.key })
                      }
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={!p.oauthAvailable || starting === p.key}
                      onClick={() => connect(p.key)}
                    >
                      {starting === p.key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <GoogleMark />
                      )}
                      Connect with Google
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Setup needed on the server:</strong>{" "}
        Connect-with-Google needs <code className="font-mono text-foreground">GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
        <code className="font-mono text-foreground">GOOGLE_OAUTH_CLIENT_SECRET</code>{" "}
        env vars (free, 5 min in Google Cloud Console). See{" "}
        <code className="font-mono">replit.md</code> for the exact steps. Until those are set, the Connect buttons return a clear error and don't blow up.
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" aria-hidden>
      <path
        fill="currentColor"
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z"
      />
      <path
        fill="currentColor"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="currentColor"
        d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.34z"
      />
      <path
        fill="currentColor"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
