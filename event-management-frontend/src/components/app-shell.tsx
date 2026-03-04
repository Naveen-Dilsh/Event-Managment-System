"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const AUTH_PATHS = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    const isAuthPage = AUTH_PATHS.includes(pathname);
    const showAdminSidebar = isAuthenticated && isAdmin && !isAuthPage;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auth pages — centered layout, no sidebar
    if (isAuthPage) {
        return (
            <main className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
                {children}
            </main>
        );
    }

    // Admin — show admin sidebar
    if (showAdminSidebar) {
        return (
            <TooltipProvider>
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
                {/* Mobile sidebar */}
                <div
                    className={cn(
                        "fixed left-0 top-0 z-50 transition-transform duration-300 lg:hidden",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <AdminSidebar />
                </div>
                {/* Desktop sidebar */}
                <div className="hidden lg:block">
                    <AdminSidebar />
                </div>
                {/* Mobile header */}
                <div className="fixed left-0 right-0 top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md lg:hidden">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <span className="text-sm font-bold gradient-text">EventFlow Admin</span>
                </div>
                {/* Main content */}
                <main className="min-h-screen transition-all duration-300 lg:ml-[260px]">
                    <div className="p-4 pt-18 lg:p-8 lg:pt-8">{children}</div>
                </main>
            </TooltipProvider>
        );
    }

    // User / Guest — no sidebar, full width
    return (
        <main className="min-h-screen bg-background">
            {children}
        </main>
    );
}
