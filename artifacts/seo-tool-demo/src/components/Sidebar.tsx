import React from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Users,
  Settings,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/local-rankings", label: "Local Rankings", icon: MapPin },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/leads", label: "Leads", icon: TrendingUp },
  { href: "/profile", label: "Google Business", icon: BarChart },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold">
          R
        </div>
        <span className="text-xl font-bold font-display tracking-tight text-white">RankRight</span>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <Avatar className="h-10 w-10 border-2 border-accent">
            <AvatarImage src="" />
            <AvatarFallback className="bg-accent text-accent-foreground">MH</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Mike's HVAC & Plumbing</span>
            <span className="text-xs text-sidebar-foreground/70">Austin, TX</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-accent-foreground" : "text-sidebar-foreground/60"}`} />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-white">
          <Settings className="h-4 w-4 text-sidebar-foreground/60" />
          Settings
        </button>
      </div>
    </div>
  );
}
