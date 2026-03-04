import { RouteGuard } from "@/components/route-guard";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard allowedRoles={["ATTENDEE", "ORGANIZER", "USER"]}>
            {children}
        </RouteGuard>
    );
}
