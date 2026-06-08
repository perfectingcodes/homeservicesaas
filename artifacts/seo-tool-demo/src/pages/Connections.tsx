import { useState } from "react";
import {
  useListConnections,
  useUpsertConnection,
  useDeleteConnection,
  getListConnectionsQueryKey,
} from "@workspace/api-client-react";
import type { Connection } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  BarChart3,
  Search,
  Check,
  Loader2,
  Unplug,
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
}[] = [
  {
    key: "gbp",
    name: "Google Business Profile",
    blurb:
      "Pulls your real GBP photos, hours, categories, posts and reviews — the single biggest local ranking signal.",
    unlocks: "Verified GBP checks · Review tracking · Post scheduling",
    Icon: Building2,
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    key: "ga4",
    name: "Google Analytics 4",
    blurb:
      "Pulls traffic, conversion, and top-landing-page data so audits can score what's actually driving calls.",
    unlocks: "Traffic-aware scoring · Conversion attribution",
    Icon: BarChart3,
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "gsc",
    name: "Google Search Console",
    blurb:
      "Pulls real impressions, click-through rate, and indexing issues for every keyword you rank for.",
    unlocks: "Real keyword data · Indexing coverage · CTR opportunities",
    Icon: Search,
    iconBg: "bg-violet-500/10 text-violet-600",
  },
];

export default function Connections() {
  const qc = useQueryClient();
  const { data, isLoading } = useListConnections();
  const upsertMut = useUpsertConnection({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getListConnectionsQueryKey() }),
    },
  });
  const deleteMut = useDeleteConnection({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getListConnectionsQueryKey() }),
    },
  });

  const byProvider = new Map<ProviderKey, Connection>();
  for (const c of data ?? []) {
    byProvider.set(c.provider as ProviderKey, c);
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

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card divide-y">
          {PROVIDERS.map((p) => {
            const connected = byProvider.get(p.key);
            return (
              <ProviderRow
                key={p.key}
                provider={p}
                connected={connected}
                onConnect={(accessToken, externalAccountId) =>
                  upsertMut.mutateAsync({
                    data: {
                      provider: p.key,
                      accessToken: accessToken || null,
                      externalAccountId: externalAccountId || null,
                    },
                  })
                }
                onDisconnect={() =>
                  deleteMut.mutateAsync({ provider: p.key })
                }
                busy={upsertMut.isPending || deleteMut.isPending}
              />
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">A note on dev mode:</strong>{" "}
        OAuth round-trips require Google Cloud client IDs that aren't
        provisioned yet. For now the Connect button takes a token directly so
        you can wire a real account in seconds — full Google OAuth lands in
        the next release.
      </div>
    </div>
  );
}

function ProviderRow({
  provider,
  connected,
  onConnect,
  onDisconnect,
  busy,
}: {
  provider: (typeof PROVIDERS)[number];
  connected?: Connection;
  onConnect: (accessToken: string, externalAccountId: string) => Promise<unknown>;
  onDisconnect: () => Promise<unknown>;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");

  const Icon = provider.Icon;

  return (
    <div className="flex items-start gap-5 px-5 sm:px-6 py-6">
      <span
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
          provider.iconBg,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[15px] tracking-tight">
            {provider.name}
          </span>
          {connected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Check className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Not connected
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {provider.blurb}
        </p>
        <p className="text-[12px] text-muted-foreground/80 mt-2">
          <span className="uppercase tracking-wider mr-1">Unlocks:</span>
          {provider.unlocks}
        </p>
        {connected?.externalAccountId && (
          <p className="text-[11px] font-mono text-muted-foreground/70 mt-2">
            {connected.externalAccountId}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {connected ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={onDisconnect}
          >
            <Unplug className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                Connect
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-tight">
                  Connect {provider.name}
                </DialogTitle>
                <DialogDescription>
                  Paste an access token (and optionally the account id) to wire
                  this connection while OAuth is being provisioned.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 mt-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onConnect(token, accountId);
                  setToken("");
                  setAccountId("");
                  setOpen(false);
                }}
              >
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Access token
                  </Label>
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="ya29..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Account id (optional)
                  </Label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <DialogFooter className="!justify-between gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save connection
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
