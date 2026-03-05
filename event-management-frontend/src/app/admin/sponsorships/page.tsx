"use client";

import { useEffect, useState, useCallback } from "react";
import { Award, Plus, Pencil, Trash2, Search, Loader2, Settings2 } from "lucide-react";
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
import { sponsorshipApi } from "@/lib/api";
import type { SponsorshipRequest, SponsorshipResponse } from "@/lib/types";
import { toast } from "sonner";

const emptyForm: SponsorshipRequest = {
    eventId: 0,
    sponsorName: "",
    sponsorEmail: "",
    sponsorPhone: "",
    companyName: "",
    sponsorshipTier: "BRONZE",
    sponsorshipAmount: 0,
    currency: "USD",
    benefits: "",
    logoUrl: "",
    websiteUrl: "",
    agreementDate: "",
    startDate: "",
    endDate: "",
    notes: "",
};

const tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const availableColumns = [
    { id: "company", label: "Company" },
    { id: "tier", label: "Tier" },
    { id: "amount", label: "Amount" },
    { id: "contact", label: "Contact" },
    { id: "eventId", label: "Event ID" },
    { id: "status", label: "Status" },
];

export default function SponsorshipsPage() {
    const [sponsorships, setSponsorships] = useState<SponsorshipResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<SponsorshipResponse | null>(null);
    const [deleting, setDeleting] = useState<SponsorshipResponse | null>(null);
    const [form, setForm] = useState<SponsorshipRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["company", "tier", "amount", "contact", "eventId", "status"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try { setSponsorships(await sponsorshipApi.getAll()); }
        catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = sponsorships.filter((s) =>
        s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        s.sponsorName?.toLowerCase().includes(search.toLowerCase()) ||
        s.sponsorshipTier?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (s: SponsorshipResponse) => {
        setEditing(s);
        setForm({
            eventId: s.eventId, sponsorName: s.sponsorName, sponsorEmail: s.sponsorEmail,
            sponsorPhone: s.sponsorPhone, companyName: s.companyName, sponsorshipTier: s.sponsorshipTier,
            sponsorshipAmount: s.sponsorshipAmount, currency: s.currency, benefits: s.benefits || "",
            logoUrl: s.logoUrl || "", websiteUrl: s.websiteUrl || "", agreementDate: s.agreementDate || "",
            startDate: s.startDate || "", endDate: s.endDate || "", notes: s.notes || "",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await sponsorshipApi.update(editing.id, form);
                toast.success("Sponsorship updated successfully.");
            } else {
                await sponsorshipApi.create(form);
                toast.success("Sponsorship created successfully.");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Something went wrong.");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await sponsorshipApi.delete(deleting.id);
            setDeleteDialogOpen(false);
            setDeleting(null);
            await load();
            toast.success("Sponsorship deleted successfully.");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Failed to delete sponsorship.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Sponsorships</h1>
                    <p className="mt-1 text-muted-foreground">Manage event sponsors, tiers, and funding</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Sponsor
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search sponsors, companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
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
                        <Award className="h-4 w-4 text-violet-400" /> All Sponsorships ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.company && <TableHead className="text-muted-foreground">Company</TableHead>}
                                    {visibleColumns.tier && <TableHead className="text-muted-foreground">Tier</TableHead>}
                                    {visibleColumns.amount && <TableHead className="text-muted-foreground">Amount</TableHead>}
                                    {visibleColumns.contact && <TableHead className="text-muted-foreground">Contact</TableHead>}
                                    {visibleColumns.eventId && <TableHead className="text-muted-foreground">Event ID</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.company && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.tier && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.amount && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.contact && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.eventId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No sponsorships found</TableCell></TableRow>
                                ) : filtered.map((s) => (
                                    <TableRow key={s.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.company && <TableCell className="font-medium">{s.companyName}</TableCell>}
                                        {visibleColumns.tier && <TableCell>
                                            <Badge variant="outline" className={s.sponsorshipTier === "PLATINUM" ? "border-violet-400 text-violet-400" : s.sponsorshipTier === "GOLD" ? "border-amber-400 text-amber-400" : "border-zinc-400 text-zinc-400"}>
                                                {s.sponsorshipTier}
                                            </Badge>
                                        </TableCell>}
                                        {visibleColumns.amount && <TableCell className="font-medium">{s.sponsorshipAmount?.toLocaleString()} {s.currency}</TableCell>}
                                        {visibleColumns.contact && <TableCell className="text-sm">
                                            <div>{s.sponsorName}</div>
                                            <div className="text-xs text-muted-foreground">{s.sponsorEmail}</div>
                                        </TableCell>}
                                        {visibleColumns.eventId && <TableCell className="text-muted-foreground">#{s.eventId}</TableCell>}
                                        {visibleColumns.status && <TableCell>
                                            <Badge variant="outline" className={statusColors[s.status] || statusColors.PENDING}>{s.status}</Badge>
                                        </TableCell>}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(s); setDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Sponsorship" : "Add New Sponsor"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Event ID *</Label><Input type="number" value={form.eventId || ""} onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) })} className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2"><Label>Contact Name *</Label><Input value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Contact Email *</Label><Input type="email" value={form.sponsorEmail} onChange={(e) => setForm({ ...form, sponsorEmail: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Contact Phone *</Label><Input value={form.sponsorPhone} onChange={(e) => setForm({ ...form, sponsorPhone: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Tier *</Label>
                                <Select value={form.sponsorshipTier} onValueChange={(v) => setForm({ ...form, sponsorshipTier: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Amount *</Label><Input type="number" step="0.01" value={form.sponsorshipAmount || ""} onChange={(e) => setForm({ ...form, sponsorshipAmount: Number(e.target.value) })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Currency *</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD, LKR..." className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2"><Label>Agreement Date</Label><Input type="date" value={form.agreementDate} onChange={(e) => setForm({ ...form, agreementDate: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Website URL</Label><Input type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Logo URL</Label><Input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." className="bg-background/50" /></div>
                        </div>
                        <div className="space-y-2"><Label>Benefits</Label><Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} className="bg-background/50" /></div>
                        <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="bg-background/50" /></div>
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
                    <DialogHeader><DialogTitle>Delete Sponsorship</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete sponsorship for <strong className="text-foreground">{deleting?.companyName}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
