/** Barrel for the Deevi API clients. Import from "@/lib/api". */

import { http } from "./client";
import type {
  AuthResponse,
  AuthUser,
  SignupInput,
  AuthProviders,
  Session,
  Paginated,
  ServiceCategory,
  Service,
  SubService,
  CatalogueTreeCategory,
  CategoryGroup,
  CustomerProfile,
  Location,
  JobSummary,
  JobDetail,
  CreateJobInput,
  JobHistoryEntry,
  Engagement,
  FeedJob,
  Application,
  CreateApplicationInput,
  PublicArtisan,
  ArtisanService,
  ServiceArea,
  VerificationDocument,
  ArtisanApplicationStatus,
  Conversation,
  Message,
  Review,
  ReviewEligibility,
  ReviewSummary,
  Report,
  ReportCategory,
  Dispute,
  Notification,
  UploadTicket,
  StorageBucket,
  JobStatus,
  ApplicationStatus,
  AdminMetrics,
  AdminUser,
  Urgency,
  DocumentType,
} from "@/lib/types";

// ---- Auth ------------------------------------------------------------------

export const authApi = {
  signup: (input: SignupInput) => http.publicPost<AuthResponse>("/auth/signup", input),
  login: (email: string, password: string) =>
    http.publicPost<AuthResponse>("/auth/login", { email, password }),
  logout: () => http.post<void>("/auth/logout"),
  me: () => http.get<AuthUser>("/auth/me"),
  providers: () => http.publicGet<AuthProviders>("/auth/providers"),
  oauthUrl: (provider: string, role: "CUSTOMER" | "ARTISAN", redirectTo: string) =>
    http.publicGet<{ url: string }>(`/auth/${provider}/url`, { role, redirectTo }),
  forgotPassword: (email: string) =>
    http.publicPost<{ message: string }>("/auth/forgot-password", { email }),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post<{ message: string }>("/auth/change-password", { currentPassword, newPassword }),
  refresh: (refreshToken: string) =>
    http.publicPost<{ session: Session }>("/auth/refresh", { refreshToken }),
};

// ---- Catalogue -------------------------------------------------------------

export const catalogueApi = {
  tree: () => http.publicGet<CatalogueTreeCategory[]>("/catalogue/tree"),
  categories: (params?: { group?: CategoryGroup; q?: string; page?: number; limit?: number }) =>
    http.publicGet<Paginated<ServiceCategory>>("/catalogue/categories", { limit: 100, ...params }),
  category: (idOrSlug: string) =>
    http.publicGet<ServiceCategory>(`/catalogue/categories/${idOrSlug}`),
  services: (params?: { categoryId?: string; group?: CategoryGroup; q?: string; page?: number; limit?: number }) =>
    http.publicGet<Paginated<Service>>("/catalogue/services", { limit: 100, ...params }),
  service: (idOrSlug: string) =>
    http.publicGet<Service & { sub_services?: SubService[] }>(`/catalogue/services/${idOrSlug}`),
  subServices: (serviceId: string) =>
    http.publicGet<SubService[]>(`/catalogue/services/${serviceId}/sub-services`),
};

// ---- Users -----------------------------------------------------------------

export const usersApi = {
  me: () => http.get<AuthUser>("/users/me"),
  update: (input: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) =>
    http.patch<AuthUser>("/users/me", input),
  deactivate: (reason?: string) => http.del<void>("/users/me", { reason }),
};

// ---- Customers -------------------------------------------------------------

export const customersApi = {
  me: () => http.get<CustomerProfile>("/customers/me"),
  update: (input: { defaultLocationId?: string; preferredContact?: "IN_APP" | "PHONE" | "EMAIL" }) =>
    http.patch<CustomerProfile>("/customers/me", input),
  locations: () => http.get<Location[]>("/customers/me/locations"),
  createLocation: (input: Record<string, unknown>) =>
    http.post<Location>("/customers/me/locations", input),
  updateLocation: (id: string, input: Record<string, unknown>) =>
    http.patch<Location>(`/customers/me/locations/${id}`, input),
  removeLocation: (id: string) => http.del<void>(`/customers/me/locations/${id}`),
};

