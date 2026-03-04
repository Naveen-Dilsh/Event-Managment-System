"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Plus, Pencil, Trash2, Search, Loader2, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { loyaltyApi } from "@/lib/api";
import { toast } from "sonner";
import type { LoyaltyAccountRequest, LoyaltyAccountResponse } from "@/lib/types";

const emptyForm: LoyaltyAccountRequest = {
    attendeeId: 0,
    pointsBalance: 0,
    totalPointsEarned: 0,
    membershipTier: "SILVER",
    status: "ACTIVE",
};

const tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
const statuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SUSPENDED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const tierColors: Record<string, string> = {
    BRONZE: "bg-orange-900/40 text-orange-400 border-orange-900",
    SILVER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    PLATINUM: "bg-slate-300/10 text-slate-300 border-slate-300/20",
};

const availableColumns = [
    { id: "id", label: "ID" },
    { id: "attendeeId", label: "Attendee ID" },
    { id: "tier", label: "Tier" },
    { id: "points", label: "Points Balance" },
    { id: "totalEarned", label: "Total Earned" },
    { id: "status", label: "Status" },
];

export default function LoyaltyPage() {
    const [accounts, setAccounts] = useState<LoyaltyAccountResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<LoyaltyAccountResponse | null>(null);
    const [deleting, setDeleting] = useState<LoyaltyAccountResponse | null>(null);
    const [form, setForm] = useState<LoyaltyAccountRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["id", "attendeeId", "tier", "points", "totalEarned", "status"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try { setAccounts(await loyaltyApi.getAll()); }
        catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load loyalty accounts");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = accounts.filter((a) => {
        const query = search.toLowerCase();
        return (
            a.attendeeId.toString().includes(query) ||
            a.membershipTier.toLowerCase().includes(query) ||
            a.status.toLowerCase().includes(query)
        );
    });

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (a: LoyaltyAccountResponse) => {
        setEditing(a);
        setForm({
            attendeeId: a.attendeeId,
            pointsBalance: a.pointsBalance,
            totalPointsEarned: a.totalPointsEarned,
            membershipTier: a.membershipTier,
            status: a.status,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.attendeeId) {
            toast.error("Attendee ID is required");
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await loyaltyApi.update(editing.id, form);
                toast.success("Account updated successfully");
            } else {
                await loyaltyApi.create(form);
                toast.success("Account created successfully");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save account");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await loyaltyApi.delete(deleting.id);
            toast.success("Account deleted successfully");
            setDeleteDialogOpen(false); setDeleting(null); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete account");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Loyalty Rewards</h1>
                    <p className="mt-1 text-muted-foreground">Manage attendee loyalty accounts and points</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by Attendee ID, Tier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
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
                        <Heart className="h-4 w-4 text-pink-400" /> Accounts ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.id && <TableHead className="text-muted-foreground">ID</TableHead>}
                                    {visibleColumns.attendeeId && <TableHead className="text-muted-foreground">Attendee ID</TableHead>}
                                    {visibleColumns.tier && <TableHead className="text-muted-foreground">Tier</TableHead>}
                                    {visibleColumns.points && <TableHead className="text-muted-foreground">Points Balance</TableHead>}
                                    {visibleColumns.totalEarned && <TableHead className="text-muted-foreground">Total Earned</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.id && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                        {visibleColumns.attendeeId && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.tier && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.points && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.totalEarned && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No accounts found</TableCell></TableRow>
                                ) : filtered.map((a) => (
                                    <TableRow key={a.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.id && <TableCell className="text-muted-foreground">#{a.id}</TableCell>}
                                        {visibleColumns.attendeeId && <TableCell className="font-medium">#{a.attendeeId}</TableCell>}
                                        {visibleColumns.tier && <TableCell>
                                            <Badge variant="outline" className={tierColors[a.membershipTier] || ""}>
                                                {a.membershipTier}
                                            </Badge>
                                        </TableCell>}
                                        {visibleColumns.points && <TableCell className="font-medium text-pink-400">{a.pointsBalance}</TableCell>}
                                        {visibleColumns.totalEarned && <TableCell className="text-muted-foreground">{a.totalPointsEarned}</TableCell>}
                                        {visibleColumns.status && <TableCell>
                                            <Badge variant="outline" className={statusColors[a.status] || ""}>{a.status}</Badge>
                                        </TableCell>}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(a); setDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Account" : "Add New Account"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Attendee ID *</Label>
                            <Input
                                type="number"
                                value={form.attendeeId || ""}
                                onChange={(e) => setForm({ ...form, attendeeId: Number(e.target.value) || 0 })}
                                className="bg-background/50"
                                disabled={!!editing} // Typically don't change attendee ID after creation
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Points Balance</Label>
                                <Input type="number" value={form.pointsBalance} onChange={(e) => setForm({ ...form, pointsBalance: Number(e.target.value) || 0 })} className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Earned</Label>
                                <Input type="number" value={form.totalPointsEarned} onChange={(e) => setForm({ ...form, totalPointsEarned: Number(e.target.value) || 0 })} className="bg-background/50" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Membership Tier</Label>
                                <Select value={form.membershipTier} onValueChange={(v) => setForm({ ...form, membershipTier: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select tier" /></SelectTrigger>
                                    <SelectContent>{tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Delete Account</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete account for Attendee <strong className="text-foreground">#{deleting?.attendeeId}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
