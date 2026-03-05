"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, Search, Loader2, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { venueApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { VenueRequest, VenueResponse } from "@/lib/types";

const emptyForm: VenueRequest = {
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    capacity: 0,
    venueType: "",
    facilities: "",
    contactEmail: "",
    contactPhone: "",
};

const availableColumns = [
    { id: "id", label: "Venue ID" },
    { id: "name", label: "Name" },
    { id: "type", label: "Type" },
    { id: "location", label: "Location" },
    { id: "address", label: "Address" },
    { id: "postalCode", label: "Postal Code" },
    { id: "capacity", label: "Capacity" },
    { id: "facilities", label: "Facilities" },
    { id: "contact", label: "Contact Email" },
    { id: "contactPhone", label: "Contact Phone" },
    { id: "createdAt", label: "Created At" },
    { id: "updatedAt", label: "Updated At" },
];

export default function VenuesPage() {
    const [venues, setVenues] = useState<VenueResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<VenueResponse | null>(null);
    const [deleting, setDeleting] = useState<VenueResponse | null>(null);
    const [form, setForm] = useState<VenueRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["id", "name", "type", "location", "capacity", "contact"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try {
            const data = await venueApi.getAll();
            setVenues(data);
        } catch (err: any) {
            console.error("Failed to load venues:", err);
            toast.error(err.message || "Failed to load venues");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = venues.filter((v) => {
        const matchesSearch =
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.city?.toLowerCase().includes(search.toLowerCase()) ||
            v.venueType?.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || filterType === "all" || v.venueType === filterType;
        return matchesSearch && matchesType;
    });

    const venueTypes = Array.from(new Set(venues.map(v => v.venueType).filter(Boolean)));

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (venue: VenueResponse) => {
        setEditing(venue);
        setForm({
            name: venue.name,
            address: venue.address || "",
            city: venue.city || "",
            state: venue.state || "",
            country: venue.country || "",
            postalCode: venue.postalCode || "",
            capacity: venue.capacity || 0,
            venueType: venue.venueType || "",
            facilities: venue.facilities || "",
            contactEmail: venue.contactEmail || "",
            contactPhone: venue.contactPhone || "",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await venueApi.update(editing.id, form);
                toast.success("Venue updated successfully");
            } else {
                await venueApi.create(form);
                toast.success("Venue created successfully");
            }
            setDialogOpen(false);
            await load();
        } catch (err: any) {
            console.error("Failed to save venue:", err);
            toast.error(err.message || "Failed to save venue");
        }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await venueApi.delete(deleting.id);
            toast.success("Venue deleted successfully");
            setDeleteDialogOpen(false);
            setDeleting(null);
            await load();
        } catch (err: any) {
            console.error("Failed to delete venue:", err);
            toast.error(err.message || "Failed to delete venue");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Venues</h1>
                    <p className="mt-1 text-muted-foreground">Manage event venues and locations</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Venue
                </Button>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search venues..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {venueTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                        <MapPin className="h-4 w-4 text-violet-400" /> All Venues ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.id && <TableHead className="text-muted-foreground">ID</TableHead>}
                                    {visibleColumns.name && <TableHead className="text-muted-foreground">Name</TableHead>}
                                    {visibleColumns.type && <TableHead className="text-muted-foreground">Type</TableHead>}
                                    {visibleColumns.location && <TableHead className="text-muted-foreground">Location</TableHead>}
                                    {visibleColumns.address && <TableHead className="text-muted-foreground">Address</TableHead>}
                                    {visibleColumns.postalCode && <TableHead className="text-muted-foreground">Postal Code</TableHead>}
                                    {visibleColumns.capacity && <TableHead className="text-muted-foreground">Capacity</TableHead>}
                                    {visibleColumns.facilities && <TableHead className="text-muted-foreground">Facilities</TableHead>}
                                    {visibleColumns.contact && <TableHead className="text-muted-foreground">Contact Email</TableHead>}
                                    {visibleColumns.contactPhone && <TableHead className="text-muted-foreground">Contact Phone</TableHead>}
                                    {visibleColumns.createdAt && <TableHead className="text-muted-foreground">Created At</TableHead>}
                                    {visibleColumns.updatedAt && <TableHead className="text-muted-foreground">Updated At</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i} className="border-border/20">
                                            {visibleColumns.id && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.name && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.type && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                            {visibleColumns.location && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.address && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.postalCode && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                            {visibleColumns.capacity && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.facilities && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.contact && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.contactPhone && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.createdAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.updatedAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">No venues found</TableCell></TableRow>
                                ) : (
                                    filtered.map((venue) => (
                                        <TableRow key={venue.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                            {visibleColumns.id && <TableCell className="text-muted-foreground">#{venue.id}</TableCell>}
                                            {visibleColumns.name && <TableCell className="font-medium">{venue.name}</TableCell>}
                                            {visibleColumns.type && <TableCell className="text-muted-foreground">{venue.venueType}</TableCell>}
                                            {visibleColumns.location && <TableCell className="text-muted-foreground">{venue.city}, {venue.country}</TableCell>}
                                            {visibleColumns.address && <TableCell className="text-muted-foreground">{venue.address || "—"}</TableCell>}
                                            {visibleColumns.postalCode && <TableCell className="text-muted-foreground">{venue.postalCode || "—"}</TableCell>}
                                            {visibleColumns.capacity && <TableCell>{venue.capacity?.toLocaleString()}</TableCell>}
                                            {visibleColumns.facilities && <TableCell className="text-muted-foreground max-w-[200px] truncate" title={venue.facilities}>{venue.facilities || "—"}</TableCell>}
                                            {visibleColumns.contact && <TableCell className="text-muted-foreground text-sm">{venue.contactEmail}</TableCell>}
                                            {visibleColumns.contactPhone && <TableCell className="text-muted-foreground text-sm">{venue.contactPhone || "—"}</TableCell>}
                                            {visibleColumns.createdAt && <TableCell className="text-muted-foreground text-sm">{venue.createdAt ? new Date(venue.createdAt).toLocaleDateString() : "—"}</TableCell>}
                                            {visibleColumns.updatedAt && <TableCell className="text-muted-foreground text-sm">{venue.updatedAt ? new Date(venue.updatedAt).toLocaleDateString() : "—"}</TableCell>}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(venue)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(venue); setDeleteDialogOpen(true); }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Venue" : "Add New Venue"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Venue Name *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter venue name" className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Venue Type *</Label>
                                <Input value={form.venueType} onChange={(e) => setForm({ ...form, venueType: e.target.value })} placeholder="e.g. Convention Center" className="bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address *</Label>
                            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" className="bg-background/50" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>City *</Label>
                                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>State *</Label>
                                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Country *</Label>
                                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Postal Code *</Label>
                                <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacity *</Label>
                                <Input type="number" value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Facilities</Label>
                            <Textarea value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="WiFi, Parking, Projector..." rows={2} className="bg-background/50" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Contact Email *</Label>
                                <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Phone *</Label>
                                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="bg-background/50" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Delete Venue</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete <strong className="text-foreground">{deleting?.name}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
