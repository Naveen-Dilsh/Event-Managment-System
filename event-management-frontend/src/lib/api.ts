const SERVICE_URLS = {
    event: "",
    ticketing: "",
    booking: "",
    payment: "",
    attendee: "",
    venue: "",
    sponsorship: "",
    loyalty: "",
    vendor: "",
    announcer: "",
    users: "",
};

async function apiRequest<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const error = await res.text().catch(() => "Unknown error");
        throw new Error(`API Error ${res.status}: ${error}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// ==================== Event Service ====================
import type { EventRequest, EventResponse } from "./types";

export const eventApi = {
    getAll: () => apiRequest<EventResponse[]>(`${SERVICE_URLS.event}/api/events`),
    getById: (id: number) => apiRequest<EventResponse>(`${SERVICE_URLS.event}/api/events/${id}`),
    create: (data: EventRequest) =>
        apiRequest<EventResponse>(`${SERVICE_URLS.event}/api/events`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: EventRequest) =>
        apiRequest<EventResponse>(`${SERVICE_URLS.event}/api/events/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.event}/api/events/${id}`, {
            method: "DELETE",
        }),
    reduceSeats: (id: number, quantity: number) =>
        apiRequest<string>(`${SERVICE_URLS.event}/api/events/${id}/reduce-seats`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
        }),
};

// ==================== Venue Service ====================
import type { VenueRequest, VenueResponse } from "./types";

export const venueApi = {
    getAll: () => apiRequest<VenueResponse[]>(`${SERVICE_URLS.venue}/api/venues`),
    getById: (id: number) => apiRequest<VenueResponse>(`${SERVICE_URLS.venue}/api/venues/${id}`),
    create: (data: VenueRequest) =>
        apiRequest<VenueResponse>(`${SERVICE_URLS.venue}/api/venues`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: VenueRequest) =>
        apiRequest<VenueResponse>(`${SERVICE_URLS.venue}/api/venues/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.venue}/api/venues/${id}`, {
            method: "DELETE",
        }),
};

// ==================== Ticket Service ====================
import type { TicketRequest, TicketResponse } from "./types";

export const ticketApi = {
    getAll: () => apiRequest<TicketResponse[]>(`${SERVICE_URLS.ticketing}/api/tickets`),
    getById: (id: number) => apiRequest<TicketResponse>(`${SERVICE_URLS.ticketing}/api/tickets/${id}`),
    getByEvent: (eventId: number) =>
        apiRequest<TicketResponse[]>(`${SERVICE_URLS.ticketing}/api/tickets/event/${eventId}`),
    create: (data: TicketRequest) =>
        apiRequest<TicketResponse>(`${SERVICE_URLS.ticketing}/api/tickets`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: TicketRequest) =>
        apiRequest<TicketResponse>(`${SERVICE_URLS.ticketing}/api/tickets/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    reduceQuantity: (id: number, quantity: number) =>
        apiRequest<string>(`${SERVICE_URLS.ticketing}/api/tickets/${id}/reduce`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.ticketing}/api/tickets/${id}`, {
            method: "DELETE",
        }),
};

// ==================== Booking Service ====================
import type { BookingRequest, BookingResponse } from "./types";

export const bookingApi = {
    getAll: () => apiRequest<BookingResponse[]>(`${SERVICE_URLS.booking}/api/bookings`),
    getById: (id: number) => apiRequest<BookingResponse>(`${SERVICE_URLS.booking}/api/bookings/${id}`),
    getByReference: (reference: string) =>
        apiRequest<BookingResponse>(`${SERVICE_URLS.booking}/api/bookings/reference/${reference}`),
    create: (data: BookingRequest) =>
        apiRequest<BookingResponse>(`${SERVICE_URLS.booking}/api/bookings`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    cancel: (id: number) =>
        apiRequest<BookingResponse>(`${SERVICE_URLS.booking}/api/bookings/${id}/cancel`, {
            method: "PATCH",
        }),
};

// ==================== Attendee Service ====================
import type { AttendeeRequest, AttendeeResponse } from "./types";

export const attendeeApi = {
    getAll: () => apiRequest<AttendeeResponse[]>(`${SERVICE_URLS.attendee}/api/attendees`),
    getById: (id: number) =>
        apiRequest<AttendeeResponse>(`${SERVICE_URLS.attendee}/api/attendees/${id}`),
    getByEmail: (email: string) =>
        apiRequest<AttendeeResponse>(`${SERVICE_URLS.attendee}/api/attendees/email/${email}`),
    create: (data: AttendeeRequest) =>
        apiRequest<AttendeeResponse>(`${SERVICE_URLS.attendee}/api/attendees`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: AttendeeRequest) =>
        apiRequest<AttendeeResponse>(`${SERVICE_URLS.attendee}/api/attendees/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.attendee}/api/attendees/${id}`, {
            method: "DELETE",
        }),
};

// ==================== Payment Service ====================
import type { PaymentRequest, PaymentResponse, RefundRequest } from "./types";

export const paymentApi = {
    getById: (id: number) =>
        apiRequest<PaymentResponse>(`${SERVICE_URLS.payment}/api/payments/${id}`),
    getByBooking: (bookingId: number) =>
        apiRequest<PaymentResponse>(`${SERVICE_URLS.payment}/api/payments/booking/${bookingId}`),
    getByTransaction: (transactionId: string) =>
        apiRequest<PaymentResponse>(
            `${SERVICE_URLS.payment}/api/payments/transaction/${transactionId}`
        ),
    process: (data: PaymentRequest) =>
        apiRequest<PaymentResponse>(`${SERVICE_URLS.payment}/api/payments`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    refund: (paymentId: number, data: RefundRequest) =>
        apiRequest<PaymentResponse>(`${SERVICE_URLS.payment}/api/payments/${paymentId}/refund`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

// ==================== Vendor Service ====================
import type { VendorRequest, VendorResponse } from "./types";

export const vendorApi = {
    getAll: () => apiRequest<VendorResponse[]>(`${SERVICE_URLS.vendor}/api/vendors`),
    getById: (id: number) => apiRequest<VendorResponse>(`${SERVICE_URLS.vendor}/api/vendors/${id}`),
    getByEvent: (eventId: number) =>
        apiRequest<VendorResponse[]>(`${SERVICE_URLS.vendor}/api/vendors/event/${eventId}`),
    getByType: (vendorType: string) =>
        apiRequest<VendorResponse[]>(`${SERVICE_URLS.vendor}/api/vendors/type/${vendorType}`),
    getByStatus: (status: string) =>
        apiRequest<VendorResponse[]>(`${SERVICE_URLS.vendor}/api/vendors/status/${status}`),
    create: (data: VendorRequest) =>
        apiRequest<VendorResponse>(`${SERVICE_URLS.vendor}/api/vendors`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: VendorRequest) =>
        apiRequest<VendorResponse>(`${SERVICE_URLS.vendor}/api/vendors/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.vendor}/api/vendors/${id}`, {
            method: "DELETE",
        }),
};

// ==================== Sponsorship Service ====================
import type { SponsorshipRequest, SponsorshipResponse } from "./types";

export const sponsorshipApi = {
    getAll: () => apiRequest<SponsorshipResponse[]>(`${SERVICE_URLS.sponsorship}/api/sponsorships`),
    getById: (id: number) => apiRequest<SponsorshipResponse>(`${SERVICE_URLS.sponsorship}/api/sponsorships/${id}`),
    getByEvent: (eventId: number) =>
        apiRequest<SponsorshipResponse[]>(`${SERVICE_URLS.sponsorship}/api/sponsorships/event/${eventId}`),
    create: (data: SponsorshipRequest) =>
        apiRequest<SponsorshipResponse>(`${SERVICE_URLS.sponsorship}/api/sponsorships`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: SponsorshipRequest) =>
        apiRequest<SponsorshipResponse>(`${SERVICE_URLS.sponsorship}/api/sponsorships/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    updateStatus: (id: number, status: string) =>
        apiRequest<string>(`${SERVICE_URLS.sponsorship}/api/sponsorships/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),
    updatePaymentStatus: (id: number) =>
        apiRequest<string>(`${SERVICE_URLS.sponsorship}/api/sponsorships/${id}/payment-status`, {
            method: "PATCH",
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.sponsorship}/api/sponsorships/${id}`, {
            method: "DELETE",
        }),
};

