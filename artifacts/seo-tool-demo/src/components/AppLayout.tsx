import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, History, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { clearProviderId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/history", label: "Audit history", icon: History },
];

function Logomark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[8px] bg-accent text-accent-foreground font-display italic text-[18px] leading-none",
        className,
      )}
      style={{ width: 30, height: 30, paddingTop: 2 }}
    >
      R
    </span>
  );
}

function NavContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { data } = useGetCurrentUser();

  return (
    <>
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-8 shrink-0">
        <Logomark />
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-white">RankRight</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">
            SEO audit
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-px px-3 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNav?.()}
              className={cn(
                "group relative w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent" />
              )}
              <item.icon
                className={cn(
                  "h-[15px] w-[15px] shrink-0",
                  active ? "text-accent" : "text-white/40 group-hover:text-white/70",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent text-accent-foreground text-[11px] font-semibold">
              {(data?.agencyName ?? "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[13px] font-medium text-white truncate">
              {data?.agencyName ?? "—"}
            </span>
            <span className="text-[11px] text-white/50 truncate">{data?.email ?? ""}</span>
          </div>
        </div>
        <button
          onClick={() => {
            clearProviderId();
            window.location.assign("/login");
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-md py-1.5 text-[12px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <LogOut className="h-3 w-3" />
          Sign out
        </button>
      </div>
    </>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Open navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-r-0 flex flex-col">
        <NavContent onNav={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden lg:flex h-screen w-[248px] flex-col bg-sidebar text-sidebar-foreground sticky top-0 shrink-0 border-r border-sidebar-border">
        <NavContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-sidebar text-white border-b border-sidebar-border">
        <MobileMenu />
        <div className="flex items-center gap-2">
          <Logomark />
          <span className="text-base font-semibold tracking-tight">RankRight</span>
        </div>
      </div>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
