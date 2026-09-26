"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { homePathFor, useAuth } from "@/lib/auth/context";
import type { Role } from "@/lib/types";
import { Loading } from "@/components/ui/states";

/**
 * Client-side route guard. This is UX protection only — the backend remains the
 * authority on every request. It (a) sends anonymous users to /login preserving
 * where they were headed, and (b) redirects a signed-in user who lands in the
 * wrong role's area back to their own home.
 */
export function Guard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { status, role: userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "anonymous") {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }
    if (userRole && userRole !== role) {
      router.replace(homePathFor(userRole));
    }
  }, [status, userRole, role, router, pathname]);

  if (status !== "authenticated" || userRole !== role) {
    return <Loading label="Checking your access…" />;
  }
  return <>{children}</>;
}
