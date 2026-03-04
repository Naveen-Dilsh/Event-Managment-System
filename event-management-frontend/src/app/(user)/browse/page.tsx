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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
    const { user } = useAuth();
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
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-violet-950/10 to-indigo-950/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
                <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-violet-400">EventFlow</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Welcome back,{" "}
                        <span className="gradient-text">{user?.fullName?.split(" ")[0] ?? "there"}!</span>
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground max-w-xl">
                        Discover upcoming events, grab your tickets, and create unforgettable experiences.
                    </p>

                    {/* Search + filter */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search events, organizers..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 bg-card/60 border-border/50 backdrop-blur"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-card/60 border-border/50">
                                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Event Grid */}
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                        {loading ? "Loading events..." : `${filtered.length} Event${filtered.length !== 1 ? "s" : ""} Available`}
                    </h2>
                    <Link href="/my-bookings" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        My Bookings <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="border-border/50 bg-card/50">
                                <CardContent className="p-0">
                                    <Skeleton className="h-40 rounded-t-lg" />
                                    <div className="p-4 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                        : filtered.length === 0
                            ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                    <CalendarDays className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground">No events found</p>
                                    <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
                                </div>
                            )
                            : filtered.map(event => {
                                const venue = venues[event.venueId];
                                return (
                                    <Card key={event.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-600/5">
                                        {/* Event image placeholder */}
                                        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-purple-900/30">
                                            {event.imageUrl ? (
                                                <img src={event.imageUrl} alt={event.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <CalendarDays className="h-12 w-12 text-violet-400/50" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <Badge variant="outline" className={statusColors[event.status] || "bg-zinc-500/10 text-zinc-400"}>
                                                    {event.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-4 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-violet-400 uppercase tracking-wide">{event.category}</p>
                                                <h3 className="mt-1 text-base font-semibold text-foreground line-clamp-2 leading-snug">{event.name}</h3>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{event.startTime} – {event.endTime}</span>
                                                </div>
                                                {venue && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{venue.name}, {venue.city}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{event.availableSeats} seats available</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-1">
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
    );
}
