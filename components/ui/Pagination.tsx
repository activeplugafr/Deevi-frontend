"use client";

import { Button } from "./Button";
import { IconChevronLeft, IconChevronRight } from "./icons";
import type { PaginationMeta } from "@/lib/types";

export function Pagination({
  meta,
  page,
  onPage,
}: {
  meta: PaginationMeta;
  page: number;
  onPage: (p: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        size="sm"
        disabled={!meta.hasPreviousPage}
        onClick={() => onPage(page - 1)}
      >
        <IconChevronLeft size={16} /> Previous
      </Button>
      <span className="text-sm text-muted">
        Page {meta.page} of {meta.totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={!meta.hasNextPage}
        onClick={() => onPage(page + 1)}
      >
        Next <IconChevronRight size={16} />
      </Button>
    </div>
  );
}
