"use client";

import { useEffect, useState, useCallback } from "react";
import { Store, Plus, Pencil, Trash2, Search, Loader2, Settings2 } from "lucide-react";
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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorApi } from "@/lib/api";
import { toast } from "sonner";
import type { VendorRequest, VendorResponse } from "@/lib/types";

const emptyForm: VendorRequest = {
    eventId: undefined, vendorName: "", vendorType: "", contactPerson: "",
    contactEmail: "", contactPhone: "", serviceDescription: "", cost: undefined, contractStatus: "PENDING",
};

const vendorTypes = ["Catering", "Decoration", "Photography", "Videography", "Sound & Lighting", "Security", "Transportation", "Entertainment", "Other"];
const contractStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const availableColumns = [
    { id: "id", label: "Vendor ID" },
    { id: "name", label: "Vendor Name" },
    { id: "type", label: "Type" },
    { id: "contact", label: "Contact Person & Email" },
    { id: "contactPhone", label: "Contact Phone" },
    { id: "serviceDescription", label: "Description" },
    { id: "cost", label: "Cost" },
    { id: "eventId", label: "Event ID" },
    { id: "status", label: "Status" },
    { id: "createdAt", label: "Created At" },
    { id: "updatedAt", label: "Updated At" },
];

export default function VendorsPage() {
    const [vendors, setVendors] = useState<VendorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<VendorResponse | null>(null);
    const [deleting, setDeleting] = useState<VendorResponse | null>(null);
    const [form, setForm] = useState<VendorRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["id", "name", "type", "contact", "cost", "eventId", "status"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try { setVendors(await vendorApi.getAll()); }
        catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load vendors");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = vendors.filter((v) => {
        const matchesSearch = v.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
            v.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
            v.vendorType?.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || filterType === "all" || v.vendorType === filterType;
        const matchesStatus = !filterStatus || filterStatus === "all" || v.contractStatus === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (v: VendorResponse) => {
        setEditing(v);
        setForm({
            eventId: v.eventId, vendorName: v.vendorName, vendorType: v.vendorType,
            contactPerson: v.contactPerson || "", contactEmail: v.contactEmail || "",
            contactPhone: v.contactPhone || "", serviceDescription: v.serviceDescription || "",
            cost: v.cost, contractStatus: v.contractStatus || "PENDING",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await vendorApi.update(editing.id, form);
                toast.success("Vendor updated successfully");
            } else {
                await vendorApi.create(form);
                toast.success("Vendor created successfully");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save vendor");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await vendorApi.delete(deleting.id);
            toast.success("Vendor deleted successfully");
            setDeleteDialogOpen(false); setDeleting(null); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete vendor");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Vendors</h1>
                    <p className="mt-1 text-muted-foreground">Manage event vendors and service providers</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {vendorTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {contractStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                        <Store className="h-4 w-4 text-violet-400" /> All Vendors ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.id && <TableHead className="text-muted-foreground">ID</TableHead>}
                                    {visibleColumns.name && <TableHead className="text-muted-foreground">Vendor Name</TableHead>}
                                    {visibleColumns.type && <TableHead className="text-muted-foreground">Type</TableHead>}
                                    {visibleColumns.contact && <TableHead className="text-muted-foreground">Contact</TableHead>}
                                    {visibleColumns.contactPhone && <TableHead className="text-muted-foreground">Phone</TableHead>}
                                    {visibleColumns.serviceDescription && <TableHead className="text-muted-foreground">Description</TableHead>}
                                    {visibleColumns.cost && <TableHead className="text-muted-foreground">Cost</TableHead>}
                                    {visibleColumns.eventId && <TableHead className="text-muted-foreground">Event ID</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    {visibleColumns.createdAt && <TableHead className="text-muted-foreground">Created At</TableHead>}
                                    {visibleColumns.updatedAt && <TableHead className="text-muted-foreground">Updated At</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.id && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.name && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.type && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.contact && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                        {visibleColumns.contactPhone && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.serviceDescription && <TableCell><Skeleton className="h-4 w-40" /></TableCell>}
                                        {visibleColumns.cost && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.eventId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        {visibleColumns.createdAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.updatedAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">No vendors found</TableCell></TableRow>
                                ) : filtered.map((v) => (
                                    <TableRow key={v.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.id && <TableCell className="text-muted-foreground">#{v.id}</TableCell>}
                                        {visibleColumns.name && <TableCell className="font-medium">{v.vendorName}</TableCell>}
                                        {visibleColumns.type && <TableCell className="text-muted-foreground">{v.vendorType}</TableCell>}
                                        {visibleColumns.contact && (
                                            <TableCell>
                                                <div className="text-sm">{v.contactPerson || "—"}</div>
                                                <div className="text-xs text-muted-foreground">{v.contactEmail || "—"}</div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.contactPhone && <TableCell className="text-muted-foreground">{v.contactPhone || "—"}</TableCell>}
                                        {visibleColumns.serviceDescription && <TableCell className="text-muted-foreground max-w-[200px] truncate" title={v.serviceDescription}>{v.serviceDescription || "—"}</TableCell>}
                                        {visibleColumns.cost && <TableCell className="font-medium">{v.cost ? `$${v.cost.toLocaleString()}` : "—"}</TableCell>}
                                        {visibleColumns.eventId && <TableCell className="text-muted-foreground">{v.eventId ? `#${v.eventId}` : "—"}</TableCell>}
                                        {visibleColumns.status && (
                                            <TableCell>
                                                <Badge variant="outline" className={statusColors[v.contractStatus ?? "PENDING"]}>{v.contractStatus}</Badge>
                                            </TableCell>
                                        )}
                                        {visibleColumns.createdAt && <TableCell className="text-muted-foreground text-sm">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}</TableCell>}
                                        {visibleColumns.updatedAt && <TableCell className="text-muted-foreground text-sm">{v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : "—"}</TableCell>}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(v); setDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Vendor Name *</Label><Input value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2">
                                <Label>Vendor Type *</Label>
                                <Select value={form.vendorType} onValueChange={(v) => setForm({ ...form, vendorType: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>{vendorTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Event ID</Label><Input type="number" value={form.eventId || ""} onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) || undefined })} className="bg-background/50" /></div>
                            <div className="space-y-2">
                                <Label>Contract Status</Label>
                                <Select value={form.contractStatus} onValueChange={(v) => setForm({ ...form, contractStatus: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{contractStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Contact Phone</Label><Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="space-y-2"><Label>Cost</Label><Input type="number" step="0.01" value={form.cost || ""} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || undefined })} className="bg-background/50" /></div>
                        <div className="space-y-2"><Label>Service Description</Label><Textarea value={form.serviceDescription} onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })} rows={3} className="bg-background/50" /></div>
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
                    <DialogHeader><DialogTitle>Delete Vendor</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong className="text-foreground">{deleting?.vendorName}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
