import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignin, useSigninAsDemo } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setProviderId } from "@/lib/auth";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const signinMut = useSignin();
  const demoMut = useSigninAsDemo();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await signinMut.mutateAsync({ data: { email } });
      setProviderId(res.providerId);
      setLocation("/");
    } catch (e: any) {
      if (e?.status === 404)
        setErr("No account with that email — try signing up.");
      else setErr(e?.message ?? "Sign-in failed.");
    }
  }

  async function tryDemo() {
    setErr(null);
    try {
      const res = await demoMut.mutateAsync();
      setProviderId(res.providerId);
      setLocation("/");
    } catch (e: any) {
      setErr(e?.message ?? "Demo sign-in failed.");
    }
  }

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
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
          Sign in
        </div>
        <h2 className="font-display text-4xl tracking-tight text-balance">
          Welcome <span className="font-display-italic">back.</span>
        </h2>
        <p className="text-muted-foreground mt-3 text-[15px]">
          New here?{" "}
          <Link
            href="/signup"
            className="text-foreground underline underline-offset-4"
          >
            Get your first audit free
          </Link>
          .
        </p>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@business.com"
              className="h-11"
            />
          </div>
          {err && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {err}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 gap-2 text-base"
            disabled={signinMut.isPending}
          >
            {signinMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                or just exploring?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 gap-2 text-base"
            disabled={demoMut.isPending}
            onClick={tryDemo}
          >
            {demoMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-accent" />
                Try the demo
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
