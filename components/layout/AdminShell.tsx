"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/primitives";
import { AccountMenu } from "./AccountMenu";
import { NotificationsBell } from "./NotificationsBell";
import { useAuth } from "@/lib/auth/context";
import { fullName, humanize } from "@/lib/format";
import {
  IconGrid,
  IconShield,
  IconUsers,
  IconBriefcase,
  IconFlag,
  IconLayers,
} from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconGrid, exact: true },
  { href: "/admin/verification", label: "Verification", icon: IconShield },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/jobs", label: "Jobs", icon: IconBriefcase },
  { href: "/admin/reports", label: "Reports", icon: IconFlag },
  { href: "/admin/services", label: "Catalogue", icon: IconLayers },
];

function active(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Operations console shell: denser, sidebar-led, professional (not consumer). */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo size={26} />
          <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Ops
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Operations
          </p>
          <div className="space-y-1">
            {NAV.map((n) => {
              const on = active(pathname, n.href, n.exact);
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                    on ? "bg-brand-600 text-white shadow-card" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  <Icon size={19} className={on ? "text-white" : "text-muted"} />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
        {user && (
          <div className="p-3">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-card border border-line bg-canvas px-3 py-2.5 transition hover:border-brand-200"
            >
              <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{fullName(user.firstName, user.lastName)}</p>
                <p className="truncate text-xs text-muted">{user.adminRole ? humanize(user.adminRole) : "Admin"}</p>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <Logo size={24} />
              <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Ops
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <NotificationsBell />
              <AccountMenu />
            </div>
          </div>
          {/* Mobile tab strip */}
          <nav className="scroll-slim flex gap-1 overflow-x-auto border-t border-line px-2 py-2 md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium",
                  active(pathname, n.href, n.exact) ? "bg-brand-600 text-white" : "text-ink-soft",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
