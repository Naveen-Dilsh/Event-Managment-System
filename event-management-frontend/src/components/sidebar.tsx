"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    CalendarDays,
    MapPin,
    Ticket,
    Users,
    CreditCard,
    Store,
    Award,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    LogOut,
    Heart,
    Mic,
    ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
    { href: "/browse", label: "Browse Events", icon: CalendarDays },
    { href: "/my-bookings", label: "My Bookings", icon: ClipboardList },
    { href: "/my-tickets", label: "My Tickets", icon: Ticket },
    { href: "/my-loyalty", label: "Loyalty", icon: Heart },
    { href: "/profile", label: "Profile", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
                collapsed ? "w-[68px]" : "w-[260px]"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="truncate text-base font-bold gradient-text">
                            EventFlow
                        </h1>
                        <p className="truncate text-[10px] text-muted-foreground">
                            Management Platform
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                    const linkContent = (
                        <Link
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white shadow-sm"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-colors",
                                        isActive
                                            ? "text-violet-400"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {isActive && (
                                    <div className="absolute -left-[21px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                                )}
                            </div>
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return <div key={item.href}>{linkContent}</div>;
                })}
            </nav>

            <div className="border-t border-border/50 p-3">
                <Link
                    href="/login"
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-500/10 hover:text-red-500",
                        collapsed && "justify-center"
                    )}
                >
                    {collapsed ? (
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild><LogOut className="h-5 w-5" /></TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">Logout</TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </>
                    )}
                </Link>
            </div>

            {/* Collapse Toggle */}
            <div className="border-t border-border/50 p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>
        </aside>
    );
}