// ---- Artisans --------------------------------------------------------------

export const artisansApi = {
  me: () => http.get<PublicArtisan>("/artisans/me"),
  update: (input: Record<string, unknown>) => http.patch<PublicArtisan>("/artisans/me", input),
  setServices: (services: Partial<ArtisanService & { serviceId: string }>[]) =>
    http.put<PublicArtisan>("/artisans/me/services", { services }),
  setServiceAreas: (areas: Partial<ServiceArea>[]) =>
    http.put<PublicArtisan>("/artisans/me/service-areas", { areas }),
  setAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    http.put<unknown>("/artisans/me/availability", { slots }),
  addPortfolio: (input: { storagePath: string; title?: string; description?: string; mediaType?: string; sortOrder?: number }) =>
    http.post<unknown>("/artisans/me/portfolio", input),
  removePortfolio: (id: string) => http.del<void>(`/artisans/me/portfolio/${id}`),
  documents: () => http.get<VerificationDocument[]>("/artisans/me/verification-documents"),
  addDocument: (input: { documentType: DocumentType; storagePath: string; originalFilename?: string; mimeType?: string; sizeBytes?: number }) =>
    http.post<VerificationDocument>("/artisans/me/verification-documents", input),
  documentUrl: (id: string) =>
    http.get<{ url: string }>(`/artisans/me/verification-documents/${id}/url`),
  removeDocument: (id: string) => http.del<void>(`/artisans/me/verification-documents/${id}`),
  submitApplication: (note?: string) =>
    http.post<ArtisanApplicationStatus>("/artisans/me/application", { note }),
  applicationStatus: () => http.get<ArtisanApplicationStatus>("/artisans/me/application"),
  publicProfile: (id: string) => http.get<PublicArtisan>(`/artisans/${id}`),
};

// ---- Jobs ------------------------------------------------------------------

type JobListParams = {
  page?: number;
  limit?: number;
  status?: JobStatus;
  bucket?: string;
  serviceId?: string;
  q?: string;
};

export const jobsApi = {
  create: (input: CreateJobInput) => http.post<JobDetail>("/jobs", input),
  mine: (params?: JobListParams) => http.get<Paginated<JobSummary>>("/jobs/mine", params),
  engagements: (params?: JobListParams) =>
    http.get<Paginated<JobSummary>>("/jobs/engagements", params),
  get: (id: string) => http.get<JobDetail>(`/jobs/${id}`),
  update: (id: string, input: Record<string, unknown>) =>
    http.patch<JobDetail>(`/jobs/${id}`, input),
  history: (id: string) => http.get<JobHistoryEntry[]>(`/jobs/${id}/history`),
  setLocation: (id: string, input: Record<string, unknown>) =>
    http.patch<JobDetail>(`/jobs/${id}/location`, input),
  publish: (id: string) => http.post<JobDetail>(`/jobs/${id}/publish`),
  cancel: (id: string, reason: string) => http.post<JobDetail>(`/jobs/${id}/cancel`, { reason }),
  removeMedia: (id: string, mediaId: string) => http.del<void>(`/jobs/${id}/media/${mediaId}`),
  // Engagement lifecycle (artisan/customer).
  accept: (id: string) => http.post<Engagement>(`/engagements/${id}/accept`),
  decline: (id: string, reason?: string) =>
    http.post<Engagement>(`/engagements/${id}/decline`, { reason }),
  start: (id: string) => http.post<Engagement>(`/engagements/${id}/start`),
  artisanComplete: (id: string) => http.post<Engagement>(`/engagements/${id}/artisan-complete`),
  complete: (id: string) => http.post<Engagement>(`/engagements/${id}/complete`),
};

// ---- Job feed --------------------------------------------------------------

export const feedApi = {
  jobs: (params?: {
    page?: number;
    limit?: number;
    city?: string;
    serviceIds?: string[];
    urgency?: Urgency;
    minBudget?: number;
    maxDistanceKm?: number;
    q?: string;
  }) => http.get<Paginated<FeedJob>>("/feed/jobs", params),
  explain: () => http.get<unknown>("/feed/explain"),
};

// ---- Applications ----------------------------------------------------------

