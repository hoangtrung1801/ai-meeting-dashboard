import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
    Calendar,
    CheckSquare,
    LogOut,
    Menu,
    MessageSquare,
    Settings,
    User,
    X,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
    currentPath: string;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({
    currentPath,
    isMobileOpen,
    setIsMobileOpen,
}: SidebarProps) {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [, navigate] = useLocation();

    const handleLogout = () => {
        logout();
        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
        });
        navigate("/login");
    };

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: MessageSquare,
        },
        {
            name: "Meetings",
            href: "/meetings",
            icon: Calendar,
        },
        {
            name: "Action Items",
            href: "/action-items",
            icon: CheckSquare,
        },
        {
            name: "Calendar",
            href: "/calendar",
            icon: Calendar,
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                <span className="sr-only">Open sidebar</span>
                {isMobileOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                )}
            </button>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* User profile section */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <User className="h-6 w-6 text-indigo-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                    currentPath === item.href
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5",
                                        currentPath === item.href
                                            ? "text-gray-500"
                                            : "text-gray-400 group-hover:text-gray-500"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <div className="p-4 border-t border-gray-200">
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
