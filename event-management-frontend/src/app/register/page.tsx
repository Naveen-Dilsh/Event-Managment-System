"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { userApi } from "@/lib/api";
import type { UserRegisterRequest } from "@/lib/types";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState<UserRegisterRequest>({
        fullName: "",
        email: "",
        password: "",
        role: "ATTENDEE", // Always ATTENDEE — admins are created in DB directly
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fullName || !form.email || !form.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await userApi.register(form);
            toast.success("Account created! Please sign in.");
            router.push("/login");
        } catch (err: any) {
            toast.error(err.message || "Failed to register account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
                    <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight gradient-text">Create an account</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Get started with EventFlow platform today
                </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    className="pl-9 bg-background/50 border-border/50 focus:border-violet-500"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-9 bg-background/50 border-border/50 focus:border-violet-500"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-background/50 border-border/50 focus:border-violet-500"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-violet-500/5 px-4 py-2.5">
                            <p className="text-xs text-muted-foreground">
                                You will be registered as an <span className="font-semibold text-violet-400">Attendee</span>. Admins are managed separately.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create account"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
