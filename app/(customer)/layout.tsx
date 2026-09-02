"use client";

import { Guard } from "@/components/layout/Guard";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import {
  IconHome,
  IconBriefcase,
  IconPlus,
  IconChat,
  IconUser,
} from "@/components/ui/icons";
import { useUnreadMessages } from "@/lib/useUnread";

const nav: NavItem[] = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/jobs", label: "My jobs", icon: IconBriefcase },
  { href: "/jobs/new", label: "Post", icon: IconPlus, primary: true },
  { href: "/messages", label: "Messages", icon: IconChat },
  { href: "/profile", label: "Profile", icon: IconUser },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const unread = useUnreadMessages();
  const withBadges = nav.map((n) =>
    n.href === "/messages" ? { ...n, badge: unread } : n,
  );
  return (
    <Guard role="CUSTOMER">
      <AppShell nav={withBadges} brandHref="/home">
        {children}
      </AppShell>
    </Guard>
  );
}
