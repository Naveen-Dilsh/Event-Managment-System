"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarDays, MapPin, Clock, Search, Filter,
    Ticket, Users, ChevronRight, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { eventApi, venueApi } from "@/lib/api";
import type { EventResponse, VenueResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const statusColors: Record<string, string> = {
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ONGOING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const categories = [
    "Conference", "Workshop", "Seminar", "Meetup", "Concert",
    "Festival", "Exhibition", "Sports", "Networking", "Other",
];

export default function UserEventsPage() {
    const { user, isAdmin } = useAuth();
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [venues, setVenues] = useState<Record<number, VenueResponse>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [eventsData, venuesData] = await Promise.allSettled([
                    eventApi.getAll(),
                    venueApi.getAll(),
                ]);
                if (eventsData.status === "fulfilled") {
                    setEvents(eventsData.value.filter(e =>
                        e.status === "PUBLISHED" || e.status === "ONGOING"
                    ));
                }
                if (venuesData.status === "fulfilled") {
                    const venueMap: Record<number, VenueResponse> = {};
                    venuesData.value.forEach(v => { venueMap[v.id] = v; });
                    setVenues(venueMap);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = events.filter(e => {
        const matchesSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.category?.toLowerCase().includes(search.toLowerCase()) ||
            e.organizerName?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !filterCategory || filterCategory === "all" || e.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-violet-950/10 to-indigo-950/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
                <div className="relative mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between mb-10 pb-4 border-b border-border/20">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight gradient-text">EventFlow</span>
                        </div>

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
                            <div className="relative group">
                                <button className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 p-1 pr-3 hover:bg-accent/50 transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 font-semibold text-sm">
                                        {user?.fullName?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm font-medium">{user?.fullName?.split(" ")[0] || "User"}</span>
                                </button>

                                {/* Dropdown Menu (Hover based for simple implementation, though Radix/shadcn DropdownMenu is normally preferred) */}
                                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                                Welcome back,{" "}
                                <span className="gradient-text">{user?.fullName?.split(" ")[0] ?? "there"}!</span>
                            </h1>
                            <p className="mt-2 text-base text-muted-foreground max-w-xl">
                                Discover upcoming events, and grab your tickets.
                            </p>
                        </div>

                        {/* Search + filter */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto md:min-w-[400px] lg:min-w-[500px]">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                                <Input
                                    placeholder="Search events..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 h-10 bg-card/60 border-border/50 backdrop-blur shadow-sm focus-visible:ring-violet-500/50 text-sm transition-all hover:bg-card/80"
                                />
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card/60 border-border/50 shadow-sm focus:ring-violet-500/50 hover:bg-card/80 transition-all font-medium text-sm">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-violet-400" />
                                        <SelectValue placeholder="All categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="border-border/50 bg-card/95 backdrop-blur-md">
                                    <SelectItem value="all" className="font-medium text-sm">All categories</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Grid - Scrollable Component */}
            <div className="flex-1 overflow-y-auto pb-8 relative">
                <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                            {loading ? "Loading events..." : `${filtered.length} Event${filtered.length !== 1 ? "s" : ""} Available`}
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="border-border/50 bg-card/50">
                                    <CardContent className="p-0">
                                        <Skeleton className="h-44 rounded-t-lg" />
                                        <div className="p-5 space-y-3">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                            : filtered.length === 0
                                ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                        <CalendarDays className="h-14 w-14 text-muted-foreground/30 mb-5" />
                                        <p className="text-xl font-medium text-muted-foreground">No events found</p>
                                        <p className="text-base text-muted-foreground/60 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                                    </div>
                                )
                                : filtered.map(event => {
                                    const venue = venues[event.venueId];
                                    return (
                                        <Card key={event.id} className="group flex flex-col overflow-hidden border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-600/10">
                                            {/* Event image placeholder */}
                                            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-purple-900/20">
                                                {event.imageUrl ? (
                                                    <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <CalendarDays className="h-12 w-12 text-violet-400/50" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <Badge variant="secondary" className={cn(
                                                        "bg-background/90 backdrop-blur-md border hover:bg-background/90",
                                                        event.status === "PUBLISHED" ? "text-emerald-500 border-emerald-500/30" :
                                                            event.status === "ONGOING" ? "text-blue-500 border-blue-500/30" :
                                                                "text-zinc-500 border-zinc-500/30"
                                                    )}>
                                                        {event.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="flex flex-1 flex-col p-5 space-y-4">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="mb-2 bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
                                                        {event.category || "General"}
                                                    </Badge>
                                                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-violet-400 transition-colors">{event.name}</h3>
                                                </div>

                                                <div className="flex-1 space-y-2.5 text-sm text-muted-foreground">
                                                    <div className="flex items-start gap-2.5">
                                                        <CalendarDays className="h-4 w-4 shrink-0 text-violet-400/70 mt-0.5" />
                                                        <span className="leading-tight">{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2.5">
                                                        <Clock className="h-4 w-4 shrink-0 text-violet-400/70 mt-0.5" />
                                                        <span className="leading-tight">{event.startTime} – {event.endTime}</span>
                                                    </div>
                                                    {venue && (
                                                        <div className="flex items-start gap-2.5">
                                                            <MapPin className="h-4 w-4 shrink-0 text-violet-400/70 mt-0.5" />
                                                            <span className="leading-tight line-clamp-2">{venue.name}, {venue.city}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-2.5">
                                                        <Users className="h-4 w-4 shrink-0 text-violet-400/70 mt-0.5" />
                                                        <span className="leading-tight">
                                                            <strong className="text-foreground font-medium">{event.availableSeats}</strong> seats available
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 mt-auto">
                                                    <Link href={`/my-bookings?book=${event.id}`} className="flex-1">
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:shadow-violet-600/20 transition-all"
                                                            size="sm"
                                                            disabled={event.availableSeats === 0}
                                                        >
                                                            <Ticket className="mr-2 h-3.5 w-3.5" />
                                                            {event.availableSeats === 0 ? "Sold Out" : "Book Now"}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                        }
                    </div>
                </main>
            </div>
        </div>
    );
}
