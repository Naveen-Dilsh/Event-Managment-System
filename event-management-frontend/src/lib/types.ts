// ==================== Event Service ====================
export interface EventRequest {
  name: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueId: number;
  category: string;
  capacity: number;
  organizerName: string;
  organizerContact: string;
  imageUrl?: string;
  status?: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "POSTPONED";
}

export interface EventResponse extends EventRequest {
  id: number;
  availableSeats: number;
  status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "POSTPONED";
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Venue Service ====================
export interface VenueRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number;
  venueType: string;
  facilities?: string;
  contactEmail: string;
  contactPhone: string;
}

export interface VenueResponse extends VenueRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Ticket Service ====================
export interface TicketRequest {
  eventId: number;
  ticketType: string;
  price: number;
  quantity: number;
  description?: string;
  validFrom?: string;
  validUntil?: string;
  maxPerBooking?: number;
}

export interface TicketResponse extends TicketRequest {
  id: number;
  availableQuantity: number;
  soldQuantity: number;
  status: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Booking Service ====================
export interface BookingRequest {
  eventId: number;
  ticketId: number;
  attendeeId: number;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

export interface BookingResponse extends BookingRequest {
  id: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  bookingReference: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Attendee Service ====================
export interface AttendeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  preferences?: string;
}

export interface AttendeeResponse extends AttendeeRequest {
  id: number;
  createdAt?: string;
}

// ==================== Payment Service ====================
export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod?: string;
  paymentGateway?: string;
}

export interface PaymentResponse extends PaymentRequest {
  id: number;
  paymentStatus: "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  transactionId: string;
  paymentDate: string;
  cardLastFour?: string;
  refundAmount?: number;
  refundDate?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RefundRequest {
  refundAmount: number;
}

// ==================== Vendor Service ====================
export interface VendorRequest {
  eventId?: number;
  vendorName: string;
  vendorType: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  serviceDescription?: string;
  cost?: number;
  contractStatus?: string;
}

export interface VendorResponse extends VendorRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Sponsorship Service ====================
export interface SponsorshipRequest {
  eventId: number;
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone: string;
  companyName: string;
  sponsorshipTier: string;
  sponsorshipAmount: number;
  currency: string;
  benefits?: string;
  logoUrl?: string;
  websiteUrl?: string;
  agreementDate?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface SponsorshipResponse extends SponsorshipRequest {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID";
  createdAt?: string;
  updatedAt?: string;
}

// ==================== User Service ====================
export interface UserRegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  role: string;
}

export interface UserLoginRequest {
  email: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  token?: string; // Standard pattern if UI needs a token
}

// ==================== Loyalty Service ====================
export interface LoyaltyAccountRequest {
  attendeeId: number;
  pointsBalance: number;
  totalPointsEarned: number;
  membershipTier: string;
  status: string;
}

export interface LoyaltyAccountResponse extends LoyaltyAccountRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Announcer Service ====================
export interface AnnouncerRequest {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  experienceYears: number;
  status: string;
}

export interface AnnouncerResponse extends AnnouncerRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncerWorkRequest {
  announcerId: number;
  eventId: number;
  role: string;
  eventDate: string;
  notes: string;
}

export interface AnnouncerWorkResponse extends AnnouncerWorkRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}
