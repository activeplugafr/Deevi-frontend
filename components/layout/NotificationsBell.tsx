"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { notificationsApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { IconBell } from "@/components/ui/icons";

/** Bell with an unread dot. Polls unread count lightly; degrades silently. */
export function NotificationsBell() {
  const { role } = useAuth();
  const { data } = useAsync(async () => {
    try {
      return await notificationsApi.unreadCount();
    } catch {
      return { count: 0 };
    }
  }, []);

  const count = data?.count ?? data?.unread ?? 0;
  // Customers: /notifications (not /home/notifications), artisans: /artisan/notifications, admin: /admin/notifications
  const notifHref = role === "ARTISAN" ? "/artisan/notifications" : role === "ADMIN" ? "/admin/notifications" : "/notifications";

  return (
    <Link
      href={notifHref}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-canvas"
      aria-label={count ? `Notifications, ${count} unread` : "Notifications"}
    >
      <IconBell size={21} />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-surface">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
