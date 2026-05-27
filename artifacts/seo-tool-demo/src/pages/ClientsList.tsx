import { useState } from "react";
import { Link } from "wouter";
import {
  useListClients,
  useCreateClient,
  getListClientsQueryKey,
} from "@workspace/api-client-react";
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
  Plus,
  Loader2,
  Globe,
  MapPin,
  ArrowUpRight,
  Building2,
} from "lucide-react";

export default function ClientsList() {
  const qc = useQueryClient();
  const { data: clients, isLoading, isError, error } = useListClients();
  const createMut = useCreateClient({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getListClientsQueryKey() }),
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    websiteUrl: "",
    city: "",
    phone: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createMut.mutateAsync({
      data: {
        name: form.name,
        websiteUrl: form.websiteUrl || null,
        city: form.city || null,
        phone: form.phone || null,
      },
    });
    setForm({ name: "", websiteUrl: "", city: "", phone: "" });
    setOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
            Agency
          </div>
          <h1 className="font-display text-5xl tracking-tight text-balance">
            Clients
          </h1>
          <p className="text-muted-foreground mt-3 text-[15px] max-w-xl">
            Audit subjects in your agency. Add a real client to run a live audit
            against their Google Business Profile and website.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl tracking-tight">
                Add a client
              </DialogTitle>
              <DialogDescription>
                We'll resolve the Google Business Profile on the first audit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Business name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="Mike's HVAC & Plumbing"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="websiteUrl"
                  className="text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                  }
                  placeholder="https://www.mikeshvacaustin.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="city"
                    className="text-[11px] uppercase tracking-wider text-muted-foreground"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Austin, TX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-[11px] uppercase tracking-wider text-muted-foreground"
                  >
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="(512) 555-1234"
                  />
                </div>
              </div>
              <DialogFooter className="!justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-5 text-destructive">
          Couldn't load clients: {(error as Error)?.message ?? "unknown error"}
        </div>
      )}

      {!isLoading && clients && clients.length === 0 && (
        <div className="border rounded-2xl bg-card px-6 py-16 text-center">
          <div
            aria-hidden
            className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center"
          >
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-display text-2xl tracking-tight">No clients yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Add the agency's first real client and you can run a live audit in
            under a minute.
          </p>
          <Button className="mt-6 gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        </div>
      )}

      {clients && clients.length > 0 && (
        <div className="border rounded-2xl overflow-hidden bg-card divide-y">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <div className="group flex items-center gap-5 px-5 sm:px-6 py-5 hover:bg-muted/40 transition-colors cursor-pointer">
                <div className="h-11 w-11 rounded-xl bg-foreground/[0.04] border flex items-center justify-center shrink-0 font-display italic text-xl text-foreground/70">
                  {c.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium tracking-tight truncate text-[15px]">
                    {c.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[12px] text-muted-foreground">
                    {c.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.city}
                      </span>
                    )}
                    {c.websiteUrl && (
                      <span className="flex items-center gap-1 truncate max-w-[280px]">
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
    </div>
  );
}
