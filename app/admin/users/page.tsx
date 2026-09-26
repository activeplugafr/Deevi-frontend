"use client";

import { useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { usePaginated, useDebounced } from "@/lib/hooks";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/bits";
import { AdminList, pick } from "@/components/admin/AdminList";
import { fullName, humanize } from "@/lib/format";
import { IconChevronRight } from "@/components/ui/icons";

const TABS = [
  { value: "all", label: "All" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "ARTISAN", label: "Artisans" },
  { value: "ADMIN", label: "Admins" },
];

export default function AdminUsers() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 350);
  const state = usePaginated(
    (p) => adminApi.users({ page: p, limit: 15, role: tab === "all" ? undefined : tab, q: debounced.trim() || undefined }),
    [tab, debounced],
  );

  return (
    <div>
      <PageHeader title="Users" subtitle="Everyone on Deevi." />
      <AdminList
        state={state}
        page={state.page}
        onPage={state.setPage}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search by name or email"
        tabs={TABS}
        tab={tab}
        onTab={setTab}
        emptyTitle="No users found"
        renderRow={(item) => {
          const u = item as Record<string, unknown>;
          const roles = (pick<string[]>(u, "roles") ?? []) as string[];
          const status = pick<string>(u, "status") ?? "ACTIVE";
          return (
            <Link key={pick<string>(u, "id")} href={`/admin/users/${pick<string>(u, "id")}`}>
              <Card className="flex items-center gap-3 p-3.5 transition hover:border-brand-200">
                <Avatar src={pick<string>(u, "avatar_url")} firstName={pick<string>(u, "first_name")} lastName={pick<string>(u, "last_name")} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{fullName(pick<string>(u, "first_name"), pick<string>(u, "last_name"))}</p>
                  <p className="truncate text-xs text-muted">{pick<string>(u, "email")}</p>
                </div>
                <div className="hidden gap-1 sm:flex">
                  {roles.map((r) => (
                    <Badge key={r} className="border border-line bg-canvas text-ink-soft">{humanize(r)}</Badge>
                  ))}
                </div>
                <Badge className={status === "ACTIVE" ? "bg-success-50 text-success-600" : "bg-warn-50 text-warn-600"}>
                  {humanize(status)}
                </Badge>
                <IconChevronRight size={18} className="text-muted" />
              </Card>
            </Link>
          );
        }}
      />
    </div>
  );
}
