import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

import Dashboard from "@/pages/Dashboard";
import LocalRankings from "@/pages/LocalRankings";
import Reviews from "@/pages/Reviews";
import Competitors from "@/pages/Competitors";
import Leads from "@/pages/Leads";
import GoogleBusiness from "@/pages/GoogleBusiness";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/local-rankings" component={LocalRankings} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/competitors" component={Competitors} />
        <Route path="/leads" component={Leads} />
        <Route path="/profile" component={GoogleBusiness} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
