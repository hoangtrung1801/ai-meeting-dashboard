import React from "react";
import { Route, Switch, Redirect, useLocation } from "wouter";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import ActionItems from "@/pages/action-items";
import Calendar from "@/pages/calendar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MeetingDetail from "@/pages/meetings/[id]";
import Settings from "@/pages/settings";
import { Sidebar } from "@/components/ui/sidebar";
import { useState } from "react";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();

    React.useEffect(() => {
        if (!isLoading && !user) {
            navigate("/login");
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}

// Public route component (redirects to dashboard if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();

    React.useEffect(() => {
        if (!isLoading && user) {
            navigate("/dashboard");
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (user) {
        return null;
    }

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Switch>
            {/* Public routes */}
            <Route path="/login">
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            </Route>
            <Route path="/register">
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            </Route>

            {/* Protected routes */}
            <Route path="/dashboard">
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            </Route>
            <Route path="/meetings">
                <ProtectedRoute>
                    <Meetings />
                </ProtectedRoute>
            </Route>
            <Route path="/action-items">
                <ProtectedRoute>
                    <ActionItems />
                </ProtectedRoute>
            </Route>
            <Route path="/calendar">
                <ProtectedRoute>
                    <Calendar />
                </ProtectedRoute>
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/">
                <Redirect to="/dashboard" />
            </Route>
        </Switch>
    );
}

function App() {
    const [location] = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar
                            currentPath={location}
                            isMobileOpen={sidebarOpen}
                            setIsMobileOpen={setSidebarOpen}
                        />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <AppRoutes />
                        </div>
                    </div>
                    <Toaster />
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
