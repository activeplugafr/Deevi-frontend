import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WorkspaceHeader } from "@/components/ui/patterns";
import { Card } from "@/components/ui/primitives";
import { IconAlertCircle } from "@/components/ui/icons";

export const metadata = {
  title: "Page not found · Deevi",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 sm:px-6 py-12">
      <WorkspaceHeader
        eyebrow="Oops"
        title="Page not found"
        description="The page you&rsquo;re looking for doesn&rsquo;t exist."
      />

      <Card className="p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warn-50 mx-auto mb-4 text-warn-600">
          <IconAlertCircle size={28} />
        </div>
        <h2 className="text-lg font-bold text-ink">404 &mdash; Not found</h2>
        <p className="mt-1 text-sm text-muted">We couldn&rsquo;t find that page. It may have been moved or deleted.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/home" className="flex-1">
            <Button fullWidth>Go home</Button>
          </Link>
          <Link href="/jobs" className="flex-1">
            <Button variant="secondary" fullWidth>My jobs</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
