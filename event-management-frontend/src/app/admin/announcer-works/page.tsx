"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Briefcase, Plus, Pencil, Trash2, Search, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { announcerApi } from "@/lib/api";
import { toast } from "sonner";
import type { AnnouncerWorkRequest, AnnouncerWorkResponse, AnnouncerResponse } from "@/lib/types";

const emptyForm: AnnouncerWorkRequest = {
    announcerId: 0,
    eventId: 0,
    role: "",
    eventDate: "",
    notes: "",
};

export default function AnnouncerWorksPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const announcerIdParam = searchParams.get("announcerId");
    const announcerId = announcerIdParam ? Number(announcerIdParam) : null;

    const [works, setWorks] = useState<AnnouncerWorkResponse[]>([]);
    const [announcer, setAnnouncer] = useState<AnnouncerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AnnouncerWorkResponse | null>(null);
    const [deleting, setDeleting] = useState<AnnouncerWorkResponse | null>(null);
    const [form, setForm] = useState<AnnouncerWorkRequest>(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            if (announcerId) {
                const [worksData, announcerData] = await Promise.all([
                    announcerApi.getWorksByAnnouncer(announcerId),
                    announcerApi.getById(announcerId),
                ]);
                setWorks(worksData);
                setAnnouncer(announcerData);
            } else {
                setWorks(await announcerApi.getAllWorks());
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load announcer works");
        } finally {
            setLoading(false);
        }
    }, [announcerId]);

    useEffect(() => { load(); }, [load]);

    const filtered = works.filter((w) => {
        const query = search.toLowerCase();
        return (
            w.role.toLowerCase().includes(query) ||
            w.notes?.toLowerCase().includes(query) ||
            String(w.eventId).includes(query)
        );
    });

    const handleCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, announcerId: announcerId || 0 });
        setDialogOpen(true);
    };

    const handleEdit = (w: AnnouncerWorkResponse) => {
        setEditing(w);
        setForm({
            announcerId: w.announcerId,
            eventId: w.eventId,
            role: w.role,
            eventDate: w.eventDate,
            notes: w.notes,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await announcerApi.updateWork(editing.id, form);
                toast.success("Work record updated successfully");
            } else {
                await announcerApi.createWork(form);
                toast.success("Work record created successfully");
            }
            setDialogOpen(false);
            await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save work record");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await announcerApi.deleteWork(deleting.id);
            toast.success("Work record deleted successfully");
            setDeleteDialogOpen(false);
            setDeleting(null);
            await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete work record");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.push("/admin/announcers")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight gradient-text">
                            {announcer ? `${announcer.fullName} — Past Work` : "Announcer Works"}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {announcer ? `View and manage past work for ${announcer.fullName}` : "All announcer work records"}
                        </p>
                    </div>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Work Record
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by role, notes, event ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
                </div>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-400" /> Work Records ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">ID</TableHead>
                                    {!announcerId && <TableHead className="text-muted-foreground">Announcer ID</TableHead>}
                                    <TableHead className="text-muted-foreground">Event ID</TableHead>
                                    <TableHead className="text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-muted-foreground">Event Date</TableHead>
                                    <TableHead className="text-muted-foreground">Notes</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                        {!announcerId && <TableCell><Skeleton className="h-4 w-10" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={announcerId ? 6 : 7} className="h-32 text-center text-muted-foreground">No work records found</TableCell></TableRow>
                                ) : filtered.map((w) => (
                                    <TableRow key={w.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        <TableCell className="text-muted-foreground">#{w.id}</TableCell>
                                        {!announcerId && <TableCell className="text-muted-foreground">#{w.announcerId}</TableCell>}
                                        <TableCell className="text-muted-foreground">#{w.eventId}</TableCell>
                                        <TableCell className="font-medium">{w.role}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {w.eventDate ? new Date(w.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-[200px] truncate" title={w.notes}>{w.notes || "—"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => { setDeleting(w); setDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Work Record" : "Add New Work Record"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Announcer ID *</Label>
                                <Input
                                    type="number"
                                    value={form.announcerId || ""}
                                    onChange={(e) => setForm({ ...form, announcerId: Number(e.target.value) || 0 })}
                                    className="bg-background/50"
                                    disabled={!!announcerId}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Event ID *</Label>
                                <Input
                                    type="number"
                                    value={form.eventId || ""}
                                    onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) || 0 })}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Input
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    placeholder="e.g. Host, MC, Emcee"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Date *</Label>
                                <Input
                                    type="date"
                                    value={form.eventDate}
                                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                placeholder="Additional notes about this work..."
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

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader><DialogTitle>Delete Work Record</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete work record <strong className="text-foreground">#{deleting?.id}</strong> (Role: {deleting?.role})?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
