import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setProviderId } from "@/lib/auth";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [id, setId] = useState("dev-user");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setProviderId(id.trim() || "dev-user");
    setLocation("/");
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-sidebar text-white overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, hsl(18 95% 56%) 0%, transparent 60%)" }}
        />

        <header className="relative z-10 px-12 pt-10 flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center rounded-[8px] bg-accent text-accent-foreground font-display italic text-[18px] leading-none"
            style={{ width: 30, height: 30, paddingTop: 2 }}
          >
            R
          </span>
          <span className="text-[15px] font-semibold tracking-tight">RankRight</span>
        </header>

        <div className="relative z-10 px-12 pb-16 max-w-xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50 mb-6">
            <Sparkles className="h-3 w-3 text-accent" />
            Local SEO, audited live
          </div>
          <h1 className="text-5xl xl:text-[3.75rem] leading-[1.02] font-display tracking-tight text-white text-balance">
            See exactly{" "}
            <span className="font-display-italic text-accent">what's holding</span>{" "}
            your client's ranking back.
          </h1>
          <p className="mt-6 text-white/60 text-[15px] leading-relaxed max-w-md">
            Real audits across Google Business Profile, on-page SEO, mobile
            performance, and NAP consistency — scored, prioritized, and ready to
            walk a client through.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md">
            <Stat n="19" label="checks" />
            <Stat n="< 1m" label="setup" />
            <Stat n="60s" label="per audit" />
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-16">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <span
              className="inline-flex items-center justify-center rounded-[8px] bg-accent text-accent-foreground font-display italic text-[18px] leading-none"
              style={{ width: 30, height: 30, paddingTop: 2 }}
            >
              R
            </span>
            <span className="text-base font-semibold tracking-tight">RankRight</span>
          </div>

          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">
            Sign in
          </div>
          <h2 className="font-display text-4xl tracking-tight text-balance">
            Welcome <span className="font-display-italic">back.</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-[15px]">
            Enter your provider id. The seed creates{" "}
            <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[13px]">
              dev-user
            </code>
            . Clerk / Supabase swap-in uses the same header.
          </p>

          <form className="mt-10 space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="providerId" className="text-xs uppercase tracking-wider text-muted-foreground">
                Provider id
              </Label>
              <Input
                id="providerId"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="dev-user"
                autoFocus
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="w-full h-12 gap-2 text-base">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl tracking-tight text-white">{n}</div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/50 mt-1">
        {label}
      </div>
    </div>
  );
}
