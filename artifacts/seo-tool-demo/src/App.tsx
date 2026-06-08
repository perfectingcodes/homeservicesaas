import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { queryClient } from "@/lib/queryClient";
import { getProviderId } from "@/lib/auth";

import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import AuditView from "@/pages/AuditView";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const hasAuth = getProviderId();
  if (!hasAuth) {
    setLocation("/signup");
    return null;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route path="/signin" component={Login} />
          <Route path="/login" component={Login} />
          <Route>
            <AuthGate>
              <AppLayout>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/history" component={History} />
                  <Route path="/audits/:id">
                    {(params) => <AuditView id={params.id} />}
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </AppLayout>
            </AuthGate>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
