import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useSignup, useSigninAsDemo } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setProviderId } from "@/lib/auth";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const signupMut = useSignup();
  const demoMut = useSigninAsDemo();
  const [form, setForm] = useState({
    email: "",
    ownerName: "",
    businessName: "",
    websiteUrl: "",
    city: "",
    phone: "",
  });
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await signupMut.mutateAsync({
        data: {
          email: form.email,
          ownerName: form.ownerName || null,
          businessName: form.businessName,
          websiteUrl: form.websiteUrl || null,
          city: form.city || null,
          phone: form.phone || null,
        },
      });
      setProviderId(res.providerId);
      setLocation("/");
    } catch (e: any) {
      setErr(
        e?.message ?? "Couldn't create your account. Try again in a moment.",
      );
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-sidebar text-white overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(circle, hsl(18 95% 56%) 0%, transparent 60%)",
          }}
        />

        <header className="relative z-10 px-12 pt-10 flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center rounded-[8px] bg-accent text-accent-foreground font-display italic text-[18px] leading-none"
            style={{ width: 30, height: 30, paddingTop: 2 }}
          >
            R
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            RankRight
          </span>
        </header>

        <div className="relative z-10 px-12 pb-16 max-w-xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50 mb-6">
            <Sparkles className="h-3 w-3 text-accent" />
            For home service businesses
          </div>
          <h1 className="text-5xl xl:text-[3.75rem] leading-[1.02] font-display tracking-tight text-white text-balance">
            Find out{" "}
            <span className="font-display-italic text-accent">why</span> you're
            not getting more local calls.
          </h1>
          <p className="mt-6 text-white/60 text-[15px] leading-relaxed max-w-md">
            We run a real audit on your Google Business Profile, website, and
            mobile speed — score it, and tell you in plain English what to fix
            first. Built for HVAC, plumbing, electrical, roofing, and cleaning
            businesses.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md">
            <Stat n="19" label="checks" />
            <Stat n="60s" label="per audit" />
            <Stat n="$0" label="to start" />
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
            <span className="text-base font-semibold tracking-tight">
              RankRight
            </span>
          </div>

          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">
            Get your free audit
          </div>
          <h2 className="font-display text-4xl tracking-tight text-balance">
            Audit{" "}
            <span className="font-display-italic">your business</span> in 60 seconds.
          </h2>
          <p className="text-muted-foreground mt-3 text-[15px]">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
            .
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <Field
              id="businessName"
              label="Business name"
              value={form.businessName}
              onChange={(v) => setForm((f) => ({ ...f, businessName: v }))}
              required
              placeholder="Mike's HVAC & Plumbing"
            />
            <Field
              id="websiteUrl"
              label="Website"
              type="url"
              value={form.websiteUrl}
              onChange={(v) => setForm((f) => ({ ...f, websiteUrl: v }))}
              placeholder="https://www.mikeshvacaustin.com"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="city"
                label="City"
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                placeholder="Austin, TX"
              />
              <Field
                id="phone"
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="(512) 555-1234"
              />
            </div>
            <Field
              id="email"
              label="Your email"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              required
              placeholder="you@business.com"
            />

            {err && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {err}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 gap-2 text-base"
              disabled={signupMut.isPending}
            >
              {signupMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Run my first audit
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              No credit card. We never email you marketing junk.
            </p>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  or just kicking the tires?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12 gap-2 text-base"
              disabled={demoMut.isPending}
              onClick={async () => {
                try {
                  const res = await demoMut.mutateAsync();
                  setProviderId(res.providerId);
                  setLocation("/");
                } catch (e: any) {
                  const status = e?.status;
                  if (status === 502 || status === 503 || status === 504) {
                    setErr(
                      "API isn't reachable (gateway error). Make sure the api-server is running on port 5000 and DATABASE_URL is set.",
                    );
                  } else if (status === 500) {
                    setErr(
                      `Demo bootstrap failed: ${e?.data?.message ?? e?.message ?? "unknown error"}. Common cause: DB schema not pushed (\`pnpm --filter @workspace/db run push\`).`,
                    );
                  } else {
                    setErr(
                      e?.message
                        ? `${e.message}${status ? ` (HTTP ${status})` : ""}`
                        : "Demo sign-in failed.",
                    );
                  }
                }
              }}
            >
              {demoMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-accent" />
                  Try the demo instead
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11"
      />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl tracking-tight text-white">
        {n}
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/50 mt-1">
        {label}
      </div>
    </div>
  );
}
