"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Pencil, Trash2, Search, Loader2, Mail, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { attendeeApi } from "@/lib/api";
import { toast } from "sonner";
import type { AttendeeRequest, AttendeeResponse } from "@/lib/types";

const emptyForm: AttendeeRequest = {
    firstName: "", lastName: "", email: "", phone: "",
    dateOfBirth: "", gender: "", address: "", city: "", country: "", preferences: "",
};

const availableColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "location", label: "Location" },
    { id: "registered", label: "Registered" },
];

export default function AttendeesPage() {
    const [attendees, setAttendees] = useState<AttendeeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AttendeeResponse | null>(null);
    const [deleting, setDeleting] = useState<AttendeeResponse | null>(null);
    const [form, setForm] = useState<AttendeeRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
    );

    const load = useCallback(async () => {
        try { setAttendees(await attendeeApi.getAll()); }
        catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load attendees");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = attendees.filter((a) =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.city?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

    const handleEdit = (a: AttendeeResponse) => {
        setEditing(a);
        setForm({
            firstName: a.firstName, lastName: a.lastName, email: a.email, phone: a.phone || "",
            dateOfBirth: a.dateOfBirth || "", gender: a.gender || "", address: a.address || "",
            city: a.city || "", country: a.country || "", preferences: a.preferences || "",
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await attendeeApi.update(editing.id, form);
                toast.success("Attendee updated successfully");
            } else {
                await attendeeApi.create(form);
                toast.success("Attendee created successfully");
            }
            setDialogOpen(false); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to save attendee");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await attendeeApi.delete(deleting.id);
            toast.success("Attendee deleted successfully");
            setDeleteDialogOpen(false); setDeleting(null); await load();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete attendee");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Attendees</h1>
                    <p className="mt-1 text-muted-foreground">Manage event attendees and participants</p>
                </div>
                <Button onClick={handleCreate} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add Attendee
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by name, email, or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/50 border-border/50" />
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
                        <Users className="h-4 w-4 text-violet-400" /> All Attendees ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.name && <TableHead className="text-muted-foreground">Name</TableHead>}
                                    {visibleColumns.email && <TableHead className="text-muted-foreground">Email</TableHead>}
                                    {visibleColumns.phone && <TableHead className="text-muted-foreground">Phone</TableHead>}
                                    {visibleColumns.location && <TableHead className="text-muted-foreground">Location</TableHead>}
                                    {visibleColumns.registered && <TableHead className="text-muted-foreground">Registered</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/20">
                                        {visibleColumns.name && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.email && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                        {visibleColumns.phone && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        {visibleColumns.location && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                        {visibleColumns.registered && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">No attendees found</TableCell></TableRow>
                                ) : filtered.map((a) => (
                                    <TableRow key={a.id} className="border-border/20 transition-colors hover:bg-accent/30">
                                        {visibleColumns.name && <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>}
                                        {visibleColumns.email && (
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5" />{a.email}
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.phone && <TableCell className="text-muted-foreground">{a.phone || "—"}</TableCell>}
                                        {visibleColumns.location && <TableCell className="text-muted-foreground">{a.city ? `${a.city}, ${a.country}` : "—"}</TableCell>}
                                        {visibleColumns.registered && <TableCell className="text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</TableCell>}
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
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/50">
                    <DialogHeader><DialogTitle className="gradient-text">{editing ? "Edit Attendee" : "Add New Attendee"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-background/50" /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background/50" /></div>
                            <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-background/50" /></div>
                        </div>
                        <div className="space-y-2"><Label>Preferences</Label><Textarea value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} rows={2} className="bg-background/50" /></div>
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
                    <DialogHeader><DialogTitle>Delete Attendee</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong className="text-foreground">{deleting?.firstName} {deleting?.lastName}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
