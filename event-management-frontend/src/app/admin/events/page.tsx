"use client";

import { useEffect, useState, useCallback } from "react";
import {
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    Settings2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { eventApi, announcerApi } from "@/lib/api";
import type { EventRequest, EventResponse, AnnouncerResponse } from "@/lib/types";

const emptyForm: EventRequest = {
    name: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venueId: 0,
    category: "",
    capacity: 0,
    organizerName: "",
    organizerContact: "",
    imageUrl: "",
    status: undefined,
    announcerId: undefined,
};

const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ONGOING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    POSTPONED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Meetup",
    "Concert",
    "Festival",
    "Exhibition",
    "Sports",
    "Networking",
    "Other",
];

const availableColumns = [
    { id: "eventId", label: "Event ID" },
    { id: "name", label: "Name" },
    { id: "description", label: "Description" },
    { id: "date", label: "Date" },
    { id: "startTime", label: "Start Time" },
    { id: "endTime", label: "End Time" },
    { id: "venueId", label: "Venue ID" },
    { id: "category", label: "Category" },
    { id: "capacity", label: "Capacity" },
    { id: "availableSeats", label: "Available Seats" },
    { id: "status", label: "Status" },
    { id: "organizer", label: "Organizer Name" },
    { id: "organizerContact", label: "Organizer Contact" },
    { id: "imageUrl", label: "Image URL" },
    { id: "createdAt", label: "Created At" },
    { id: "updatedAt", label: "Updated At" },
];

