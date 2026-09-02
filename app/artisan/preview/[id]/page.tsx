"use client";
import { use } from "react";
import { ArtisanProfileView } from "@/components/artisan/ArtisanProfileView";
import { BackLink } from "@/components/ui/bits";
export default function ArtisanPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/artisan/profile" label="My profile" />
      <p className="mt-3 mb-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">This is how customers see your profile.</p>
      <ArtisanProfileView artisanId={id} />
    </div>
  );
}
