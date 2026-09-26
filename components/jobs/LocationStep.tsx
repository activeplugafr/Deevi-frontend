"use client";

import { useState } from "react";
import { customersApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Field, Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { IconMapPin, IconCheck } from "@/components/ui/icons";
import type { ServiceLocationInput } from "@/lib/types";

/**
 * Job location capture. This is the JOB's location — deliberately independent
 * of the customer's profile address. Supports reusing a saved location or
 * entering one manually. Maps aren't configured on the backend, so there's no
 * map picker; "Use my current location" captures real device GPS coordinates
 * (source DEVICE) and we're honest that the area still needs typing.
 */
export function LocationStep({
  value,
  onChange,
}: {
  value: ServiceLocationInput;
  onChange: (v: ServiceLocationInput) => void;
}) {
  const { data: saved } = useAsync(async () => {
    try {
      return await customersApi.locations();
    } catch {
      return [];
    }
  }, []);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const set = (patch: Partial<ServiceLocationInput>) => onChange({ ...value, ...patch, country: "NG", });

  function useDevice() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: "DEVICE",
          savedLocationId: undefined,
        });
        setGeoStatus("done");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-4">
      {saved && saved.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Use a saved location</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {saved.map((loc) => {
              const active = value.savedLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() =>
                    set({
                      savedLocationId: loc.id,
                      source: "SAVED",
                      neighbourhood: loc.neighbourhood ?? undefined,
                      city: loc.city ?? undefined,
                      state: loc.state ?? undefined,
                    })
                  }
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-left transition",
                    active ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line hover:border-brand-200",
                  )}
                >
                  <IconMapPin size={18} className={active ? "text-brand-600" : "text-muted"} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{loc.label}</span>
                    <span className="block truncate text-xs text-muted">
                      {[loc.neighbourhood, loc.city].filter(Boolean).join(", ") || "Saved location"}
                    </span>
                  </span>
                  {active && <IconCheck size={16} className="ml-auto text-brand-600" />}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">Or enter the job&apos;s location below.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Neighbourhood / area" htmlFor="nbh">
          <Input
            id="nbh"
            value={value.neighbourhood ?? ""}
            onChange={(e) => set({ neighbourhood: e.target.value, savedLocationId: undefined, source: value.source === "DEVICE" ? "DEVICE" : "MANUAL" })}
            placeholder="e.g. Obalende"
          />
        </Field>
        <Field label="City" htmlFor="city" required>
          <Input
            id="city"
            value={value.city ?? ""}
            onChange={(e) => set({ city: e.target.value, savedLocationId: undefined })}
            placeholder="e.g. Lagos Island"
          />
        </Field>
      </div>
      <Field label="State" htmlFor="state">
        <Input
          id="state"
          value={value.state ?? ""}
          onChange={(e) => set({ state: e.target.value })}
          placeholder="e.g. Lagos"
        />
      </Field>
      <Field
        label="Street address"
        htmlFor="addr"
        hint="Kept private — only shared with the artisan you select, never shown in the public feed."
      >
        <Input
          id="addr"
          value={value.addressLine ?? ""}
          onChange={(e) => set({ addressLine: e.target.value })}
          placeholder="House number and street"
        />
      </Field>
      <Field label="Landmark / access notes" htmlFor="notes" hint="Optional. Also kept private.">
        <Textarea
          id="notes"
          value={value.locationNotes ?? ""}
          onChange={(e) => set({ locationNotes: e.target.value })}
          placeholder="e.g. Blue gate opposite the pharmacy"
        />
      </Field>

      <div className="rounded-lg border border-line bg-canvas p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Pin your exact spot</p>
            <p className="text-xs text-muted">
              Uses your device GPS for accurate distance matching. You still type the area name.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" loading={geoStatus === "loading"} onClick={useDevice}>
            {geoStatus === "done" && value.latitude ? "Location pinned" : "Use current location"}
          </Button>
        </div>
        {geoStatus === "done" && value.latitude && (
          <p className="mt-2 flex items-center gap-1 text-xs text-success-600">
            <IconCheck size={14} /> GPS captured ({value.latitude.toFixed(4)}, {value.longitude?.toFixed(4)})
          </p>
        )}
        {geoStatus === "error" && (
          <p className="mt-2 text-xs text-warn-600">
            Couldn&apos;t get your location. You can still enter the area manually above.
          </p>
        )}
      </div>
    </div>
  );
}
