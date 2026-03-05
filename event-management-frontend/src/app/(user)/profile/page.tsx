"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Loader2, Save, Sparkles, CalendarDays, Ticket, Search } from "lucide-react";
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
    const { user, isAdmin } = useAuth();
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
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            {/* Fixed Header */}
            <div className="flex-none relative border-b border-border/50 bg-gradient-to-br from-background via-violet-950/10 to-indigo-950/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
                <div className="relative mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between">
                        <Link href="/browse" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight gradient-text hidden sm:inline-block">EventFlow</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {/* Desktop quick links */}
                            <div className="hidden md:flex items-center gap-6 mr-2">
                                <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <Search className="h-3.5 w-3.5" /> Browse Events
                                </Link>
                                <Link href="/my-bookings" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" /> My Bookings
                                </Link>
                                <Link href="/my-tickets" className="text-sm font-medium text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1.5">
                                    <Ticket className="h-3.5 w-3.5" /> My Tickets
                                </Link>
                                <Link href="/my-loyalty" className="text-sm font-medium text-amber-500/80 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5" /> Loyalty Points
                                </Link>
                            </div>

                            {/* User Profile Dropdown */}
                            <div className="relative group z-50">
                                <button className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 p-1 pr-3 hover:bg-accent/50 transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 font-semibold text-sm">
                                        {user?.fullName?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm font-medium">{user?.fullName?.split(" ")[0] || "User"}</span>
                                </button>

                                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="w-48 rounded-md border border-border/50 bg-card/95 backdrop-blur-md shadow-xl py-1 overflow-hidden">
                                        <div className="px-3 py-2 border-b border-border/30 mb-1">
                                            <p className="text-sm font-medium truncate">{user?.fullName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>

                                        <div className="md:hidden">
                                            <Link href="/browse" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <Search className="h-4 w-4 text-muted-foreground" /> Browse Events
                                            </Link>
                                            <Link href="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" /> My Bookings
                                            </Link>
                                            <Link href="/my-tickets" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors">
                                                <Ticket className="h-4 w-4 text-muted-foreground" /> My Tickets
                                            </Link>
                                            <Link href="/my-loyalty" className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors">
                                                <Sparkles className="h-4 w-4" /> Loyalty Points
                                            </Link>
                                            <div className="h-px bg-border/50 my-1 mx-2"></div>
                                        </div>

                                        <Link href="/profile" className="block px-4 py-2 text-sm text-violet-400 hover:bg-accent/50 transition-colors">
                                            Profile Settings
                                        </Link>

                                        {isAdmin && (
                                            <Link href="/admin/events" className="block px-4 py-2 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <div className="h-px bg-border/50 my-1 mx-2"></div>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("user");
                                                window.location.href = "/login";
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-8 relative">
                <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
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
        </div>
    );
}
