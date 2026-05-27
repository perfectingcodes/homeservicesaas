import React, { useState } from "react";
import {
  BarChart,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Users,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "#dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "#local-rankings", label: "Local Rankings", icon: MapPin },
  { href: "#reviews", label: "Reviews", icon: MessageSquare },
  { href: "#competitors", label: "Competitors", icon: Users },
  { href: "#leads", label: "Leads", icon: TrendingUp },
  { href: "#google-business", label: "Google Business", icon: BarChart },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavContent({ onNav }: { onNav?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 p-6 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold text-sm">R</div>
        <span className="text-xl font-bold tracking-tight text-white">RankRight</span>
      </div>

      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <Avatar className="h-10 w-10 border-2 border-accent">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">MH</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">Mike's HVAC & Plumbing</span>
            <span className="text-xs text-sidebar-foreground/70">Austin, TX</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => { scrollTo(item.href); onNav?.(); }}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <item.icon className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground sticky top-0 shrink-0">
        <NavContent />
      </div>

      {/* Mobile top bar + sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-sidebar text-white border-b border-sidebar-border shadow-sm">
        <MobileMenu />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold text-xs">R</div>
          <span className="text-lg font-bold tracking-tight">RankRight</span>
        </div>
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
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
          aria-label="Open navigation"
          data-testid="button-mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r-0">
        <NavContent onNav={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
