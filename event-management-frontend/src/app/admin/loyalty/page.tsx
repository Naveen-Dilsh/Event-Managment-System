
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Award, Search, RefreshCw, Loader2, Star, Shield, ExternalLink, Settings2, Plus, Pencil, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { loyaltyApi } from "@/lib/api";
import { LoyaltyResponseDTO, LoyaltyAccountRequest } from "@/lib/types";
import { toast } from "sonner";

const emptyForm: LoyaltyAccountRequest = {
    attendeeId: 0,
    pointsBalance: 0,
    totalPointsEarned: 0,
    membershipTier: "BASIC",
    status: "ACTIVE"
};

const tiers = ["BASIC", "BRONZE", "SILVER", "GOLD", "PREMIUM", "VIP"];
const statuses = ["ACTIVE", "SUSPENDED", "INACTIVE"];

const availableColumns = [
    { id: "accountId", label: "Acct ID" },
    { id: "attendeeName", label: "Attendee Name" },
    { id: "attendeeId", label: "Attendee ID" },
    { id: "tier", label: "Membership Tier" },
    { id: "balance", label: "Points Balance" },
    { id: "totalEarned", label: "Total Earned" },
];

export default function AdminLoyaltyPage() {
    const [accounts, setAccounts] = useState<LoyaltyResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [tierFilter, setTierFilter] = useState("ALL");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<LoyaltyResponseDTO | null>(null);
    const [deleting, setDeleting] = useState<LoyaltyResponseDTO | null>(null);
    const [form, setForm] = useState<LoyaltyAccountRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["accountId", "attendeeName", "tier", "balance", "totalEarned"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await loyaltyApi.getAll();
            setAccounts(data || []);
        } catch (error: any) {
            toast.error("Failed to load loyalty accounts");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAccounts(); }, [loadAccounts]);

    const filtered = useMemo(() => {
        return accounts.filter((acc) => {
            const matchesTier = tierFilter === "ALL" || acc.membershipTier === tierFilter;
            const matchesSearch =
                acc.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                acc.id.toString() === searchQuery;
            return matchesTier && matchesSearch;
        });
    }, [accounts, tierFilter, searchQuery]);

    const handleCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const handleEdit = (acc: LoyaltyResponseDTO) => {
        setEditing(acc);
        setForm({
            attendeeId: acc.attendeeId,
            pointsBalance: acc.pointsBalance,
            totalPointsEarned: acc.totalPointsEarned,
            membershipTier: acc.membershipTier || "BASIC",
            status: acc.status || "ACTIVE",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await loyaltyApi.update(editing.id, form);
                toast.success("Loyalty account updated");
            } else {
                await loyaltyApi.create(form);
                toast.success("Loyalty account created");
            }
            setDialogOpen(false);
            await loadAccounts();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await loyaltyApi.delete(deleting.id);
            setDeleteDialogOpen(false);
            setDeleting(null);
            await loadAccounts();
            toast.success("Loyalty account deleted");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Failed to delete account");
        }
    };

    const getTierBadgeProps = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case "VIP": return { className: "bg-amber-500/15 text-amber-500 border-amber-500/30", icon: <Star className="w-3 h-3 mr-1" /> };
            case "PREMIUM": return { className: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: <Shield className="w-3 h-3 mr-1" /> };
            case "BASIC":
            case "BRONZE":
            default: return { className: "bg-slate-500/15 text-slate-400 border-slate-500/30", icon: null };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">
                        Loyalty Program
                    </h1>
                    <p className="mt-1 text-muted-foreground">Manage attendee loyalty points and membership tiers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={loadAccounts} variant="outline" className="bg-card/50 border-border/50">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Loyalty Manually
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-card/50 focus-visible:ring-amber-500 border-border/50"
                    />
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[180px] bg-card/50 focus-visible:ring-amber-500 border-border/50">
                        <SelectValue placeholder="Filter by Tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Tiers</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="BASIC">Basic / Bronze</SelectItem>
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

            {/* Data Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Award className="h-4 w-4 text-violet-400" />
                        All Accounts ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.accountId && <TableHead className="text-muted-foreground">Acct ID</TableHead>}
                                    {visibleColumns.attendeeName && <TableHead className="text-muted-foreground">Attendee</TableHead>}
                                    {visibleColumns.attendeeId && <TableHead className="text-muted-foreground">Attendee ID</TableHead>}
                                    {visibleColumns.tier && <TableHead className="text-muted-foreground">Tier</TableHead>}
                                    {visibleColumns.balance && <TableHead className="text-right text-muted-foreground">Balance</TableHead>}
                                    {visibleColumns.totalEarned && <TableHead className="text-right text-muted-foreground">Total Earned</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i} className="border-border/20">
                                            {visibleColumns.accountId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.attendeeName && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.attendeeId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.tier && <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>}
                                            {visibleColumns.balance && <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>}
                                            {visibleColumns.totalEarned && <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>}
                                            <TableCell><Skeleton className="h-8 w-16 ml-auto rounded-md" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">
                                            No loyalty accounts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((acc) => {
                                        const tierBadge = getTierBadgeProps(acc.membershipTier);
                                        return (
                                            <TableRow key={acc.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                                {visibleColumns.accountId && (
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        #{acc.id}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.attendeeName && (
                                                    <TableCell>
                                                        <div className="font-medium">{acc.attendeeName || "Unknown"}</div>
                                                    </TableCell>
                                                )}
                                                {visibleColumns.attendeeId && (
                                                    <TableCell className="text-muted-foreground">
                                                        {acc.attendeeId}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.tier && (
                                                    <TableCell>
                                                        <Badge variant="outline" className={`capitalize font-semibold ${tierBadge.className}`}>
                                                            {tierBadge.icon} {acc.membershipTier?.toLowerCase() || 'basic'}
                                                        </Badge>
                                                    </TableCell>
                                                )}
                                                {visibleColumns.balance && (
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {acc.pointsBalance?.toFixed(1) || "0.0"}
                                                    </TableCell>
                                                )}
                                                {visibleColumns.totalEarned && (
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {acc.totalPointsEarned?.toFixed(1) || "0.0"}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => handleEdit(acc)}
                                                            title="Edit account"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                            onClick={() => {
                                                                setDeleting(acc);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            title="Delete account"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle className="gradient-text">
                            {editing ? "Edit Loyalty Account" : "Add Loyalty Manually"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Attendee ID *</Label>
                            <Input
                                type="number"
                                value={form.attendeeId || ""}
                                onChange={(e) => setForm({ ...form, attendeeId: Number(e.target.value) })}
                                className="bg-background/50"
                                disabled={!!editing}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Points Balance *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={form.pointsBalance === 0 ? "" : form.pointsBalance}
                                    onChange={(e) => setForm({ ...form, pointsBalance: Number(e.target.value) })}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Earned *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={form.totalPointsEarned === 0 ? "" : form.totalPointsEarned}
                                    onChange={(e) => setForm({ ...form, totalPointsEarned: Number(e.target.value) })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Membership Tier *</Label>
                                <Select value={form.membershipTier} onValueChange={(v) => setForm({ ...form, membershipTier: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Add Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confimation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete the loyalty account for <strong className="text-foreground">{deleting?.attendeeName}</strong>?
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
