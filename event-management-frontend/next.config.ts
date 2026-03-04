import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/events/:path*",
        destination: `${process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || "http://localhost:8081"}/api/events/:path*`,
      },
      {
        source: "/api/tickets/:path*",
        destination: `${process.env.NEXT_PUBLIC_TICKETING_SERVICE_URL || "http://localhost:8082"}/api/tickets/:path*`,
      },
      {
        source: "/api/bookings/:path*",
        destination: `${process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || "http://localhost:8083"}/api/bookings/:path*`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:8084"}/api/payments/:path*`,
      },
      {
        source: "/api/attendees/:path*",
        destination: `${process.env.NEXT_PUBLIC_ATTENDEE_SERVICE_URL || "http://localhost:8085"}/api/attendees/:path*`,
      },
      {
        source: "/api/venues/:path*",
        destination: `${process.env.NEXT_PUBLIC_VENUE_SERVICE_URL || "http://localhost:8086"}/api/venues/:path*`,
      },
      {
        source: "/api/sponsorships/:path*",
        destination: `${process.env.NEXT_PUBLIC_SPONSORSHIP_SERVICE_URL || "http://localhost:8087"}/api/sponsorships/:path*`,
      },
      {
        source: "/api/loyalty/:path*",
        destination: `${process.env.NEXT_PUBLIC_LOYALTY_SERVICE_URL || "http://localhost:8088"}/api/loyalty/:path*`,
      },
      {
        source: "/api/vendors/:path*",
        destination: `${process.env.NEXT_PUBLIC_VENDOR_SERVICE_URL || "http://localhost:8089"}/api/vendors/:path*`,
      },
      {
        source: "/api/announcers/:path*",
        destination: `${process.env.NEXT_PUBLIC_ANNOUNCER_SERVICE_URL || "http://localhost:8090"}/api/announcers/:path*`,
      },
      {
        source: "/api/announcer-works/:path*",
        destination: `${process.env.NEXT_PUBLIC_ANNOUNCER_SERVICE_URL || "http://localhost:8090"}/api/announcer-works/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8091"}/api/users/:path*`,
      },
    ];
  },
};

export default nextConfig;
