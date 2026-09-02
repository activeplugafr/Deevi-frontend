"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { NotificationsBell } from "./NotificationsBell";
import { AccountMenu } from "./AccountMenu";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  primary?: boolean; // highlighted action in the bottom bar (e.g. Post a job)
}

function isActive(pathname: string, href: string): boolean {
  if (href === pathname) return true;
  // Treat nested routes as active for their section, but never let "/" match all.
  return href !== "/" && pathname.startsWith(href + "/");
}

export function AppShell({
  nav,
  children,
  brandHref,
}: {
  nav: NavItem[];
  children: React.ReactNode;
  brandHref: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href={brandHref} aria-label="Deevi home">
            <Logo size={26} />
          </Link>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4">
        {/* Desktop left rail */}
        <aside className="hidden w-56 shrink-0 py-6 md:block">
          <nav className="sticky top-20 space-y-1">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-soft hover:bg-surface hover:text-ink",
                  )}
                >
                  <Icon size={20} className={active ? "text-brand-600" : "text-muted"} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 py-5 pb-24 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {nav.slice(0, 5).map((item) => {
            const active = isActive(pathname, item.href);
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
