"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Avatar } from "@/components/ui/primitives";
import { fullName } from "@/lib/format";
import { IconLogout, IconUser, IconSettings } from "@/components/ui/icons";

export function AccountMenu() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const base = role === "ARTISAN" ? "/artisan" : role === "ADMIN" ? "/admin" : "";
  const profileHref = role === "ARTISAN" ? "/artisan/profile" : role === "ADMIN" ? "/admin/profile" : "/profile";
  const settingsHref = role === "ARTISAN" ? "/artisan/settings" : role === "ADMIN" ? "/admin/settings" : "/settings";

  async function onLogout() {
    setOpen(false);
    await logout();
    router.replace("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:bg-canvas"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size={34} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
          role="menu"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {fullName(user.firstName, user.lastName)}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-canvas"
              role="menuitem"
            >
              <IconUser size={18} className="text-muted" /> Profile
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-canvas"
              role="menuitem"
            >
              <IconSettings size={18} className="text-muted" /> Settings
            </Link>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
              role="menuitem"
            >
              <IconLogout size={18} /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
