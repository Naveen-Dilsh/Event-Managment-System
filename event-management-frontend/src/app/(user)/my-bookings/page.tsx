"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ClipboardList, CalendarDays, Search, XCircle, Loader2,
    CheckCircle2, Clock, AlertCircle, Ticket, CreditCard, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { bookingApi, eventApi, ticketApi, attendeeApi, paymentApi } from "@/lib/api";
import type { BookingResponse, EventResponse, TicketResponse, BookingRequest } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const bookingStatusColor: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const paymentStatusColor: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function MyBookingsPage() {
    const { user, isAdmin } = useAuth();
    const searchParams = useSearchParams();
    const bookEventId = searchParams.get("book");

    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [bookDialogOpen, setBookDialogOpen] = useState(!!bookEventId);
    const [cancelDialogId, setCancelDialogId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [attendeeId, setAttendeeId] = useState<number | null>(null);
    const [payingBooking, setPayingBooking] = useState<BookingResponse | null>(null);
    const [paying, setPaying] = useState(false);

    const [bookForm, setBookForm] = useState<Partial<BookingRequest>>({
        eventId: bookEventId ? Number(bookEventId) : undefined,
        quantity: 1,
        customerName: user?.fullName?.split(" ")[0] || "",
        customerEmail: user?.email || "",
        customerPhone: "",
        specialRequests: "",
    });
    const [customerLastName, setCustomerLastName] = useState(
        user?.fullName?.split(" ").slice(1).join(" ") || ""
    );

    const loadData = useCallback(async () => {
        try {
            const [allBookings, allEvents, allTickets] = await Promise.allSettled([
                bookingApi.getAll(),
                eventApi.getAll(),
                ticketApi.getAll(),
            ]);

            if (allBookings.status === "fulfilled") setBookings(allBookings.value);
            if (allEvents.status === "fulfilled") setEvents(allEvents.value);
            if (allTickets.status === "fulfilled") setTickets(allTickets.value);

            // Try to get attendee ID by email for this user
            if (user?.email) {
                try {
                    const att = await attendeeApi.getByEmail(user.email);
                    setAttendeeId(att.id);
                } catch { /* attendee not created yet */ }
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const myBookings = bookings.filter(b =>
        b.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
    );

    const filteredBookings = myBookings.filter(b =>
        b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(search.toLowerCase())
    );

    const eventTickets = tickets.filter(t =>
        t.eventId === bookForm.eventId && t.status === "ACTIVE"
    );

    const handleBook = async () => {
        if (!bookForm.eventId || !bookForm.ticketId || !bookForm.customerName || !bookForm.customerEmail) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSaving(true);
        try {
            let aId = attendeeId;
            if (!aId) {
                // Create attendee profile on first booking
                const att = await attendeeApi.create({
                    firstName: bookForm.customerName || (user?.fullName || "").split(" ")[0] || "User",
                    lastName: customerLastName || "",
                    email: user?.email || "",
                    phone: bookForm.customerPhone,
                });
                aId = att.id;
                setAttendeeId(aId);
            }
            const fullName = customerLastName
                ? `${bookForm.customerName} ${customerLastName}`.trim()
                : bookForm.customerName || "";
            await bookingApi.create({
                ...bookForm,
                customerName: fullName,
                attendeeId: aId,
            } as BookingRequest);
            toast.success("Booking created successfully! 🎉");
            setBookDialogOpen(false);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Failed to create booking");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelDialogId) return;
        try {
            await bookingApi.cancel(cancelDialogId);
            toast.success("Booking cancelled");
            setCancelDialogId(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel booking");
        }
    };

    const handlePayNow = async () => {
        if (!payingBooking) return;
        setPaying(true);
        try {
            const payment = await paymentApi.process({
                bookingId: payingBooking.id,
                amount: payingBooking.totalPrice ?? payingBooking.totalAmount ?? 0,
                paymentMethod: "CREDIT_CARD",
                paymentGateway: "MOCK_GATEWAY",
            });
            if (payment.paymentStatus === "SUCCESS") {
                await bookingApi.confirm(payingBooking.id);
                toast.success("Payment successful! Booking confirmed 🎉");
            } else {
                toast.error("Payment was declined. Please try again.");
            }
            setPayingBooking(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };

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
                                <Link href="/my-bookings" className="text-sm font-medium text-violet-400 transition-colors flex items-center gap-1.5">
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
                                            <Link href="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-violet-400 hover:bg-accent/50 transition-colors">
                                                <CalendarDays className="h-4 w-4" /> My Bookings
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight gradient-text">My Bookings</h1>
                            <p className="text-sm text-muted-foreground mt-1">{myBookings.length} booking{myBookings.length !== 1 ? "s" : ""}</p>
                        </div>
                        <Button
                            onClick={() => { setBookForm({ ...bookForm, eventId: undefined, ticketId: undefined, quantity: 1 }); setBookDialogOpen(true); }}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                        >
                            <Ticket className="mr-2 h-4 w-4" /> New Booking
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-sm mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference or name..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-9 bg-card/50 border-border/50"
                        />
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-3">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="border-border/50 bg-card/50">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-48" />
                                            </div>
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                            : filteredBookings.length === 0
                                ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                        <p className="text-lg font-medium text-muted-foreground">No bookings yet</p>
                                        <p className="text-sm text-muted-foreground/70">Browse events and make your first booking!</p>
                                        <a href="/browse">
                                            <Button className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white" size="sm">
                                                Browse Events
                                            </Button>
                                        </a>
                                    </div>
                                )
                                : filteredBookings.map(booking => {
                                    const event = events.find(e => e.id === booking.eventId);
                                    return (
                                        <Card key={booking.id} className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border/80">
                                            <CardContent className="p-5">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-foreground">{event?.name || `Event #${booking.eventId}`}</p>
                                                            <Badge variant="outline" className={bookingStatusColor[booking.status]}>
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Ref: <span className="font-mono text-xs text-violet-400">{booking.bookingReference}</span>
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Ticket className="h-3 w-3" /> {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="h-3 w-3" />
                                                                <Badge variant="outline" className={`text-[10px] ${paymentStatusColor[booking.paymentStatus]}`}>
                                                                    {booking.paymentStatus}
                                                                </Badge>
                                                                ${booking.totalAmount?.toFixed(2)}
                                                            </span>
                                                            {event && (
                                                                <span className="flex items-center gap-1">
                                                                    <CalendarDays className="h-3 w-3" />
                                                                    {new Date(event.eventDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {booking.paymentStatus === "UNPAID" && booking.status !== "CANCELLED" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setPayingBooking(booking)}
                                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:shadow-emerald-600/30"
                                                            >
                                                                <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Pay Now
                                                            </Button>
                                                        )}
                                                        {booking.status === "PENDING" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCancelDialogId(booking.id)}
                                                                className="text-red-400 border-red-400/30 hover:bg-red-500/10 hover:border-red-400/60"
                                                            >
                                                                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                        }
                    </div>
                </main>
            </div>

            {/* Book Dialog */}
            <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
                <DialogContent className="max-w-lg bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">Book an Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <Label>Event *</Label>
                            <Select
                                value={bookForm.eventId?.toString() || ""}
                                onValueChange={val => setBookForm({ ...bookForm, eventId: Number(val), ticketId: undefined })}
                            >
                                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select an event" /></SelectTrigger>
                                <SelectContent>
                                    {events.filter(e => e.status === "PUBLISHED" || e.status === "ONGOING").map(e => (
                                        <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {bookForm.eventId && (
                            <div className="space-y-2">
                                <Label>Ticket Type *</Label>
                                <Select
                                    value={bookForm.ticketId?.toString() || ""}
                                    onValueChange={val => setBookForm({ ...bookForm, ticketId: Number(val) })}
                                >
                                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select ticket type" /></SelectTrigger>
                                    <SelectContent>
                                        {tickets.filter(t => t.eventId === bookForm.eventId && t.status === "ACTIVE").map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.ticketType} — ${t.price} ({t.availableQuantity} left)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input value={bookForm.customerName || ""} onChange={e => setBookForm({ ...bookForm, customerName: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input value={customerLastName} onChange={e => setCustomerLastName(e.target.value)} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input type="number" min={1} value={bookForm.quantity || 1} onChange={e => setBookForm({ ...bookForm, quantity: Number(e.target.value) })} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={bookForm.customerEmail || ""} onChange={e => setBookForm({ ...bookForm, customerEmail: e.target.value })} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={bookForm.customerPhone || ""} onChange={e => setBookForm({ ...bookForm, customerPhone: e.target.value })} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Special Requests</Label>
                            <Input value={bookForm.specialRequests || ""} onChange={e => setBookForm({ ...bookForm, specialRequests: e.target.value })} placeholder="Dietary needs, accessibility..." className="bg-background/50" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBookDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBook} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pay Now Dialog */}
            <Dialog open={!!payingBooking} onOpenChange={() => setPayingBooking(null)}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">Complete Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Booking Reference</span>
                                <span className="font-mono text-violet-400 text-xs">{payingBooking?.bookingReference}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tickets</span>
                                <span>{payingBooking?.quantity} × ticket</span>
                            </div>
                            <div className="h-px bg-border/40 my-1" />
                            <div className="flex justify-between font-semibold">
                                <span>Total Amount</span>
                                <span className="text-emerald-400 text-lg">
                                    ${((payingBooking as any)?.totalPrice ?? payingBooking?.totalAmount)?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Payment will be processed securely via Mock Gateway</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayingBooking(null)} disabled={paying}>Cancel</Button>
                        <Button
                            onClick={handlePayNow}
                            disabled={paying}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                        >
                            {paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation */}
            <Dialog open={!!cancelDialogId} onOpenChange={() => setCancelDialogId(null)}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogId(null)}>Keep Booking</Button>
                        <Button variant="destructive" onClick={handleCancel}>Yes, Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
