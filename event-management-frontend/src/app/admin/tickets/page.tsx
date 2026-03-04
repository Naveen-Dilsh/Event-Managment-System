"use client";

import { useEffect, useState, useCallback } from "react";
import { Ticket, Plus, Pencil, Trash2, Search, Loader2, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ticketApi } from "@/lib/api";
import { toast } from "sonner";
import type { TicketRequest, TicketResponse } from "@/lib/types";

const emptyForm: TicketRequest = {
    eventId: 0, ticketType: "", price: 0, quantity: 0,
    description: "", validFrom: "", validUntil: "", maxPerBooking: 1,
};

const availableColumns = [
    { id: "type", label: "Type" },
    { id: "eventId", label: "Event ID" },
    { id: "price", label: "Price" },
    { id: "availability", label: "Available / Total" },
    { id: "sold", label: "Sold" },
    { id: "status", label: "Status" },
];

export default function TicketsPage() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<TicketResponse | null>(null);
    const [deleting, setDeleting] = useState<TicketResponse | null>(null);
    const [form, setForm] = useState<TicketRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
    );

    const load = useCallback(async () => {
        try { setTickets(await ticketApi.getAll()); }
        catch (err: any) {
            console.error("Failed to load:", err);
            toast.error(err.message || "Failed to load tickets");
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = tickets.filter((t) =>
        t.ticketType?.toLowerCase().includes(search.toLowerCase()) ||
        t.status?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (t: TicketResponse) => {
        setEditing(t);
        setForm({
            eventId: t.eventId, ticketType: t.ticketType, price: t.price, quantity: t.quantity,
            description: t.description || "", validFrom: t.validFrom || "", validUntil: t.validUntil || "",
            maxPerBooking: t.maxPerBooking || 1,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await ticketApi.update(editing.id, form);
                toast.success("Ticket updated successfully");
            } else {
                await ticketApi.create(form);
                toast.success("Ticket created successfully");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save ticket");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await ticketApi.delete(deleting.id);
            toast.success("Ticket deleted successfully");
            setDeleteDialogOpen(false); setDeleting(null); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete ticket");
        }
    };

    const statusColor = (s: string) => {
        if (s === "ACTIVE") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (s === "SOLD_OUT") return "bg-red-500/10 text-red-400 border-red-500/20";
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Tickets</h1>
                    <p className="mt-1 text-muted-foreground">Manage ticket types and pricing</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Ticket Type
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
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
                        <Ticket className="h-4 w-4 text-violet-400" /> All Tickets ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.type && <TableHead className="text-muted-foreground">Type</TableHead>}
                                    {visibleColumns.eventId && <TableHead className="text-muted-foreground">Event ID</TableHead>}
                                    {visibleColumns.price && <TableHead className="text-muted-foreground">Price</TableHead>}
                                    {visibleColumns.availability && <TableHead className="text-muted-foreground">Available / Total</TableHead>}
                                    {visibleColumns.sold && <TableHead className="text-muted-foreground">Sold</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.type && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.eventId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.price && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.availability && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.sold && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">No tickets found</TableCell></TableRow>
                                ) : filtered.map((t) => (
                                    <TableRow key={t.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.type && <TableCell className="font-medium">{t.ticketType}</TableCell>}
                                        {visibleColumns.eventId && <TableCell className="text-muted-foreground">#{t.eventId}</TableCell>}
                                        {visibleColumns.price && <TableCell className="font-medium">${t.price?.toFixed(2)}</TableCell>}
                                        {visibleColumns.availability && (
                                            <TableCell>
                                                <span className="text-foreground">{t.availableQuantity}</span>
                                                <span className="text-muted-foreground"> / {t.quantity}</span>
                                            </TableCell>
                                        )}
                                        {visibleColumns.sold && (
                                            <TableCell>
                                                <span className="text-emerald-400">{t.soldQuantity}</span>
                                            </TableCell>
                                        )}
                                        {visibleColumns.status && (
                                            <TableCell>
                                                <Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(t); setDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Ticket" : "Create Ticket Type"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Event ID *</Label><Input type="number" value={form.eventId || ""} onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Ticket Type *</Label><Input value={form.ticketType} onChange={(e) => setForm({ ...form, ticketType: e.target.value })} placeholder="e.g. VIP, General" className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2"><Label>Price *</Label><Input type="number" step="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Max Per Booking</Label><Input type="number" value={form.maxPerBooking || ""} onChange={(e) => setForm({ ...form, maxPerBooking: Number(e.target.value) })} className="bg-background/50" /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="bg-background/50" /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Valid From</Label><Input type="datetime-local" value={form.validFrom?.substring(0, 16) || ""} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Valid Until</Label><Input type="datetime-local" value={form.validUntil?.substring(0, 16) || ""} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="bg-background/50" /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Delete Ticket</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong className="text-foreground">{deleting?.ticketType}</strong> ticket? This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
