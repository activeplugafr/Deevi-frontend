"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/primitives";
import { NotificationsBell } from "./NotificationsBell";
import { AccountMenu } from "./AccountMenu";
import { useAuth } from "@/lib/auth/context";
import { fullName, humanize } from "@/lib/format";
import { IconChevronRight } from "@/components/ui/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  primary?: boolean; // highlighted action in the mobile bottom bar (e.g. Post a job)
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (href === pathname) return true;
  if (exact) return false;
  return href !== "/" && pathname.startsWith(href + "/");
}

/**
 * The workspace shell for the customer and artisan apps.
 * Desktop: full-height left sidebar (brand + grouped nav + pinned user card)
 * with a content top bar. Mobile: compact top bar + bottom tab nav. All pages
 * flow through this, so restyling here restyles every screen's chrome.
 */
export function AppShell({
  nav,
  children,
  brandHref,
  roleLabel,
  sectionLabel = "Workspace",
  exactHref,
  topbar,
}: {
  nav: NavItem[];
  children: React.ReactNode;
  brandHref: string;
  roleLabel?: string;
  sectionLabel?: string;
  exactHref?: string; // href that should only match exactly (e.g. artisan home "/artisan")
  topbar?: React.ReactNode; // desktop content top-bar left slot (search / location)
}) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const profileHref = role === "ARTISAN" ? "/artisan/profile" : role === "ADMIN" ? "/admin/profile" : "/profile";

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href={brandHref} aria-label="Deevi home">
            <Logo size={26} />
          </Link>
          {roleLabel && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
              {roleLabel}
            </span>
          )}
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-3 py-2">
          {sectionLabel && (
            <p className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              {sectionLabel}
            </p>
          )}
          <div className="space-y-1">
            {nav.map((item) => {
              const active = isActive(pathname, item.href, item.href === exactHref);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-brand-600 text-white shadow-card"
                      : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  <Icon size={19} className={active ? "text-white" : "text-muted"} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-brand-600 text-white",
                      )}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Pinned user card */}
        {user && (
          <div className="p-3">
            <Link
              href={profileHref}
              className="flex items-center gap-3 rounded-card border border-line bg-canvas px-3 py-2.5 transition hover:border-brand-200"
            >
              <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {fullName(user.firstName, user.lastName)}
                </p>
                <p className="truncate text-xs text-muted">
                  {roleLabel ?? (role ? humanize(role) : "")}
                </p>
              </div>
              <IconChevronRight size={16} className="text-muted" />
            </Link>
          </div>
        )}
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            {/* Mobile brand */}
            <Link href={brandHref} className="md:hidden" aria-label="Deevi home">
              <Logo size={24} />
            </Link>
            {/* Desktop contextual slot */}
            <div className="hidden min-w-0 flex-1 md:block">{topbar}</div>
            <div className="ml-auto flex items-center gap-1">
              <NotificationsBell />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-24 md:pb-10">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {nav.slice(0, 5).map((item) => {
            const active = isActive(pathname, item.href, item.href === exactHref);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "relative flex h-8 w-12 items-center justify-center rounded-full transition",
                    item.primary && "bg-brand-600 text-white",
                    !item.primary && active && "text-brand-600",
                    !item.primary && !active && "text-muted",
                  )}
                >
                  <Icon size={item.primary ? 22 : 21} />
                  {item.badge ? (
                    <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-surface" />
                  ) : null}
                </span>
                <span className={cn(active ? "text-ink" : "text-muted", item.primary && "text-brand-700")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
