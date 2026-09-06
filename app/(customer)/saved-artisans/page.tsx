"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { WorkspaceHeader } from "@/components/ui/patterns";
import { Stars, DemoBadge, Segmented } from "@/components/ui/bits";
import { naira } from "@/lib/format";
import { IconShield, IconMapPin, IconChat, IconPlus, IconClock, IconSearch, IconUsers } from "@/components/ui/icons";
import { savedArtisans, savedCategories, type SavedArtisan } from "@/lib/mocks/savedArtisans";

export default function SavedArtisansPage() {
  const toast = useToast();
  const [cat, setCat] = useState<string>("All Saved");
  const [q, setQ] = useState("");

  const preview = () => toast.show("Saved artisans is a preview in this build.", "info");

  const filtered = useMemo(
    () =>
      savedArtisans.filter(
        (a) =>
          (cat === "All Saved" || a.category === cat) &&
          (q.trim() === "" || `${a.name} ${a.trade} ${a.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, q],
  );

  const tabs = savedCategories.map((c) => ({
    value: c,
    label: c === "All Saved" ? `All Saved (${savedArtisans.length})` : c,
  }));

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Your Trusted Rolodex"
        title="Saved Artisans"
        description="Quick-book direct contacts, review project histories, and monitor ongoing work."
        actions={
          <>
            <DemoBadge />
            <Badge className="border border-line bg-canvas text-ink-soft">
              <IconClock size={13} /> Avg. response ~7m
            </Badge>
          </>
        }
      />

      {/* Controls */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your saved artisans…"
            aria-label="Search saved artisans"
            className="h-11 w-full rounded-control border border-line bg-surface pl-11 pr-3 text-sm text-ink placeholder:text-muted outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/15"
          />
        </div>
        <Segmented options={tabs} value={cat} onChange={setCat} />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ArtisanCard key={a.id} artisan={a} onAction={preview} />
        ))}

        {/* Discover more CTA */}
        <Card className="flex flex-col justify-between gap-4 bg-brand-50/40 p-5">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-100 text-brand-600">
              <IconUsers size={20} />
            </span>
            <h3 className="mt-3 font-display text-base font-bold text-ink">Looking for someone else?</h3>
            <p className="mt-1 text-sm text-muted">
              Explore vetted artisans across Lagos with verified background checks.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="font-display text-xl font-bold text-brand-700 tnum">142</p>
                <p className="text-xs text-muted">Active nearby</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-warn-600 tnum">98.6%</p>
                <p className="text-xs text-muted">Satisfaction rate</p>
              </div>
            </div>
          </div>
          <Button fullWidth onClick={preview}>Explore Lekki artisans</Button>
        </Card>
      </div>

      {filtered.length === 0 && (
        <Card className="mt-4 p-8 text-center text-sm text-muted">No saved artisans match that filter.</Card>
      )}

      {/* Booking protection banner */}
      <Card className="mt-6 flex flex-col items-start justify-between gap-3 bg-brand-50/40 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-100 text-brand-600">
            <IconShield size={20} />
          </span>
          <div>
            <p className="font-semibold text-ink">Deevi direct booking</p>
            <p className="text-sm text-muted">
              Book any saved artisan through Deevi — you compare, chat, and settle directly. Nothing
              is charged until you agree the job.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={preview} className="shrink-0">
          <IconPlus size={16} /> Post new job
        </Button>
      </Card>
    </div>
  );
}

function ArtisanCard({ artisan: a, onAction }: { artisan: SavedArtisan; onAction: () => void }) {
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Avatar firstName={a.name.split(" ")[0]} lastName={a.name.split(" ")[1]} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{a.name}</p>
          <p className="truncate text-xs text-muted">{a.trade}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <IconMapPin size={12} /> {a.location}
            {a.distanceKm != null && <span>· {a.distanceKm} km</span>}
          </p>
        </div>
      </div>

      {a.activeProject && (
        <div className="mt-3 rounded-control bg-warn-50 px-2.5 py-1.5 text-xs font-medium text-warn-600">
          ● Active project: {a.activeProject}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1">
          <Stars value={a.rating} size={13} /> <span className="font-semibold text-ink">{a.rating.toFixed(1)}</span>
        </span>
        <span className="text-muted">{a.jobsLabel}</span>
        {a.badge && <Badge className="bg-brand-50 text-brand-700">{a.badge}</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {a.skills.map((s) => (
          <Badge key={s} className="border border-line bg-canvas text-ink-soft">{s}</Badge>
        ))}
      </div>

      <div className="mt-3 rounded-control bg-canvas px-3 py-2 text-xs text-ink-soft">{a.note}</div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">{a.baseRateLabel}</span>
        <span className="text-sm font-semibold text-ink tnum">From {naira(a.baseRate)} <span className="font-normal text-muted">/ visit</span></span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={onAction}>
          <IconPlus size={16} /> Request quote
        </Button>
        <Button variant="secondary" size="sm" onClick={onAction}>
          <IconChat size={16} /> Message
        </Button>
      </div>
    </Card>
  );
}
