"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Loader2, Save, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { attendeeApi } from "@/lib/api";
import type { AttendeeRequest, AttendeeResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [attendee, setAttendee] = useState<AttendeeResponse | null>(null);
    const [form, setForm] = useState<AttendeeRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            if (!user?.email) return;
            try {
                const data = await attendeeApi.getByEmail(user.email);
                setAttendee(data);
                setForm({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone || "",
                    dateOfBirth: data.dateOfBirth || "",
                    gender: data.gender || "",
                    address: data.address || "",
                    city: data.city || "",
                    country: data.country || "",
                    preferences: data.preferences || "",
                });
            } catch {
                // No attendee profile yet — pre-fill from user account
                const parts = (user.fullName || "").split(" ");
                setForm({
                    firstName: parts[0] || "",
                    lastName: parts.slice(1).join(" ") || "",
                    email: user.email || "",
                    phone: "",
                    dateOfBirth: "",
                    gender: "",
                    address: "",
                    city: "",
                    country: "",
                    preferences: "",
                });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    const handleSave = async () => {
        if (!form) return;
        setSaving(true);
        try {
            if (attendee) {
                await attendeeApi.update(attendee.id, form);
                toast.success("Profile updated!");
            } else {
                const created = await attendeeApi.create(form);
                setAttendee(created);
                toast.success("Profile created!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
                    <a href="/browse" className="text-sm font-bold gradient-text">← Browse Events</a>
                    <div className="flex items-center gap-3">
                        <a href="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground">My Bookings</a>
                        <a href="/my-tickets" className="text-sm text-muted-foreground hover:text-foreground">My Tickets</a>
                        <a href="/my-loyalty" className="text-sm text-muted-foreground hover:text-foreground">Loyalty</a>
                        <button onClick={logout} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                            <LogOut className="h-3.5 w-3.5" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                        <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight gradient-text">{user?.fullName}</h1>
                        <p className="text-sm text-muted-foreground">{user?.email} · {user?.role}</p>
                    </div>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-violet-400" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : form ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="pl-9 bg-background/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} className="pl-9 bg-background/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input type="date" value={form.dateOfBirth || ""} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Input value={form.gender || ""} onChange={e => setForm({ ...form, gender: e.target.value })} placeholder="Optional" className="bg-background/50" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} className="pl-9 bg-background/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={form.city || ""} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Input value={form.country || ""} onChange={e => setForm({ ...form, country: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Preferences</Label>
                                    <Input value={form.preferences || ""} onChange={e => setForm({ ...form, preferences: e.target.value })} placeholder="e.g., Vegetarian, Front row seating..." className="bg-background/50" />
                                </div>
                                <div className="sm:col-span-2 flex justify-end pt-2">
                                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Save Profile
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
