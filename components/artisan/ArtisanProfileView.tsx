"use client";

import { artisansApi, reviewsApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Card, Avatar, VerifiedTick, Badge } from "@/components/ui/primitives";
import { Loading, ErrorState, EmptyState } from "@/components/ui/states";
import { Stars, VerificationBadge } from "@/components/ui/bits";
import { fullName, naira, humanize, timeAgo } from "@/lib/format";
import { IconMapPin, IconCheck } from "@/components/ui/icons";

/** Read-only artisan profile — the trust surface a customer sees before hiring. */
export function ArtisanProfileView({ artisanId }: { artisanId: string }) {
  const { data: artisan, loading, error, reload } = useAsync(() => artisansApi.publicProfile(artisanId), [artisanId]);
  const { data: summary } = useAsync(async () => {
    try {
      return await reviewsApi.summary(artisanId);
    } catch {
      return null;
    }
  }, [artisanId]);
  const { data: reviews } = useAsync(async () => {
    try {
      return await reviewsApi.forArtisan(artisanId, { limit: 5 });
    } catch {
      return null;
    }
  }, [artisanId]);

  if (loading) return <Loading label="Loading profile…" />;
  if (error || !artisan) return <ErrorState error={error} onRetry={reload} />;

  const name = artisan.business_name || fullName(artisan.first_name, artisan.last_name, "Artisan");
  const verified = artisan.verification_status === "APPROVED";
  const rating = artisan.rating_average ?? summary?.average ?? 0;
  const ratingCount = artisan.rating_count ?? summary?.count ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={artisan.avatar_url} firstName={artisan.first_name} lastName={artisan.last_name} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-ink">{name}</h1>
              {verified ? <VerifiedTick /> : artisan.verification_status && <VerificationBadge status={artisan.verification_status} />}
            </div>
            {artisan.headline && <p className="mt-0.5 text-sm text-ink-soft">{artisan.headline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {ratingCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Stars value={rating} size={14} /> <span className="font-medium text-ink">{rating.toFixed(1)}</span> ({ratingCount})
                </span>
              ) : (
                <span>New to Deevi</span>
              )}
              {artisan.base_city && (
                <span className="inline-flex items-center gap-1">
                  <IconMapPin size={14} /> {artisan.base_city}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Stat label="Jobs completed" value={String(artisan.jobs_completed_count ?? 0)} />
          <Stat label="Experience" value={artisan.years_of_experience ? `${artisan.years_of_experience} yr` : "—"} />
          <Stat label="Availability" value={humanize(artisan.availability_status ?? "—")} />
        </div>
      </Card>

      {artisan.bio && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{artisan.bio}</p>
        </Card>
      )}

      {/* Services */}
      {artisan.services && artisan.services.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Services offered</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {artisan.services.map((s, i) => (
              <Badge key={s.id ?? i} className="border border-line bg-canvas text-ink-soft">
                {s.service_name ?? "Service"}
                {s.price_min != null && <span className="ml-1 text-muted">· from {naira(s.price_min)}</span>}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Service areas */}
      {artisan.service_areas && artisan.service_areas.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Works in</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink-soft">
            {artisan.service_areas.map((area, i) => (
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
          Reviews {ratingCount > 0 ? `(${ratingCount})` : ""}
        </h2>
        {reviews && reviews.items.length > 0 ? (
          <div className="mt-3 space-y-4">
            {reviews.items.map((r) => (
              <div key={r.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} size={14} />
                  <span className="text-xs text-muted">{timeAgo(r.created_at)}</span>
                </div>
                {r.comment && <p className="mt-1.5 text-sm text-ink-soft">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews yet" message="This artisan hasn't been reviewed on Deevi yet." className="mt-3 border-0 py-6" />
        )}
      </Card>

      {verified && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <IconCheck size={14} className="text-brand-600" /> Identity verified by Deevi
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
