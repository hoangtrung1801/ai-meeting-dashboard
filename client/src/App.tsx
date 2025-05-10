import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import MeetingDetail from "@/pages/meetings/[id]";
import ActionItems from "@/pages/action-items";
import Settings from "@/pages/settings";
import Calendar from "@/pages/calendar";
import { Sidebar } from "@/components/ui/sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/meetings" component={Meetings} />
      <Route path="/meetings/:id" component={MeetingDetail} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/action-items" component={ActionItems} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            currentPath={location} 
            isMobileOpen={sidebarOpen} 
            setIsMobileOpen={setSidebarOpen}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Router />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
