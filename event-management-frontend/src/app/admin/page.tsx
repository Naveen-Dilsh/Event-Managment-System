"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  CreditCard,
  TrendingUp,
  Award,
  ArrowUpRight,
  Activity,
  Ticket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { eventApi, ticketApi, attendeeApi, sponsorshipApi } from "@/lib/api";
import type { EventResponse } from "@/lib/types";

function KPICard({
  title,
  value,
  icon: Icon,
  gradient,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  suffix?: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-violet-600/5">
      <div
        className={`absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10 ${gradient}`}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
              )}
            </div>
          </div>
          <div
            className={`rounded-xl p-2.5 ${gradient} shadow-lg`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentEventCard({ event }: { event: EventResponse }) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ONGOING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    POSTPONED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border/30 bg-card/30 p-4 transition-all duration-200 hover:border-border/60 hover:bg-card/60">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
        <CalendarDays className="h-5 w-5 text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {event.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {event.organizerName} •{" "}
          {new Date(event.eventDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <Badge
        variant="outline"
        className={statusColors[event.status] || statusColors.DRAFT}
      >
        {event.status}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    activeSponsorships: 0,
  });
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eventsData, ticketsData, attendeesData, sponsorshipsData] = await Promise.allSettled([
          eventApi.getAll(),
          ticketApi.getAll(),
          attendeeApi.getAll(),
          sponsorshipApi.getAll(),
        ]);

        let evts: EventResponse[] = [];
        if (eventsData.status === "fulfilled") {
          evts = eventsData.value;
          setEvents(evts);
        }

        let totalSolds = 0;
        let revenue = 0;
        if (ticketsData.status === "fulfilled") {
          totalSolds = ticketsData.value.reduce((acc, t) => acc + (t.soldQuantity || 0), 0);
          revenue += ticketsData.value.reduce((acc, t) => acc + ((t.price || 0) * (t.soldQuantity || 0)), 0);
        }

        let attCount = 0;
        if (attendeesData.status === "fulfilled") {
          attCount = attendeesData.value.length;
        }

        let sponsorCount = 0;
        if (sponsorshipsData.status === "fulfilled") {
          sponsorCount = sponsorshipsData.value.filter(s => s.status === 'APPROVED').length;
          revenue += sponsorshipsData.value
            .filter(s => s.paymentStatus === 'PAID')
            .reduce((acc, s) => acc + (s.sponsorshipAmount || 0), 0);
        }

        setMetrics({
          totalEvents: evts.length,
          totalTicketsSold: totalSolds,
          totalAttendees: attCount,
          totalRevenue: revenue,
          activeSponsorships: sponsorCount,
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpiCards = [
    {
      title: "Total Events",
      value: metrics.totalEvents,
      icon: CalendarDays,
      gradient: "bg-gradient-to-br from-violet-600 to-indigo-600",
    },
    {
      title: "Tickets Sold",
      value: metrics.totalTicketsSold,
      icon: Ticket,
      gradient: "bg-gradient-to-br from-blue-600 to-cyan-600",
    },
    {
      title: "Total Attendees",
      value: metrics.totalAttendees,
      icon: Users,
      gradient: "bg-gradient-to-br from-emerald-600 to-teal-600",
    },
    {
      title: "Approved Sponsors",
      value: metrics.activeSponsorships,
      icon: Award,
      gradient: "bg-gradient-to-br from-amber-600 to-orange-600",
    },
    {
      title: "Total Revenue",
      value: `$${Math.round(metrics.totalRevenue).toLocaleString()}`,
      icon: CreditCard,
      gradient: "bg-gradient-to-br from-pink-600 to-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s an overview of your event management platform.
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpiCards.map((card) => (
            <KPICard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Events */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                Recent Events
              </div>
            </CardTitle>
            <a
              href="/events"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-border/30 p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No events yet. Create your first event to get started!
                </p>
              </div>
            ) : (
              events
                .slice(0, 5)
                .map((event) => (
                  <RecentEventCard key={event.id} event={event} />
                ))
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Quick Stats
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Active Events",
                value: events.filter(
                  (e) => e.status === "PUBLISHED" || e.status === "ONGOING"
                ).length,
                color: "from-emerald-500 to-teal-500",
              },
              {
                label: "Draft Events",
                value: events.filter((e) => e.status === "DRAFT").length,
                color: "from-zinc-400 to-zinc-500",
              },
              {
                label: "Completed",
                value: events.filter((e) => e.status === "COMPLETED").length,
                color: "from-violet-500 to-indigo-500",
              },
              {
                label: "Cancelled",
                value: events.filter((e) => e.status === "CANCELLED").length,
                color: "from-red-500 to-rose-500",
              },
              {
                label: "Total Capacity",
                value: events.reduce((sum, e) => sum + (e.capacity || 0), 0).toLocaleString(),
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Available Seats",
                value: events.reduce((sum, e) => sum + (e.availableSeats || 0), 0).toLocaleString(),
                color: "from-amber-500 to-orange-500",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border border-border/20 bg-card/30 px-4 py-3 transition-all hover:border-border/40"
              >
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={`bg-gradient-to-r ${stat.color} bg-clip-text text-lg font-bold text-transparent`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
