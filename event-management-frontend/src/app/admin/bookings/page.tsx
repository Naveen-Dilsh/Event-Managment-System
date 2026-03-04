"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Plus, Search, Loader2, Ban, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingApi } from "@/lib/api";
import { toast } from "sonner";
import type { BookingRequest, BookingResponse } from "@/lib/types";

const emptyForm: BookingRequest = {
    eventId: 0,
    ticketId: 0,
    attendeeId: 0,
    quantity: 1,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
};

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const paymentStatusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const availableColumns = [
    { id: "reference", label: "Reference" },
    { id: "customer", label: "Customer" },
    { id: "eventTicket", label: "Event / Ticket" },
    { id: "quantity", label: "Quantity" },
    { id: "total", label: "Total" },
    { id: "bookingStatus", label: "Booking Status" },
    { id: "paymentStatus", label: "Payment Status" },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchRef, setSearchRef] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelling, setCancelling] = useState<BookingResponse | null>(null);
    const [form, setForm] = useState<BookingRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["reference", "customer", "eventTicket", "quantity", "total", "bookingStatus", "paymentStatus"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try { setBookings(await bookingApi.getAll()); }
        catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load bookings");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSearchReference = async () => {
        if (!searchRef.trim()) return;
        setLoading(true);
        try {
            const result = await bookingApi.getByReference(searchRef);
            setBookings([result]);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Booking reference not found");
        } finally { setLoading(false); }
    };

    const handleClearSearch = () => {
        setSearchRef("");
        setLoading(true);
        load();
    };

    const filtered = bookings.filter((b) => {
        const query = search.toLowerCase();
        return (
            b.bookingReference?.toLowerCase().includes(query) ||
            b.customerName?.toLowerCase().includes(query) ||
            b.customerEmail?.toLowerCase().includes(query)
        );
    });

    const handleCreate = () => { setForm(emptyForm); setDialogOpen(true); };

    const handleSave = async () => {
        if (!form.eventId || !form.ticketId || !form.customerEmail) {
            toast.error("Required fields cannot be empty");
            return;
        }
        setSaving(true);
        try {
            await bookingApi.create(form);
            toast.success("Booking created successfully");
            setDialogOpen(false);
            await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to create booking");
        } finally { setSaving(false); }
    };

    const handleCancel = async () => {
        if (!cancelling) return;
        try {
            await bookingApi.cancel(cancelling.id);
            toast.success("Booking cancelled successfully");
            setCancelDialogOpen(false);
            setCancelling(null);
            await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to cancel booking");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Bookings</h1>
                    <p className="mt-1 text-muted-foreground">Manage attendee bookings and ticket reservations</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Booking
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Filter list locally..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-1">
                    <Input
                        placeholder="Search by BK-Reference..."
                        value={searchRef}
                        onChange={(e) => setSearchRef(e.target.value)}
                        className="w-full sm:w-[200px] bg-card/50 border-border/50"
                    />
                    <Button variant="secondary" onClick={handleSearchReference}>Search Ref</Button>
                    {searchRef && <Button variant="ghost" onClick={handleClearSearch}>Clear</Button>}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-card/50 border-border/50 hidden sm:flex">
                            <Settings2 className="mr-2 h-4 w-4" />
                            View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        {availableColumns.map((col) => (
                            <DropdownMenuCheckboxItem
                                key={col.id}
                                className="capitalize"
                                checked={visibleColumns[col.id]}
                                onCheckedChange={(value) =>
                                    setVisibleColumns((prev) => ({ ...prev, [col.id]: !!value }))
                                }
                            >
                                {col.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-emerald-400" /> Bookings Directory ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.reference && <TableHead className="text-muted-foreground">Reference</TableHead>}
                                    {visibleColumns.customer && <TableHead className="text-muted-foreground">Customer</TableHead>}
                                    {visibleColumns.eventTicket && <TableHead className="text-muted-foreground">Event / Ticket</TableHead>}
                                    {visibleColumns.quantity && <TableHead className="text-muted-foreground text-center">Quantity</TableHead>}
                                    {visibleColumns.total && <TableHead className="text-muted-foreground font-medium">Total</TableHead>}
                                    {visibleColumns.bookingStatus && <TableHead className="text-muted-foreground">Booking Status</TableHead>}
                                    {visibleColumns.paymentStatus && <TableHead className="text-muted-foreground">Payment Status</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.reference && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.customer && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                        {visibleColumns.eventTicket && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.quantity && <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>}
                                        {visibleColumns.total && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.bookingStatus && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        {visibleColumns.paymentStatus && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No bookings found</TableCell></TableRow>
                                ) : filtered.map((b) => (
                                    <TableRow key={b.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.reference && <TableCell className="font-medium text-emerald-400">{b.bookingReference || "—"}</TableCell>}
                                        {visibleColumns.customer && <TableCell>
                                            <div className="text-sm font-medium">{b.customerName}</div>
                                            <div className="text-xs text-muted-foreground">{b.customerEmail}</div>
                                            <div className="text-xs text-muted-foreground">{b.customerPhone}</div>
                                        </TableCell>}
                                        {visibleColumns.eventTicket && <TableCell>
                                            <div className="text-sm">Event #{b.eventId}</div>
                                            <div className="text-xs text-muted-foreground">Ticket #{b.ticketId}</div>
                                            {b.attendeeId && <div className="text-xs opacity-50">Attendee #{b.attendeeId}</div>}
                                        </TableCell>}
                                        {visibleColumns.quantity && <TableCell className="text-center font-medium">{b.quantity}</TableCell>}
                                        {visibleColumns.total && <TableCell className="font-medium">${b.totalAmount}</TableCell>}
                                        {visibleColumns.bookingStatus && <TableCell>
                                            <Badge variant="outline" className={statusColors[b.status] || ""}>{b.status}</Badge>
                                        </TableCell>}
                                        {visibleColumns.paymentStatus && <TableCell>
                                            <Badge variant="outline" className={paymentStatusColors[b.paymentStatus] || ""}>{b.paymentStatus}</Badge>
                                        </TableCell>}
                                        <TableCell className="text-right">
                                            {b.status !== "CANCELLED" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hint-bottom"
                                                    title="Cancel Booking"
                                                    onClick={() => { setCancelling(b); setCancelDialogOpen(true); }}
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl bg-card border-border/50 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="gradient-text">Create New Booking</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Event ID *</Label>
                                <Input type="number" value={form.eventId || ""} onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) || 0 })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Ticket ID *</Label>
                                <Input type="number" value={form.ticketId || ""} onChange={(e) => setForm({ ...form, ticketId: Number(e.target.value) || 0 })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity *</Label>
                                <Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Attendee ID (Optional)</Label>
                                <Input type="number" value={form.attendeeId || ""} onChange={(e) => setForm({ ...form, attendeeId: Number(e.target.value) || undefined } as any)} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Customer Name *</Label>
                            <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="bg-background/50" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Customer Email *</Label>
                                <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Phone</Label>
                                <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Special Requests</Label>
                            <Textarea
                                value={form.specialRequests}
                                onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                                rows={2}
                                placeholder="Wheelchair accessible, Dietary requirements..."
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to cancel the booking <strong className="text-foreground">{cancelling?.bookingReference}</strong> for {cancelling?.customerName}?</p>
                    <p className="text-xs text-muted-foreground mt-2">This will refund the customer and release the tickets back to the inventory.</p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
                        <Button variant="destructive" onClick={handleCancel}>Cancel Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