// ==================== User Service ====================
import type { UserRegisterRequest, UserLoginRequest, UserResponse } from "./types";

export const userApi = {
    register: (data: UserRegisterRequest) =>
        apiRequest<UserResponse>(`${SERVICE_URLS.users}/api/users/register`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    login: (data: UserLoginRequest) =>
        apiRequest<UserResponse>(`${SERVICE_URLS.users}/api/users/login`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    logout: (userId: number) =>
        apiRequest<string>(`${SERVICE_URLS.users}/api/users/logout/${userId}`, {
            method: "POST",
        }),
};

// ==================== Loyalty Service ====================
import type { LoyaltyAccountRequest, LoyaltyAccountResponse } from "./types";

export const loyaltyApi = {
    getAll: () => apiRequest<LoyaltyAccountResponse[]>(`${SERVICE_URLS.loyalty}/api/loyalty`),
    getById: (id: number) => apiRequest<LoyaltyAccountResponse>(`${SERVICE_URLS.loyalty}/api/loyalty/${id}`),
    getByAttendee: (attendeeId: number) =>
        apiRequest<LoyaltyAccountResponse>(`${SERVICE_URLS.loyalty}/api/loyalty/attendee/${attendeeId}`),
    create: (data: LoyaltyAccountRequest) =>
        apiRequest<LoyaltyAccountResponse>(`${SERVICE_URLS.loyalty}/api/loyalty`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: LoyaltyAccountRequest) =>
        apiRequest<LoyaltyAccountResponse>(`${SERVICE_URLS.loyalty}/api/loyalty/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.loyalty}/api/loyalty/${id}`, {
            method: "DELETE",
        }),
};

// ==================== Announcer Service ====================
import type { AnnouncerRequest, AnnouncerResponse, AnnouncerWorkRequest, AnnouncerWorkResponse } from "./types";

export const announcerApi = {
    // Announcers
    getAll: () => apiRequest<AnnouncerResponse[]>(`${SERVICE_URLS.announcer}/api/announcers`),
    getById: (id: number) => apiRequest<AnnouncerResponse>(`${SERVICE_URLS.announcer}/api/announcers/${id}`),
    create: (data: AnnouncerRequest) =>
        apiRequest<AnnouncerResponse>(`${SERVICE_URLS.announcer}/api/announcers`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: number, data: AnnouncerRequest) =>
        apiRequest<AnnouncerResponse>(`${SERVICE_URLS.announcer}/api/announcers/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.announcer}/api/announcers/${id}`, {
            method: "DELETE",
        }),

    // Announcer Works
    getAllWorks: () => apiRequest<AnnouncerWorkResponse[]>(`${SERVICE_URLS.announcer}/api/announcer-works`),
    getWorkById: (id: number) => apiRequest<AnnouncerWorkResponse>(`${SERVICE_URLS.announcer}/api/announcer-works/${id}`),
    getWorksByAnnouncer: (announcerId: number) =>
        apiRequest<AnnouncerWorkResponse[]>(`${SERVICE_URLS.announcer}/api/announcer-works/announcer/${announcerId}`),
    createWork: (data: AnnouncerWorkRequest) =>
        apiRequest<AnnouncerWorkResponse>(`${SERVICE_URLS.announcer}/api/announcer-works`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateWork: (id: number, data: AnnouncerWorkRequest) =>
        apiRequest<AnnouncerWorkResponse>(`${SERVICE_URLS.announcer}/api/announcer-works/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteWork: (id: number) =>
        apiRequest<void>(`${SERVICE_URLS.announcer}/api/announcer-works/${id}`, {
            method: "DELETE",
        }),
};
