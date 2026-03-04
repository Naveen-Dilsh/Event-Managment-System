"use client";

import { useEffect, useState } from "react";
import { Ticket, CalendarDays, Search, LogOut } from "lucide-react";
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
    const { user, logout } = useAuth();
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
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-5xl flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
                    <a href="/browse" className="text-sm font-bold gradient-text">← Browse Events</a>
                    <div className="flex items-center gap-3">
                        <a href="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse Events</a>
                        <a href="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground">My Bookings</a>
                        <a href="/my-loyalty" className="text-sm text-muted-foreground hover:text-foreground">Loyalty Points</a>
                        <a href="/profile" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline-block">Profile</a>
                        <button onClick={logout} className="flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-2">
                            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline-block">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <h1 className="text-2xl font-bold tracking-tight gradient-text mb-1">My Tickets</h1>
                <p className="text-sm text-muted-foreground mb-6">Tickets from confirmed bookings</p>

                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search ticket types..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                </div>

                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="border-border/50 bg-card/50"><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Ticket className="h-12 w-12 text-muted-foreground/40 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">No tickets yet</p>
                            <p className="text-sm text-muted-foreground/70">Book events to get your tickets!</p>
                        </div>
                    ) : filtered.map(ticket => {
                        const event = events.find(e => e.id === ticket.eventId);
                        const booking = myBookings.find(b => b.ticketId === ticket.id);
                        return (
                            <Card key={ticket.id} className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border/80">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                                                <Ticket className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{ticket.ticketType}</p>
                                                <p className="text-sm text-muted-foreground">{event?.name || `Event #${ticket.eventId}`}</p>
                                                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                                    <span>${ticket.price}/ticket</span>
                                                    {booking && <span>Qty: {booking.quantity}</span>}
                                                    {event && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(event.eventDate).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={ticketStatusColor[ticket.status]}>{ticket.status}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
