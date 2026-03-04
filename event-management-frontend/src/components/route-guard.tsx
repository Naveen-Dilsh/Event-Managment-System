"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
    children: React.ReactNode;
    allowedRoles: ("ADMIN" | "ATTENDEE" | "ORGANIZER" | "USER")[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        const role = user?.role as string;
        if (!allowedRoles.includes(role as any)) {
            // Redirect to the correct home for their role
            if (role === "ADMIN") {
                router.replace("/admin");
            } else {
                router.replace("/browse");
            }
        }
    }, [isAuthenticated, isLoading, user, router, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const role = user?.role as string;
    if (!allowedRoles.includes(role as any)) return null;

    return <>{children}</>;
}
