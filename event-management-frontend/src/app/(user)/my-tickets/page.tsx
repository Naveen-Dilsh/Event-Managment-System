"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, CalendarDays, Search, Sparkles, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketApi, bookingApi, eventApi } from "@/lib/api";
import type { TicketResponse, BookingResponse, EventResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const ticketStatusColor: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SOLD_OUT: "bg-red-500/10 text-red-400 border-red-500/20",
    INACTIVE: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function MyTicketsPage() {
    const { user, isAdmin } = useAuth();
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [allTickets, allBookings, allEvents] = await Promise.allSettled([
                    ticketApi.getAll(),
                    bookingApi.getAll(),
                    eventApi.getAll(),
                ]);
                if (allTickets.status === "fulfilled") setTickets(allTickets.value);
                if (allBookings.status === "fulfilled") setBookings(allBookings.value);
                if (allEvents.status === "fulfilled") setEvents(allEvents.value);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Get event IDs user has confirmed bookings for
    const myBookings = bookings.filter(b =>
        b.customerEmail?.toLowerCase() === user?.email?.toLowerCase() &&
        b.status === "CONFIRMED"
    );
    const myEventIds = new Set(myBookings.map(b => b.eventId));
    const myTicketIds = new Set(myBookings.map(b => b.ticketId));

    const myTickets = tickets.filter(t => myTicketIds.has(t.id));
    const filtered = myTickets.filter(t =>
        t.ticketType?.toLowerCase().includes(search.toLowerCase())
    );

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
                                <Link href="/my-tickets" className="text-sm font-medium text-violet-400 transition-colors flex items-center gap-1.5">
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
                                            <Link href="/my-tickets" className="flex items-center gap-2 px-4 py-2 text-sm text-violet-400 hover:bg-accent/50 transition-colors">
                                                <Ticket className="h-4 w-4" /> My Tickets
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
                    <h1 className="text-2xl font-bold tracking-tight gradient-text mb-1">My Tickets</h1>
                    <p className="text-sm text-muted-foreground mb-6">Tickets from confirmed bookings</p>

                    <div className="relative max-w-sm mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search ticket types..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="border-border/50 bg-card/50">
                                    <CardContent className="p-5 space-y-3">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                <Ticket className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">No tickets yet</p>
                                <p className="text-sm text-muted-foreground/70">Book events to get your tickets!</p>
                            </div>
                        ) : filtered.map(ticket => {
                            const event = events.find(e => e.id === ticket.eventId);
                            const booking = myBookings.find(b => b.ticketId === ticket.id);
                            return (
                                <Card key={ticket.id} className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-950/20 flex flex-col overflow-hidden">
                                    {/* Ticket top accent bar */}
                                    <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                                    <CardContent className="p-5 flex flex-col gap-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                                                    <Ticket className="h-4 w-4 text-violet-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground truncate">{ticket.ticketType}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{event?.name || `Event #${ticket.eventId}`}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`shrink-0 text-[10px] ${ticketStatusColor[ticket.status]}`}>
                                                {ticket.status}
                                            </Badge>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground border-t border-border/30 pt-3">
                                            <span className="flex items-center gap-1.5">
                                                <CreditCard className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                                                ${ticket.price}/ticket
                                            </span>
                                            {booking && (
                                                <span className="flex items-center gap-1.5">
                                                    <Ticket className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                                                    Qty: {booking.quantity}
                                                </span>
                                            )}
                                            {event && (
                                                <span className="flex items-center gap-1.5 col-span-2">
                                                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                                                    {new Date(event.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
