"use client";

import { Guard } from "@/components/layout/Guard";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import {
  IconLayers,
  IconClipboard,
  IconBriefcase,
  IconChat,
  IconUser,
  IconWallet,
} from "@/components/ui/icons";
import { useUnreadMessages } from "@/lib/useUnread";

const nav: NavItem[] = [
  { href: "/artisan", label: "For you", icon: IconLayers },
  { href: "/artisan/applications", label: "Applications", icon: IconClipboard },
  { href: "/artisan/active", label: "Active", icon: IconBriefcase },
  { href: "/artisan/messages", label: "Messages", icon: IconChat },
  { href: "/artisan/wallet", label: "Wallet & Escrow", icon: IconWallet },
  { href: "/artisan/profile", label: "Profile", icon: IconUser },
];

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const unread = useUnreadMessages();
  const withBadges = nav.map((n) =>
    n.href === "/artisan/messages" ? { ...n, badge: unread } : n,
  );
  return (
    <Guard role="ARTISAN">
      <AppShell
        nav={withBadges}
        brandHref="/artisan"
        roleLabel="Artisan Pro"
        sectionLabel="Workspace"
        exactHref="/artisan"
      >
        {children}
      </AppShell>
    </Guard>
  );
}
