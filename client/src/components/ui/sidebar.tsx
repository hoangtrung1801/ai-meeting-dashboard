import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => (
  <Link href={href}>
    <a
      className={cn(
        "flex items-center px-2 py-2 text-sm rounded-md",
        isActive
          ? "bg-primary/20 text-white"
          : "text-gray-300 hover:bg-primary/10 hover:text-white"
      )}
    >
      <i
        className={cn(
          "w-6 mr-3",
          isActive ? "text-primary" : "text-gray-400",
          icon
        )}
      ></i>
      {children}
    </a>
  </Link>
);

interface IntegrationItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

const IntegrationItem = ({ href, icon, children }: IntegrationItemProps) => (
  <a
    href={href}
    className="flex items-center px-2 py-2 text-sm rounded-md text-gray-300 hover:bg-primary/10 hover:text-white transition-colors duration-200"
  >
    <i className={cn("w-6 mr-3", icon)}></i>
    {children}
  </a>
);

interface SidebarProps {
  currentPath: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ currentPath, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/me"],
  });

  const desktopSidebar = (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-[#1e293b]">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 bg-[#1e293b] border-b border-gray-700/50">
          <div className="flex items-center">
            <i className="fas fa-microphone-alt text-primary text-2xl mr-2"></i>
            <span className="text-white font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MeetScribe</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavItem
              href="/"
              icon="fas fa-home"
              isActive={currentPath === "/" || currentPath === ""}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/meetings"
              icon="fas fa-list"
              isActive={currentPath.startsWith("/meetings")}
            >
              Meetings
            </NavItem>
            <NavItem
              href="/calendar"
              icon="fas fa-calendar-alt"
              isActive={currentPath === "/calendar"}
            >
              Calendar
            </NavItem>
            <NavItem
              href="/action-items"
              icon="fas fa-tasks"
              isActive={currentPath === "/action-items"}
            >
              Action Items
            </NavItem>
            <NavItem
              href="/settings"
              icon="fas fa-cog"
              isActive={currentPath === "/settings"}
            >
              Settings
            </NavItem>
          </nav>

          {/* Integrations */}
          <div className="px-4 py-4 border-t border-gray-700/30">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Integrations
            </h2>
            <div className="mt-3 space-y-2">
              <IntegrationItem href="#" icon="fab fa-zoom text-blue-400">
                Zoom
              </IntegrationItem>
              <IntegrationItem href="#" icon="fab fa-google text-red-400">
                Google Meet
              </IntegrationItem>
              <IntegrationItem href="#" icon="fab fa-microsoft text-blue-400">
                Microsoft Teams
              </IntegrationItem>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center px-4 py-3 border-t border-gray-700/30 mt-2">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-primary/30"
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100"}
                  alt="User profile"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <p className="text-xs font-medium text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const mobileSidebar = (
    <div
      className={`fixed inset-0 flex z-40 md:hidden ${
        isMobileOpen ? "" : "hidden"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        aria-hidden="true"
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-[#1e293b]">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <i className="fas fa-times text-white"></i>
          </button>
        </div>

        <div className="flex-shrink-0 flex items-center px-4">
          <i className="fas fa-microphone-alt text-primary text-2xl mr-2"></i>
          <span className="text-white font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MeetScribe</span>
        </div>
        <div className="mt-5 flex-1 h-0 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <NavItem
              href="/"
              icon="fas fa-home"
              isActive={currentPath === "/" || currentPath === ""}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/meetings"
              icon="fas fa-calendar-alt"
              isActive={currentPath.startsWith("/meetings")}
            >
              Meetings
            </NavItem>
            <NavItem
              href="/action-items"
              icon="fas fa-tasks"
              isActive={currentPath === "/action-items"}
            >
              Action Items
            </NavItem>
            <NavItem
              href="/settings"
              icon="fas fa-cog"
              isActive={currentPath === "/settings"}
            >
              Settings
            </NavItem>
          </nav>

          {/* Integrations */}
          <div className="px-4 py-4 border-t border-gray-700 mt-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Integrations
            </h2>
            <div className="mt-3 space-y-2">
              <IntegrationItem href="#" icon="fab fa-zoom text-blue-400">
                Zoom
              </IntegrationItem>
              <IntegrationItem href="#" icon="fab fa-google text-red-400">
                Google Meet
              </IntegrationItem>
              <IntegrationItem href="#" icon="fab fa-microsoft text-blue-400">
                Microsoft Teams
              </IntegrationItem>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center px-4 py-3 border-t border-gray-700 mt-5">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100"}
                  alt="User profile"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <p className="text-xs font-medium text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Dummy element to force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