export const applicationsApi = {
  apply: (input: CreateApplicationInput) => http.post<Application>("/applications", input),
  mine: (params?: { page?: number; limit?: number; status?: ApplicationStatus; sort?: string }) =>
    http.get<Paginated<Application>>("/applications/mine", params),
  get: (id: string) => http.get<Application>(`/applications/${id}`),
  update: (id: string, input: Record<string, unknown>) =>
    http.patch<Application>(`/applications/${id}`, input),
  withdraw: (id: string) => http.post<Application>(`/applications/${id}/withdraw`),
  shortlist: (id: string) => http.post<Application>(`/applications/${id}/shortlist`),
  reject: (id: string, reason?: string) =>
    http.post<Application>(`/applications/${id}/reject`, { reason }),
  select: (id: string, agreedPrice?: number) =>
    http.post<{ engagement?: Engagement }>(`/applications/${id}/select`, { agreedPrice }),
  forJob: (jobPostId: string, params?: { page?: number; limit?: number; status?: ApplicationStatus; sort?: string }) =>
    http.get<Paginated<Application>>(`/jobs/${jobPostId}/applications`, params),
};

// ---- Messaging -------------------------------------------------------------

export const messagesApi = {
  open: (input: { jobPostId: string; artisanId: string; message?: string }) =>
    http.post<Conversation>("/conversations", input),
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    http.get<Paginated<Conversation>>("/conversations", params),
  unreadCount: () => http.get<{ count?: number; unread?: number; total?: number }>("/conversations/unread-count"),
  get: (id: string) => http.get<Conversation>(`/conversations/${id}`),
  messages: (id: string, params?: { limit?: number; before?: string }) =>
    http.get<Paginated<Message>>(`/conversations/${id}/messages`, params),
  send: (id: string, input: { body?: string; attachmentPath?: string; attachmentMime?: string }) =>
    http.post<Message>(`/conversations/${id}/messages`, input),
  markRead: (id: string) => http.post<void>(`/conversations/${id}/read`),
  deleteMessage: (id: string, messageId: string) =>
    http.del<void>(`/conversations/${id}/messages/${messageId}`),
};

// ---- Reviews ---------------------------------------------------------------

export const reviewsApi = {
  create: (input: { jobId: string; rating: number; comment?: string }) =>
    http.post<Review>("/reviews", input),
  eligibility: (jobId: string) => http.get<ReviewEligibility>(`/reviews/eligibility/${jobId}`),
  mine: (params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Review>>("/reviews/mine", params),
  forArtisan: (artisanId: string, params?: { page?: number; limit?: number; rating?: number }) =>
    http.get<Paginated<Review>>(`/reviews/artisans/${artisanId}`, params),
  summary: (artisanId: string) =>
    http.get<ReviewSummary>(`/reviews/artisans/${artisanId}/summary`),
};

// ---- Reports / disputes ----------------------------------------------------

export const reportsApi = {
  create: (input: {
    category: ReportCategory;
    description: string;
    reportedUserId?: string;
    jobPostId?: string;
    jobId?: string;
    messageId?: string;
    evidenceUrls?: string[];
  }) => http.post<Report>("/reports", input),
  mine: (params?: { page?: number; limit?: number; status?: string }) =>
    http.get<Paginated<Report>>("/reports/mine", params),
  get: (id: string) => http.get<Report>(`/reports/${id}`),
  createDispute: (input: { jobId: string; reason: string; details?: string }) =>
    http.post<Dispute>("/disputes", input),
  disputes: (params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Dispute>>("/disputes/mine", params),
  dispute: (id: string) => http.get<Dispute>(`/disputes/${id}`),
};

// ---- Notifications ---------------------------------------------------------

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) =>
    http.get<Paginated<Notification>>("/notifications", params),
  unreadCount: () => http.get<{ count?: number; unread?: number }>("/notifications/unread-count"),
  markRead: (id: string) => http.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => http.patch<void>("/notifications/read-all"),
  archive: (id: string) => http.del<void>(`/notifications/${id}`),
};

// ---- Storage ---------------------------------------------------------------

