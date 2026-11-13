/**
 * Types derived from the Deevi backend OpenAPI contract (swagger.json).
 *
 * IMPORTANT: request bodies are camelCase; responses are snake_case. Keep that
 * split intact — it mirrors the backend exactly. Where swagger typed a payload
 * as an opaque `object` (job/application/artisan detail, admin metrics) the
 * shape below was confirmed against the live API and marked accordingly.
 */

// ---- Enums / unions (from swagger enums) ----------------------------------

export type Role = "CUSTOMER" | "ARTISAN" | "ADMIN";
export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS"
  | "SUPPORT"
  | "VERIFICATION";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type CategoryGroup =
  | "HOME_REPAIR"
  | "PERSONAL"
  | "MOBILITY"
  | "GENERAL";

export type JobStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RECEIVING_APPLICATIONS"
  | "ARTISAN_SELECTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "EXPIRED";

export type Urgency = "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";
export type BudgetType = "FIXED" | "HOURLY" | "DAILY" | "NEGOTIABLE";

export type ApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "EXPIRED";

export type PriceType = "FIXED" | "HOURLY" | "DAILY" | "NEGOTIABLE";
export type DurationUnit = "MINUTE" | "HOUR" | "DAY" | "WEEK";
export type PriceUnit =
  | "PER_JOB"
  | "PER_HOUR"
  | "PER_DAY"
  | "PER_UNIT"
  | "NEGOTIABLE";

export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";

export type LocationSource = "MANUAL" | "MAP" | "DEVICE" | "SAVED" | "IMPORTED";

export type ReportCategory =
  | "NO_SHOW"
  | "POOR_WORKMANSHIP"
  | "INAPPROPRIATE_BEHAVIOUR"
  | "MISLEADING_LISTING"
  | "MISLEADING_PROFILE"
  | "PRICING_ISSUE"
  | "INCOMPLETE_SERVICE"
  | "SAFETY_CONCERN"
  | "PAYMENT_ISSUE"
  | "SPAM"
  | "FRAUD"
  | "OTHER";

export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export type DocumentType =
  | "NIN"
  | "DRIVERS_LICENCE"
  | "VOTERS_CARD"
  | "INTERNATIONAL_PASSPORT"
  | "CAC_CERTIFICATE"
  | "UTILITY_BILL"
  | "TRADE_CERTIFICATE"
  | "GUARANTOR_LETTER"
  | "PROOF_OF_ADDRESS"
  | "OTHER";

export type StorageBucket =
  | "avatars"
  | "portfolio"
  | "job-media"
  | "message-attachments"
  | "verification-documents";

// ---- Pagination ------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

// ---- Auth ------------------------------------------------------------------

export interface AuthUser {
  id: string;
  authUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  adminRole: AdminRole | null;
  customerProfileId: string | null;
  artisanProfileId: string | null;
  artisanVerificationStatus: VerificationStatus | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  session: Session | null;
}

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "CUSTOMER" | "ARTISAN";
}

export interface AuthProviders {
  emailPassword: { enabled: boolean; mocked: boolean };
  google: { enabled: boolean; mocked: boolean; configured: boolean };
  apple: { enabled: boolean; mocked: boolean; configured: boolean };
}

