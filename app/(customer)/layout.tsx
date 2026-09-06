"use client";

import { Guard } from "@/components/layout/Guard";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { LinkButton } from "@/components/ui/Button";
import {
  IconSearch,
  IconBriefcase,
  IconPlus,
  IconChat,
  IconUser,
  IconMapPin,
  IconBookmark,
} from "@/components/ui/icons";
import { useUnreadMessages } from "@/lib/useUnread";

const nav: NavItem[] = [
  { href: "/home", label: "Discover", icon: IconSearch },
  { href: "/jobs", label: "My jobs", icon: IconBriefcase },
  { href: "/jobs/new", label: "Post", icon: IconPlus, primary: true },
  { href: "/messages", label: "Messages", icon: IconChat },
  { href: "/profile", label: "Profile", icon: IconUser },
  { href: "/saved-artisans", label: "Saved Artisans", icon: IconBookmark },
];

/** Desktop top-bar content for the customer app: location + a post CTA. */
function CustomerTopbar() {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-sm font-medium text-ink-soft">
        <IconMapPin size={15} className="text-brand-600" /> Lagos, Nigeria
        <span className="text-muted">· Customer Hub</span>
      </span>
      <LinkButton href="/jobs/new" size="sm" className="ml-auto">
        <IconPlus size={16} /> Post a request
      </LinkButton>
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const unread = useUnreadMessages();
  const withBadges = nav.map((n) =>
    n.href === "/messages" ? { ...n, badge: unread } : n,
  );
  return (
    <Guard role="CUSTOMER">
      <AppShell
        nav={withBadges}
        brandHref="/home"
        roleLabel="Portal"
        sectionLabel="Main navigation"
        exactHref="/home"
        topbar={<CustomerTopbar />}
      >
        {children}
      </AppShell>
    </Guard>
  );
}