export const storageApi = {
  uploadTicket: (input: { bucket: StorageBucket; filename: string; mimeType: string; sizeBytes?: number }) =>
    http.post<UploadTicket>("/storage/upload-ticket", input),
};

// ---- Admin -----------------------------------------------------------------

export const adminApi = {
  metrics: () => http.get<AdminMetrics>("/admin/metrics"),
  growth: (days: number) => http.get<unknown>("/admin/metrics/growth", { days }),
  users: (params?: { page?: number; limit?: number; q?: string; role?: string; status?: string }) =>
    http.get<Paginated<AdminUser>>("/admin/users", params),
  user: (id: string) => http.get<AdminUser>(`/admin/users/${id}`),
  suspendUser: (id: string, reason?: string) =>
    http.post<unknown>(`/admin/users/${id}/suspend`, { reason }),
  reinstateUser: (id: string) => http.post<unknown>(`/admin/users/${id}/reinstate`),
  artisans: (params?: Record<string, unknown>) =>
    http.get<Paginated<AdminUser>>("/admin/artisans", params),
  verificationQueue: (params?: { page?: number; limit?: number; status?: string }) =>
    http.get<Paginated<Record<string, unknown>>>("/admin/artisan-applications", params),
  verificationPacket: (id: string) =>
    http.get<Record<string, unknown>>(`/admin/artisan-applications/${id}`),
  documentUrl: (id: string) => http.get<{ url: string }>(`/admin/verification-documents/${id}/url`),
  reviewApplication: (
    id: string,
    input: { decision: "APPROVED" | "REJECTED" | "UNDER_REVIEW"; rejectionReason?: string; notes?: string },
  ) => http.post<unknown>(`/admin/artisan-applications/${id}/review`, input),
  suspendArtisan: (id: string, reason?: string) =>
    http.post<unknown>(`/admin/artisans/${id}/suspend`, { reason }),
  jobs: (params?: { page?: number; limit?: number; status?: string; q?: string }) =>
    http.get<Paginated<Record<string, unknown>>>("/admin/jobs", params),
  job: (id: string) => http.get<Record<string, unknown>>(`/admin/jobs/${id}`),
  reports: (params?: { page?: number; limit?: number; status?: string; priority?: string; category?: string }) =>
    http.get<Paginated<Report>>("/admin/reports", params),
  report: (id: string) => http.get<Record<string, unknown>>(`/admin/reports/${id}`),
  updateReport: (id: string, input: Record<string, unknown>) =>
    http.patch<Report>(`/admin/reports/${id}`, input),
  reviews: (params?: Record<string, unknown>) =>
    http.get<Paginated<Review>>("/admin/reviews", params),
  hideReview: (id: string, reason?: string) => http.post<unknown>(`/admin/reviews/${id}/hide`, { reason }),
  restoreReview: (id: string) => http.post<unknown>(`/admin/reviews/${id}/restore`),
  disputes: (params?: { page?: number; limit?: number; status?: string }) =>
    http.get<Paginated<Dispute>>("/admin/disputes", params),
  auditLogs: (params?: Record<string, unknown>) =>
    http.get<Paginated<Record<string, unknown>>>("/admin/audit-logs", params),
  // Catalogue management
  catCategories: (params?: Record<string, unknown>) =>
    http.get<Paginated<ServiceCategory>>("/admin/catalogue/categories", { limit: 100, ...params }),
  createCategory: (input: Record<string, unknown>) =>
    http.post<ServiceCategory>("/admin/catalogue/categories", input),
  updateCategory: (id: string, input: Record<string, unknown>) =>
    http.patch<ServiceCategory>(`/admin/catalogue/categories/${id}`, input),
  retireCategory: (id: string) => http.del<void>(`/admin/catalogue/categories/${id}`),
  catServices: (params?: Record<string, unknown>) =>
    http.get<Paginated<Service>>("/admin/catalogue/services", { limit: 100, ...params }),
  createService: (input: Record<string, unknown>) =>
    http.post<Service>("/admin/catalogue/services", input),
  updateService: (id: string, input: Record<string, unknown>) =>
    http.patch<Service>(`/admin/catalogue/services/${id}`, input),
  retireService: (id: string) => http.del<void>(`/admin/catalogue/services/${id}`),
};
