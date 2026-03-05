"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, Plus, Pencil, Trash2, Search, Loader2, Settings2, Briefcase } from "lucide-react";
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
import { announcerApi } from "@/lib/api";
import { toast } from "sonner";
import type { AnnouncerRequest, AnnouncerResponse } from "@/lib/types";

const emptyForm: AnnouncerRequest = {
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    experienceYears: 0,
    status: "AVAILABLE",
};

const statuses = ["AVAILABLE", "BUSY", "UNAVAILABLE"];
const statusColors: Record<string, string> = {
    AVAILABLE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    BUSY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    UNAVAILABLE: "bg-red-500/10 text-red-400 border-red-500/20",
};

const availableColumns = [
    { id: "name", label: "Name" },
    { id: "contact", label: "Contact" },
    { id: "specialization", label: "Specialization" },
    { id: "experience", label: "Experience" },
    { id: "status", label: "Status" },
];

export default function AnnouncersPage() {
    const router = useRouter();
    const [announcers, setAnnouncers] = useState<AnnouncerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AnnouncerResponse | null>(null);
    const [deleting, setDeleting] = useState<AnnouncerResponse | null>(null);
    const [form, setForm] = useState<AnnouncerRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["name", "contact", "specialization", "experience", "status"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const load = useCallback(async () => {
        try { setAnnouncers(await announcerApi.getAll()); }
        catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load announcers");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = announcers.filter((a) => {
        const query = search.toLowerCase();
        return (
            a.fullName.toLowerCase().includes(query) ||
            a.email.toLowerCase().includes(query) ||
            a.specialization.toLowerCase().includes(query)
        );
    });

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (a: AnnouncerResponse) => {
        setEditing(a);
        setForm({
            fullName: a.fullName,
            email: a.email,
            phone: a.phone,
            specialization: a.specialization,
            bio: a.bio,
            experienceYears: a.experienceYears,
            status: a.status,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await announcerApi.update(editing.id, form);
                toast.success("Announcer updated successfully");
            } else {
                await announcerApi.create(form);
                toast.success("Announcer created successfully");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save announcer");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await announcerApi.delete(deleting.id);
            toast.success("Announcer deleted successfully");
            setDeleteDialogOpen(false); setDeleting(null); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete announcer");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Announcers</h1>
                    <p className="mt-1 text-muted-foreground">Manage event hosts, MCs, and announcers</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Announcer
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search announcers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
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
                        <Mic className="h-4 w-4 text-blue-400" /> Announcers Directory ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.name && <TableHead className="text-muted-foreground">Name</TableHead>}
                                    {visibleColumns.contact && <TableHead className="text-muted-foreground">Contact</TableHead>}
                                    {visibleColumns.specialization && <TableHead className="text-muted-foreground">Specialization</TableHead>}
                                    {visibleColumns.experience && <TableHead className="text-muted-foreground text-center">Experience</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.name && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.contact && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                        {visibleColumns.specialization && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.experience && <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>}
                                        {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No announcers found</TableCell></TableRow>
                                ) : filtered.map((a) => (
                                    <TableRow key={a.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.name && <TableCell className="font-medium">{a.fullName}</TableCell>}
                                        {visibleColumns.contact && <TableCell>
                                            <div className="text-sm">{a.email}</div>
                                            <div className="text-xs text-muted-foreground">{a.phone}</div>
                                        </TableCell>}
                                        {visibleColumns.specialization && <TableCell className="text-muted-foreground">{a.specialization}</TableCell>}
                                        {visibleColumns.experience && <TableCell className="text-center font-medium">{a.experienceYears} yrs</TableCell>}
                                        {visibleColumns.status && <TableCell>
                                            <Badge variant="outline" className={statusColors[a.status] || ""}>{a.status}</Badge>
                                        </TableCell>}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-400" onClick={() => router.push(`/admin/announcer-works?announcerId=${a.id}`)} title="Past Work"><Briefcase className="h-3.5 w-3.5" /></Button>
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
                <DialogContent className="max-w-xl bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Announcer" : "Add New Announcer"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Corporate" className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Experience (Years)</Label><Input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) || 0 })} className="bg-background/50" /></div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                    <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Bio / Notes</Label>
                            <Textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                rows={3}
                                placeholder="Details about this announcer..."
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Delete Announcer</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong className="text-foreground">{deleting?.fullName}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
