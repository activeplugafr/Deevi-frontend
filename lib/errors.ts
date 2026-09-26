/**
 * Turns backend error envelopes into human-readable, Deevi-voiced messages.
 * The backend guarantees `{ statusCode, code, message, details, ... }` and asks
 * us to branch on `code`, never on `message`. We map the codes we know, and
 * fall back to the HTTP status for everything else — never a raw object.
 */

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: string[];
  path?: string;
  timestamp?: string;
  requestId?: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details: string[];
  requestId?: string;
  body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.code = body.code;
    this.details = body.details ?? [];
    this.requestId = body.requestId;
    this.body = body;
  }
}

/** Thrown when the request never reached the server (offline, DNS, timeout). */
export class NetworkError extends Error {
  constructor(message = "network") {
    super(message);
    this.name = "NetworkError";
  }
}

// Friendly copy keyed on the backend's stable `code`. We keep this small and
// only cover codes with a clearer user-facing phrasing than the raw message.
const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Please try again.",
  EMAIL_NOT_CONFIRMED:
    "Please confirm your email address before signing in. Check your inbox.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists. Try signing in.",
  SIGNUP_FAILED: "We couldn't create your account. Please check your details and try again.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  ARTISAN_NOT_APPROVED:
    "Your account is still being verified. You'll be able to see and apply to jobs once you're approved.",
  ARTISAN_ALREADY_SELECTED:
    "This job has already been assigned to another artisan.",
  ALREADY_SELECTED: "This job has already been assigned to another artisan.",
  APPLICATION_EXISTS: "You've already applied to this job.",
  DUPLICATE_APPLICATION: "You've already applied to this job.",
  ALREADY_APPLIED: "You've already applied to this job.",
  NOT_PARTICIPANT: "You're not part of this conversation.",
  REVIEW_EXISTS: "You've already reviewed this job.",
  ALREADY_REVIEWED: "You've already reviewed this job.",
  NOT_ELIGIBLE: "This action isn't available for this job yet.",
  RATE_LIMITED: "You're going a little fast. Please wait a moment and try again.",
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check your details and try again.",
  401: "Please sign in to continue.",
  403: "You don't have access to this.",
  404: "We couldn't find what you were looking for.",
  409: "That action conflicts with the current state. Please refresh and try again.",
  422: "Please check the highlighted fields and try again.",
  429: "You're going a little fast. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again shortly.",
  503: "Deevi is briefly unavailable. Please try again shortly.",
};

/** Best human-readable message for any thrown error. */
export function messageFor(err: unknown): string {
  if (err instanceof NetworkError) {
    return "We couldn't reach Deevi. Check your connection and try again.";
  }
  if (err instanceof ApiError) {
    if (CODE_MESSAGES[err.code]) return CODE_MESSAGES[err.code];
    if (STATUS_MESSAGES[err.statusCode]) return STATUS_MESSAGES[err.statusCode];
    // The backend's own message is a safe last resort — it's user-oriented.
    return err.message || "Something went wrong. Please try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

/** Field-level errors, if the backend returned any (for form highlighting). */
export function fieldErrorsFor(err: unknown): string[] {
  return err instanceof ApiError ? err.details : [];
}

export function statusFor(err: unknown): number | null {
  if (err instanceof ApiError) return err.statusCode;
  return null;
}