export default function EventsPage() {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [announcers, setAnnouncers] = useState<AnnouncerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<EventResponse | null>(null);
    const [form, setForm] = useState<EventRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible = ["eventId", "name", "category", "venueId", "date", "capacity", "status", "organizer"];
        return availableColumns.reduce((acc, col) => ({ ...acc, [col.id]: defaultVisible.includes(col.id) }), {});
    });

    const loadEvents = useCallback(async () => {
        try {
            const [eventsData, announcersData] = await Promise.all([
                eventApi.getAll(),
                announcerApi.getAll()
            ]);
            setEvents(eventsData);
            setAnnouncers(announcersData);
        } catch (err: any) {
            console.error("Failed to load events/announcers:", err);
            toast.error(err.message || "Failed to load events/announcers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const filteredEvents = events.filter((e) => {
        const matchesSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.category?.toLowerCase().includes(search.toLowerCase()) ||
            e.organizerName?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !filterCategory || filterCategory === "all" || e.category === filterCategory;
        const matchesStatus = !filterStatus || filterStatus === "all" || e.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleCreate = () => {
        setEditingEvent(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const handleEdit = (event: EventResponse) => {
        setEditingEvent(event);
        setForm({
            name: event.name,
            description: event.description || "",
            eventDate: event.eventDate?.split("T")[0] + "T" + (event.startTime || "00:00"),
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            venueId: event.venueId || 0,
            category: event.category || "",
            capacity: event.capacity || 0,
            organizerName: event.organizerName || "",
            organizerContact: event.organizerContact || "",
            imageUrl: event.imageUrl || "",
            status: event.status,
            announcerId: event.announcerId,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingEvent) {
                await eventApi.update(editingEvent.id, form);
                toast.success("Event updated successfully");
            } else {
                await eventApi.create(form);
                toast.success("Event created successfully");
            }
            setDialogOpen(false);
            await loadEvents();
        } catch (err: any) {
            console.error("Failed to save event:", err);
            toast.error(err.message || "Failed to save event");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingEvent) return;
        try {
            await eventApi.delete(deletingEvent.id);
            toast.success("Event deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingEvent(null);
            await loadEvents();
        } catch (err: any) {
            console.error("Failed to delete event:", err);
            toast.error(err.message || "Failed to delete event");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">
                        Events
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your events and their details
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card/50 border-border/50"
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.keys(statusColors).map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
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

            {/* Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-violet-400" />
                        All Events ({filteredEvents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/30 hover:bg-transparent">
                                    {visibleColumns.eventId && <TableHead className="text-muted-foreground">Event ID</TableHead>}
                                    {visibleColumns.name && <TableHead className="text-muted-foreground">Name</TableHead>}
                                    {visibleColumns.description && <TableHead className="text-muted-foreground">Description</TableHead>}
                                    {visibleColumns.date && <TableHead className="text-muted-foreground">Event Date</TableHead>}
                                    {visibleColumns.startTime && <TableHead className="text-muted-foreground">Start Time</TableHead>}
                                    {visibleColumns.endTime && <TableHead className="text-muted-foreground">End Time</TableHead>}
                                    {visibleColumns.venueId && <TableHead className="text-muted-foreground">Venue ID</TableHead>}
                                    {visibleColumns.category && <TableHead className="text-muted-foreground">Category</TableHead>}
                                    {visibleColumns.capacity && <TableHead className="text-muted-foreground">Capacity</TableHead>}
                                    {visibleColumns.availableSeats && <TableHead className="text-muted-foreground">Avail. Seats</TableHead>}
                                    {visibleColumns.status && <TableHead className="text-muted-foreground">Status</TableHead>}
                                    {visibleColumns.organizer && <TableHead className="text-muted-foreground">Organizer</TableHead>}
                                    {visibleColumns.organizerContact && <TableHead className="text-muted-foreground">Contact</TableHead>}
                                    {visibleColumns.imageUrl && <TableHead className="text-muted-foreground">Image</TableHead>}
                                    {visibleColumns.createdAt && <TableHead className="text-muted-foreground">Created</TableHead>}
                                    {visibleColumns.updatedAt && <TableHead className="text-muted-foreground">Updated</TableHead>}
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-border/20">
                                            {visibleColumns.eventId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.name && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                                            {visibleColumns.description && <TableCell><Skeleton className="h-4 w-40" /></TableCell>}
                                            {visibleColumns.date && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.startTime && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                            {visibleColumns.endTime && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                            {visibleColumns.venueId && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                                            {visibleColumns.category && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                            {visibleColumns.capacity && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                            {visibleColumns.availableSeats && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                                            {visibleColumns.status && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
                                            {visibleColumns.organizer && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.organizerContact && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.imageUrl && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                                            {visibleColumns.createdAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            {visibleColumns.updatedAt && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-32 text-center text-muted-foreground">
                                            No events found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEvents.map((event) => (
                                        <TableRow
                                            key={event.id}
                                            className="border-border/20 transition-colors hover:bg-accent/30"
                                        >
                                            {visibleColumns.eventId && <TableCell className="text-muted-foreground">#{event.id}</TableCell>}
                                            {visibleColumns.name && <TableCell className="font-medium">{event.name}</TableCell>}
                                            {visibleColumns.description && (
                                                <TableCell className="text-muted-foreground max-w-[200px] truncate" title={event.description}>
                                                    {event.description || "—"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.date && (
                                                <TableCell className="text-muted-foreground">
                                                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.startTime && <TableCell className="text-muted-foreground">{event.startTime || "—"}</TableCell>}
                                            {visibleColumns.endTime && <TableCell className="text-muted-foreground">{event.endTime || "—"}</TableCell>}
                                            {visibleColumns.venueId && (
                                                <TableCell className="text-muted-foreground">
                                                    {event.venueId ? `#${event.venueId}` : "—"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.category && (
                                                <TableCell className="text-muted-foreground">
                                                    {event.category}
                                                </TableCell>
                                            )}
                                            {visibleColumns.capacity && (
                                                <TableCell>
                                                    <span className="text-foreground">{event.availableSeats ?? event.capacity}</span>
                                                    <span className="text-muted-foreground">/{event.capacity}</span>
                                                </TableCell>
                                            )}
                                            {visibleColumns.availableSeats && <TableCell className="text-muted-foreground">{event.availableSeats ?? "—"}</TableCell>}
                                            {visibleColumns.status && (
                                                <TableCell>
                                                    <Badge variant="outline" className={statusColors[event.status] || statusColors.DRAFT}>
                                                        {event.status}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            {visibleColumns.organizer && (
                                                <TableCell className="text-muted-foreground">{event.organizerName}</TableCell>
                                            )}
                                            {visibleColumns.organizerContact && <TableCell className="text-muted-foreground">{event.organizerContact || "—"}</TableCell>}
                                            {visibleColumns.imageUrl && (
                                                <TableCell>
                                                    {event.imageUrl ? (
                                                        <a href={event.imageUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Link</a>
                                                    ) : "—"}
                                                </TableCell>
                                            )}
                                            {visibleColumns.createdAt && <TableCell className="text-muted-foreground">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : "—"}</TableCell>}
                                            {visibleColumns.updatedAt && <TableCell className="text-muted-foreground">{event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : "—"}</TableCell>}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleEdit(event)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                        onClick={() => {
                                                            setDeletingEvent(event);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
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
                    <DialogHeader>
                        <DialogTitle className="gradient-text">
                            {editingEvent ? "Edit Event" : "Create New Event"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Event Name *</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter event name"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(val) => setForm({ ...form, category: val })}
                                >
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Event description..."
                                rows={3}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Event Date *</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.eventDate}
                                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time *</Label>
                                <Input
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time *</Label>
                                <Input
                                    type="time"
                                    value={form.endTime}
                                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Venue ID *</Label>
                                <Input
                                    type="number"
                                    value={form.venueId || ""}
                                    onChange={(e) => setForm({ ...form, venueId: Number(e.target.value) })}
                                    placeholder="Enter venue ID"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacity *</Label>
                                <Input
                                    type="number"
                                    value={form.capacity || ""}
                                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                                    placeholder="Max capacity"
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Organizer Name *</Label>
                                <Input
                                    value={form.organizerName}
                                    onChange={(e) => setForm({ ...form, organizerName: e.target.value })}
                                    placeholder="Organizer name"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Organizer Contact *</Label>
                                <Input
                                    value={form.organizerContact}
                                    onChange={(e) => setForm({ ...form, organizerContact: e.target.value })}
                                    placeholder="Email or phone"
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="bg-background/50"
                            />
                        </div>
                        {editingEvent && (
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select
                                    value={form.status || ""}
                                    onValueChange={(val) =>
                                        setForm({ ...form, status: val as EventRequest["status"] })
                                    }
                                >
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(statusColors).map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Announcer</Label>
                            <Select
                                value={form.announcerId ? form.announcerId.toString() : "none"}
                                onValueChange={(val) =>
                                    setForm({ ...form, announcerId: val === "none" ? undefined : Number(val) })
                                }
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select announcer (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {announcers.map((announcer) => (
                                        <SelectItem key={announcer.id} value={announcer.id.toString()}>
                                            {announcer.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingEvent ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete <strong className="text-foreground">{deletingEvent?.name}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
