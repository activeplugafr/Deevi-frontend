"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { WorkspaceHeader } from "@/components/ui/patterns";
import { Stars, Segmented } from "@/components/ui/bits";
import { naira } from "@/lib/format";
import { IconSearch, IconMapPin, IconStar, IconWrench, IconZap, IconSparkles } from "@/components/ui/icons";
import { browseArtisans, browseCategories, type BrowseArtisan } from "@/lib/mocks/artisans";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "Plumbing": IconWrench,
  "Electrical & Solar": IconZap,
  "Carpentry": IconWrench,
  "AC & Cooling": IconZap,
  "Personal & Beauty": IconSparkles,
};

export default function ArtisansPage() {
  const router = useRouter();
  const [cat, setCat] = useState<string>("All Categories");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      browseArtisans.filter(
        (a) =>
          (cat === "All Categories" || a.category === cat) &&
          (q.trim() === "" ||
            `${a.firstName} ${a.lastName} ${a.trade} ${a.skills.join(" ")} ${a.location}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, q],
  );

  const tabs = browseCategories.map((c) => ({
    value: c,
    label: c === "All Categories" ? `All artisans (${browseArtisans.length})` : c,
    icon: CATEGORY_ICONS[c],
  }));

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        eyebrow="Find a vetted artisan"
        title="Artisans"
        description="Browse verified artisans across Lagos and nearby areas. View profiles, rates, and request a quote."
        actions={
          <Badge className="border border-line bg-canvas text-ink-soft">
            <IconStar size={13} /> {filtered.length} available
          </Badge>
        }
      />

      {/* Controls */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artisans, trades, skills…"
            aria-label="Search artisans"
            className="h-11 w-full rounded-control border border-line bg-surface pl-11 pr-3 text-sm text-ink placeholder:text-muted outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/15"
          />
        </div>
        <Segmented options={tabs} value={cat} onChange={setCat} />
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <ArtisanCard key={a.id} artisan={a} onView={() => router.push(`/artisans/${a.id}`)} />
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full mt-4 p-8 text-center text-sm text-muted">
            No artisans match that filter.
          </Card>
        )}
      </div>
    </div>
  );
}

function ArtisanCard({ artisan: a, onView }: { artisan: BrowseArtisan; onView: () => void }) {
  const verified = a.verificationStatus === "APPROVED";
  const Icon = CATEGORY_ICONS[a.category] || IconWrench;
  return (
    <Card className="flex flex-col h-full group hover:border-brand-200 hover:shadow-md transition-all duration-200">
      {/* Category badge + icon */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-line shadow-sm">
        <Icon size={12} className="text-brand-600" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">{a.category}</span>
      </div>

      <div className="flex items-start gap-3 pt-4 px-4">
        <div className="relative">
          <Avatar src={a.avatarUrl} firstName={a.firstName} lastName={a.lastName} size={44} />
          {verified && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success-600 text-white shadow-sm">
              <span className="text-[10px] font-bold">✓</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-ink">{a.businessName ?? `${a.firstName} ${a.lastName}`}</p>
            {verified && <Badge className="bg-success-50 text-success-700 border-success-600/20 text-[10px] px-2 py-0.5">Verified</Badge>}
          </div>
          <p className="truncate text-xs text-muted">{a.trade}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <IconMapPin size={12} /> {a.location}
            {a.distanceKm != null && <span className="ml-0.5">· {a.distanceKm} km</span>}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Stars value={a.rating} size={13} /> <span className="font-semibold text-ink">{a.rating.toFixed(1)}</span>
          </span>
          <span className="text-muted">({a.reviewCount})</span>
          {a.jobsCompleted > 0 && <span className="text-muted">· {a.jobsCompleted} jobs</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.skills.slice(0, 4).map((s) => (
            <Badge key={s} className="border border-line bg-canvas text-ink-soft text-xs">
              {s}
            </Badge>
          ))}
          {a.skills.length > 4 && (
            <Badge className="border border-line bg-canvas text-ink-soft text-xs">+{a.skills.length - 4}</Badge>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-line px-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink tnum">
          {naira(a.baseRate)} <span className="font-normal text-muted">/ visit</span>
        </span>
        <Button size="sm" onClick={onView} className="shrink-0">
          View profile
        </Button>
      </div>
    </Card>
  );
}
