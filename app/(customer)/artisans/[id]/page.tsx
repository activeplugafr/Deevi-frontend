"use client";
import { use } from "react";
import { ArtisanProfileView } from "@/components/artisan/ArtisanProfileView";
import { BackLink } from "@/components/ui/bits";
export default function ViewArtisan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink label="Back" />
      <div className="mt-3">
        <ArtisanProfileView artisanId={id} />
      </div>
    </div>
  );
}
