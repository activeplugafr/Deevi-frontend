"use client";

import { use } from "react";
import Link from "next/link";
import { catalogueApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Card } from "@/components/ui/primitives";
import { AsyncBoundary, EmptyState } from "@/components/ui/states";
import { BackLink, PageHeader } from "@/components/ui/bits";
import { IconChevronRight } from "@/components/ui/icons";
import { naira } from "@/lib/format";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: category, loading: catLoading, error: catError, reload } = useAsync(
    () => catalogueApi.category(slug),
    [slug],
  );
  const { data: services, loading: svcLoading, error: svcError } = useAsync(
    () => (category ? catalogueApi.services({ categoryId: category.id }) : Promise.resolve(null)),
    [category?.id],
  );

  return (
    <div>
      <BackLink href="/home" label="All services" />
      <div className="mt-3">
        <AsyncBoundary
          loading={catLoading}
          error={catError}
          onRetry={reload}
          skeleton={<div className="skeleton h-8 w-48 rounded" />}
        >
          {category && (
            <PageHeader
              title={category.name}
              subtitle={category.description ?? "Pick a service to describe your job."}
            />
          )}
        </AsyncBoundary>

        <AsyncBoundary
          loading={svcLoading || catLoading}
          error={svcError}
          isEmpty={!!services && services.items.length === 0}
          empty={
            <EmptyState
              title="No services here yet"
              message="This category doesn't have bookable services right now. Try another, or post a job and describe it freely."
              action={
                <Link href="/jobs/new" className="text-sm font-semibold text-brand-600">
                  Post a job →
                </Link>
              }
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {services?.items.map((s) => {
              const priceHint =
                s.typical_price_min != null
                  ? `From ${naira(s.typical_price_min)}`
                  : null;
              return (
                <Link
                  key={s.id}
                  href={`/jobs/new?serviceId=${s.id}&serviceName=${encodeURIComponent(s.name)}`}
                >
                  <Card className="flex items-center justify-between gap-3 p-4 transition hover:border-brand-200 hover:shadow-sm">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{s.name}</p>
                      {s.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{s.description}</p>
                      )}
                      {priceHint && <p className="mt-1 text-xs text-brand-700">{priceHint}</p>}
                    </div>
                    <IconChevronRight size={18} className="shrink-0 text-muted" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </AsyncBoundary>
      </div>
    </div>
  );
}
