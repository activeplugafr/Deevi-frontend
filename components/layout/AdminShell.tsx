"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { AccountMenu } from "./AccountMenu";
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo size={26} showWordmark />
            <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Ops
            </span>
          </div>
          <AccountMenu />
        </div>
        {/* Mobile tab bar */}
        <nav className="scroll-slim flex gap-1 overflow-x-auto border-t border-line px-2 py-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                active(pathname, n.href, n.exact) ? "bg-brand-50 text-brand-700" : "text-ink-soft",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-line bg-surface md:block">
          <nav className="sticky top-14 space-y-1 p-3">
            {NAV.map((n) => {
              const on = active(pathname, n.href, n.exact);
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    on ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-canvas",
                  )}
                >
                  <Icon size={19} className={on ? "text-brand-600" : "text-muted"} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
