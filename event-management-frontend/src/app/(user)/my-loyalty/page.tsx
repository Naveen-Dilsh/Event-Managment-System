"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Star, TrendingUp, Award, Sparkles, CalendarDays, Ticket, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { loyaltyApi, attendeeApi } from "@/lib/api";
import type { LoyaltyAccountResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const tierColor: Record<string, string> = {
    BRONZE: "bg-amber-700/10 text-amber-600 border-amber-600/20",
    SILVER: "bg-zinc-400/10 text-zinc-300 border-zinc-400/20",
    GOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PLATINUM: "bg-violet-500/10 text-violet-300 border-violet-500/20",
};

export default function MyLoyaltyPage() {
    const { user, isAdmin } = useAuth();
    const [loyalty, setLoyalty] = useState<LoyaltyAccountResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!user?.email) return;
            try {
                const att = await attendeeApi.getByEmail(user.email);
                const acc = await loyaltyApi.getByAttendee(att.id);
                setLoyalty(acc);
            } catch {
                // Loyalty account may not exist yet
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            {/* Fixed Header */}
            <div className="flex-none relative border-b border-border/50 bg-gradient-to-br from-background via-violet-950/10 to-indigo-950/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
                <div className="relative mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between">
                        <Link href="/browse" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight gradient-text hidden sm:inline-block">EventFlow</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {/* Desktop quick links */}
                            <div className="hidden md:flex items-center gap-6 mr-2">
                                <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <Search className="h-3.5 w-3.5" /> Browse Events
                                </Link>
                                <Link href="/my-bookings" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" /> My Bookings
                                </Link>
                                <Link href="/my-tickets" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <Ticket className="h-3.5 w-3.5" /> My Tickets
                                </Link>
                                <Link href="/my-loyalty" className="text-sm font-medium text-amber-500/80 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5" /> Loyalty Points
                                </Link>
                            </div>

                            {/* User Profile Dropdown */}
                            <div className="relative group z-50">
                                <button className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 p-1 pr-3 hover:bg-accent/50 transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 font-semibold text-sm">
                                        {user?.fullName?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm font-medium">{user?.fullName?.split(" ")[0] || "User"}</span>
                                </button>

                                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="w-48 rounded-md border border-border/50 bg-card/95 backdrop-blur-md shadow-xl py-1 overflow-hidden">
                                        <div className="px-3 py-2 border-b border-border/30 mb-1">
                                            <p className="text-sm font-medium truncate">{user?.fullName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>

                                        <div className="md:hidden">
                                            <Link href="/browse" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <Search className="h-4 w-4 text-muted-foreground" /> Browse Events
                                            </Link>
                                            <Link href="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" /> My Bookings
                                            </Link>
                                            <Link href="/my-tickets" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <Ticket className="h-4 w-4 text-muted-foreground" /> My Tickets
                                            </Link>
                                            <Link href="/my-loyalty" className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">
                                                <Sparkles className="h-4 w-4" /> Loyalty Points
                                            </Link>
                                            <div className="h-px bg-border/50 my-1 mx-2"></div>
                                        </div>

                                        <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                            Profile Settings
                                        </Link>

                                        {isAdmin && (
                                            <Link href="/admin/events" className="block px-4 py-2 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <div className="h-px bg-border/50 my-1 mx-2"></div>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("user");
                                                window.location.href = "/login";
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-8 relative">
                <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold tracking-tight gradient-text mb-1">Loyalty Points</h1>
                    <p className="text-sm text-muted-foreground mb-8">Earn points with every booking</p>

                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => <Card key={i} className="border-border/50 bg-card/50"><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
                        </div>
                    ) : !loyalty ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">No loyalty account yet</p>
                            <p className="text-sm text-muted-foreground/70">Make your first booking to start earning points!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Points Overview */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-indigo-600/5" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-muted-foreground">Current Points</p>
                                            <Star className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <p className="text-3xl font-bold text-foreground">{loyalty.pointsBalance.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-muted-foreground">Total Earned</p>
                                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <p className="text-3xl font-bold text-foreground">{loyalty.totalPointsEarned.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-orange-600/5" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-muted-foreground">Membership Tier</p>
                                            <Award className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <Badge variant="outline" className={`text-base font-bold py-1 ${tierColor[loyalty.membershipTier] || tierColor.BRONZE}`}>
                                            {loyalty.membershipTier}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-border/50 bg-card/50">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground">Status: <span className={loyalty.status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>{loyalty.status}</span></p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