// ---- Catalogue -------------------------------------------------------------

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  group_key: CategoryGroup;
  sort_order: number;
  is_active: boolean;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  typical_price_min: number | null;
  typical_price_max: number | null;
  requires_verification?: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface SubService {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export interface CatalogueTreeCategory extends ServiceCategory {
  services: Service[];
}

// ---- Customer / locations --------------------------------------------------

export interface CustomerProfile {
  id: string;
  user_id: string;
  default_location_id: string | null;
  jobs_posted_count: number;
  jobs_completed_count: number;
  rating_average: number;
  rating_count: number;
  preferred_contact: string;
}

export interface Location {
  id: string;
  label: string;
  address_line: string | null;
  neighbourhood: string | null;
  city: string | null;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
}

// ---- Jobs ------------------------------------------------------------------

export interface JobSummary {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  urgency: Urgency;
  service_id: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  neighbourhood: string | null;
  city: string | null;
  applications_count: number;
  published_at: string | null;
  created_at: string;
}

/** Full job record — swagger left this opaque; shape confirmed against live API,
 *  so treat unknown extras as optional. */
export interface JobDetail extends JobSummary {
  service_name?: string;
  sub_service_id?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  budget_type?: BudgetType;
  preferred_start_at?: string | null;
  preferred_end_at?: string | null;
  preferred_time_notes?: string | null;
  is_flexible_timing?: boolean;
  additional_notes?: string | null;
  address_line?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_notes?: string | null;
  payment_mode?: string;
  expires_at?: string | null;
  customer_id?: string;
  media?: JobMedia[];
  engagement?: Engagement | null;
  [key: string]: unknown;
}

export interface JobMedia {
  id: string;
  storage_path?: string;
  url?: string | null;
  media_type?: "IMAGE" | "VIDEO";
  sort_order?: number;
}

export interface ServiceLocationInput {
  savedLocationId?: string;
  addressLine?: string;
  neighbourhood?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  locationNotes?: string;
  source?: LocationSource;
}

export interface CreateJobInput {
  title: string;
  description: string;
  serviceId: string;
  subServiceId?: string;
  location: ServiceLocationInput;
  urgency?: Urgency;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: BudgetType;
  preferredStartAt?: string;
  preferredEndAt?: string;
  preferredTimeNotes?: string;
  isFlexibleTiming?: boolean;
  additionalNotes?: string;
  media?: { storagePath: string; mediaType?: "IMAGE" | "VIDEO"; mimeType?: string; sortOrder?: number }[];
  publish?: boolean;
  expiresInDays?: number;
  transportFare?: number;
  shareWithSavedArtisans?: boolean;
}

export interface JobHistoryEntry {
  id?: string;
  from_status?: string | null;
  to_status?: string;
  status?: string;
  note?: string | null;
  created_at?: string;
  actor_role?: string | null;
  [key: string]: unknown;
}

/** Engagement (the accepted job an artisan is working on). Opaque in swagger. */
export interface Engagement {
  id: string;
  job_post_id?: string;
  status?: JobStatus | string;
  agreed_price?: number | null;
  currency?: string;
  title?: string;
  artisan_id?: string;
  customer_id?: string;
  [key: string]: unknown;
}

// ---- Job feed --------------------------------------------------------------

export interface FeedJob {
  id: string;
  title: string;
  description: string;
  status: string;
  urgency: Urgency;
  service_id: string;
  service_name: string;
  sub_service_id: string | null;
  category_id: string | null;
  category_name: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: string;
  currency: string;
  preferred_start_at: string | null;
  preferred_time_notes: string | null;
  neighbourhood: string | null;
  city: string | null;
  state: string | null;
  latitude_approx: number | null;
  longitude_approx: number | null;
  distance_km: number | null;
  applications_count: number;
  media_count: number;
  media?: JobMedia[];
  published_at: string | null;
  expires_at: string | null;
  relevance_score: number;
}

// ---- Applications ----------------------------------------------------------

export interface CreateApplicationInput {
  jobPostId: string;
  message: string;
  proposedPrice?: number;
  priceType?: PriceType;
  estimatedDurationValue?: number;
  estimatedDurationUnit?: DurationUnit;
  availabilityNote?: string;
  canStartAt?: string;
  relevantExperience?: string;
  transportFare?: number;
  transportFarePaidBy?: "CUSTOMER" | "ARTISAN" | "INCLUDED";
  relevantExperienceImages?: string[];
}

/** Application — opaque in swagger; fields confirmed against the live API. */
export interface Application {
  id: string;
  job_post_id: string;
  artisan_id?: string;
  status: ApplicationStatus;
  message: string | null;
  proposed_price: number | null;
  price_type: string | null;
  currency?: string;
  estimated_duration_value?: number | null;
  estimated_duration_unit?: string | null;
  availability_note?: string | null;
  can_start_at?: string | null;
  relevant_experience?: string | null;
  created_at: string;
  // Artisan snapshot the backend joins in for the customer's review screen.
  artisan?: PublicArtisan | null;
  job?: JobSummary | null;
  [key: string]: unknown;
}

// ---- Artisan ---------------------------------------------------------------

export interface PublicArtisan {
  id?: string;
  artisan_id?: string;
  user_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  business_name?: string | null;
  bio?: string | null;
  years_of_experience?: number;
  rating_average?: number;
  rating_count?: number;
  jobs_completed_count?: number;
  availability_status?: string;
  verification_status?: VerificationStatus;
  base_city?: string | null;
  base_state?: string | null;
  distance_km?: number | null;
  services?: ArtisanService[];
  service_areas?: ServiceArea[];
  portfolio?: PortfolioItem[];
  [key: string]: unknown;
}

export interface ArtisanService {
  id?: string;
  service_id: string;
  service_name?: string;
  name?: string;
  services?: {
    category_id: string;
    id: string;
    name: string;
    slug: string;
  }
  sub_service_id?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  price_unit?: string | null;
  years_experience?: number | null;
}

export interface ServiceArea {
  id?: string;
  label?: string | null;
  neighbourhood?: string | null;
  city: string;
  state?: string | null;
  radius_km?: number | null;
}

export interface PortfolioItem {
  id: string;
  storage_path?: string;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  media_type?: "IMAGE" | "VIDEO";
  sort_order?: number;
}

export interface VerificationDocument {
  id: string;
  document_type: DocumentType;
  original_filename?: string | null;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface ArtisanApplicationStatus {
  status: VerificationStatus | string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

// ---- Messaging -------------------------------------------------------------

export interface Conversation {
  id: string;
  job_post_id: string;
  customer_id: string;
  artisan_id: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  message_count: number;
  // Backend joins a counterparty + job snapshot on GET /conversations/{id}.
  counterparty?: PublicArtisan & { first_name?: string | null; last_name?: string | null };
  job?: JobSummary | null;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  message_type: string;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
}

// ---- Reviews ---------------------------------------------------------------

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  direction: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
  [key: string]: unknown;
}

export interface ReviewEligibility {
  canReview: boolean;
  reason: string | null;
  existingReviewId: string | null;
}

export interface ReviewSummary {
  average?: number;
  count?: number;
  distribution?: Record<string, number>;
  [key: string]: unknown;
}

// ---- Reports / disputes ----------------------------------------------------

export interface Report {
  id: string;
  reference: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  priority: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface Dispute {
  id: string;
  job_id?: string;
  reason?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

// ---- Notifications ---------------------------------------------------------

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  entity_type: string | null;
  entity_id: string | null;
  priority: string;
  read_at: string | null;
  created_at: string;
}

// ---- Storage ---------------------------------------------------------------

export interface UploadTicket {
  bucket: string;
  path: string;
  uploadUrl: string;
  token: string;
  publicUrl: string | null;
  expiresIn: number;
  maxBytes: number;
  allowedMimeTypes: string[];
}

// ---- Admin -----------------------------------------------------------------

export interface AdminMetrics {
  [key: string]: unknown;
}

export interface AdminUser {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  status?: string;
  roles?: string[];
  created_at?: string;
  [key: string]: unknown;
}
