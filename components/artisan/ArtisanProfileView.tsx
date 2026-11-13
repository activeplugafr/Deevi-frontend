"use client";

import { artisansApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Card, Avatar, VerifiedTick, Badge } from "@/components/ui/primitives";
import { Loading, ErrorState, EmptyState } from "@/components/ui/states";
import { Stars } from "@/components/ui/bits";
import { fullName, naira, humanize } from "@/lib/format";
import { IconMapPin, IconCheck } from "@/components/ui/icons";
import { browseArtisans, type BrowseArtisan } from "@/lib/mocks/artisans";

type ProfileArtisan = {
  id: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  verified: boolean;
  rating: number;
  ratingCount: number;
  jobsCompleted: number;
  yearsExperience?: number | null;
  location?: string | null;
  avatarUrl?: string | null;
  baseRate?: number | null;
  baseRateLabel?: string | null;
  services?: { name: string; price_min?: number | null }[];
  serviceAreas?: { neighbourhood?: string | null; city?: string | null }[];
  availabilityStatus?: string | null;
};

/** Read-only artisan profile — the trust surface a customer sees before hiring. */
export function ArtisanProfileView({ artisanId }: { artisanId: string }) {
  const { data: apiArtisan, loading: apiLoading, error: apiError, reload: apiReload } = useAsync(
    () => artisansApi.publicProfile(artisanId),
    [artisanId],
  );

  // Fall back to mock browse data when the backend has no record for this id.
  const mock = browseArtisans.find((a) => a.id === artisanId);
  const data: ProfileArtisan | null = apiArtisan ? normalizeApi(apiArtisan) : mock ? normalizeMock(mock) : null;
  const loading = apiLoading && !mock;
  const error = apiError && !mock ? apiError : null;

  if (loading) return <Loading label="Loading profile…" />;
  if (error || !data) return <ErrorState error={error} onRetry={apiReload} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={data.avatarUrl} firstName={data.name.split(" ")[0]} lastName={data.name.split(" ").slice(1).join(" ")} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-ink">{data.name}</h1>
              {data.verified ? <VerifiedTick /> : null}
            </div>
            {data.headline && <p className="mt-0.5 text-sm text-ink-soft">{data.headline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {data.ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Stars value={data.rating} size={14} /> <span className="font-medium text-ink">{data.rating.toFixed(1)}</span> ({data.ratingCount})
                </span>
              ) : (
                <span>New to Deevi</span>
              )}
              {data.location && (
                <span className="inline-flex items-center gap-1">
                  <IconMapPin size={14} /> {data.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Stat label="Jobs completed" value={String(data.jobsCompleted)} />
          <Stat label="Experience" value={data.yearsExperience ? `${data.yearsExperience} yr` : "—"} />
          <Stat label="Availability" value={humanize(data.availabilityStatus ?? "—")} />
        </div>
      </Card>

      {data.bio && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{data.bio}</p>
        </Card>
      )}

      {/* Services */}
      {data.services && data.services.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Services offered</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.services.map((s, i) => (
              <Badge key={s.name + i} className="border border-line bg-canvas text-ink-soft">
                {s.name}
                {s.price_min != null && <span className="ml-1 text-muted">· from {naira(s.price_min)}</span>}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Service areas */}
      {data.serviceAreas && data.serviceAreas.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Works in</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink-soft">
            {data.serviceAreas.map((area, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1">
                <IconMapPin size={13} className="text-muted" />
                {[area.neighbourhood, area.city].filter(Boolean).join(", ") || area.city}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Reviews */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">
          Reviews {data.ratingCount > 0 ? `(${data.ratingCount})` : ""}
        </h2>
        <EmptyState title="No reviews yet" message="This artisan hasn't been reviewed on Deevi yet." className="mt-3 border-0 py-6" />
      </Card>

      {data.verified && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <IconCheck size={14} className="text-brand-600" /> Identity verified by Deevi
        </p>
      )}
    </div>
  );
}

type JsonRecord = Record<string, unknown>;

function asStr(r: JsonRecord | null | undefined, key: string): string | null {
  const v = r?.[key];
  return typeof v === "string" ? v : null;
}
function asNum(r: JsonRecord | null | undefined, key: string): number | null {
  const v = r?.[key];
  return typeof v === "number" ? v : null;
}
function asBool(r: JsonRecord | null | undefined, key: string): boolean {
  return !!r?.[key];
}
function asArr(r: JsonRecord | null | undefined, key: string): JsonRecord[] {
  const v = r?.[key];
  return Array.isArray(v) ? (v as JsonRecord[]) : [];
}

function normalizeApi(a: JsonRecord): ProfileArtisan {
  return {
    id: asStr(a, "id") ?? asStr(a, "artisan_id") ?? "",
    name: asStr(a, "business_name") ?? fullName(asStr(a, "first_name"), asStr(a, "last_name"), "Artisan") ?? "Artisan",
    headline: asStr(a, "headline"),
    bio: asStr(a, "bio"),
    verified: asBool(a, "verification_status") && asStr(a, "verification_status") === "APPROVED",
    rating: asNum(a, "rating_average") ?? 0,
    ratingCount: asNum(a, "rating_count") ?? 0,
    jobsCompleted: asNum(a, "jobs_completed_count") ?? 0,
    yearsExperience: asNum(a, "years_of_experience"),
    location: asStr(a, "base_city"),
    avatarUrl: asStr(a, "avatar_url"),
    baseRate: null,
    baseRateLabel: null,
    services: asArr(a, "services").map((s) => ({
      name: asStr(s, "service_name") ?? asStr(s, "name") ?? "Service",
      price_min: asNum(s, "price_min"),
    })),
    serviceAreas: asArr(a, "service_areas").map((area) => ({
      neighbourhood: asStr(area, "neighbourhood"),
      city: asStr(area, "city"),
    })),
    availabilityStatus: asStr(a, "availability_status"),
  };
}

function normalizeMock(a: BrowseArtisan): ProfileArtisan {
  return {
    id: a.id,
    name: a.businessName ?? `${a.firstName} ${a.lastName}`,
    headline: a.headline,
    bio: null,
    verified: a.verificationStatus === "APPROVED",
    rating: a.rating,
    ratingCount: a.reviewCount,
    jobsCompleted: a.jobsCompleted,
    yearsExperience: a.yearsExperience ?? null,
    location: a.location,
    avatarUrl: a.avatarUrl ?? null,
    baseRate: a.baseRate,
    baseRateLabel: a.baseRateLabel,
    services: a.skills.map((s) => ({ name: s, price_min: null })),
    serviceAreas: [{ neighbourhood: null, city: a.location }],
    availabilityStatus: null,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
