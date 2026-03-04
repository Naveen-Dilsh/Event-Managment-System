"use client";

import { useEffect, useState } from "react";
import { Heart, Star, TrendingUp, Award, LogOut } from "lucide-react";
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
    const { user, logout } = useAuth();
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
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-5xl flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
                    <a href="/browse" className="text-sm font-bold gradient-text">← Browse Events</a>
                    <div className="flex items-center gap-3">
                        <a href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse Events</a>
                        <a href="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground">My Bookings</a>
                        <a href="/my-tickets" className="text-sm text-muted-foreground hover:text-foreground">My Tickets</a>
                        <a href="/profile" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline-block">Profile</a>
                        <button onClick={logout} className="flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-2">
                            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline-block">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
    );
}
