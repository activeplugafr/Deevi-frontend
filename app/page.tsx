"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homePathFor, useAuth } from "@/lib/auth/context";
import { catalogueApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { IconShield, IconSearch, IconChat, IconStar } from "@/components/ui/icons";
import type { CategoryGroup } from "@/lib/types";

const GROUP_LABEL: Record<CategoryGroup, string> = {
  HOME_REPAIR: "Home & repair",
  PERSONAL: "Personal & beauty",
  MOBILITY: "Moving & delivery",
  GENERAL: "More services",
};

export default function LandingPage() {
  const { status, role } = useAuth();
  const router = useRouter();

  // Signed-in users don't need the marketing page.
  useEffect(() => {
    if (status === "authenticated") router.replace(homePathFor(role));
  }, [status, role, router]);

  const { data: categories } = useAsync(() => catalogueApi.categories(), []);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={28} className="text-brand-500" />
      </div>
    );
  }

  const grouped = (categories?.items ?? []).reduce<Record<string, string[]>>((acc, c) => {
    (acc[c.group_key] ??= []).push(c.name);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo size={30} />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink">
            Log in
          </Link>
          <LinkButton href="/signup" size="sm">
            Get started
          </LinkButton>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-14 sm:pt-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <IconShield size={14} /> Verified artisans across Nigeria
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Tell us what you need.{" "}
            <span className="text-brand-600">The right artisan applies.</span>
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Post your job in your own words — a leaking kitchen pipe, a wedding
            makeover, a move across Lagos. Relevant, verified artisans see it and
            apply. You compare, chat, and choose who to trust.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/signup?role=CUSTOMER" size="lg">
              Post a job — it&apos;s free
            </LinkButton>
            <LinkButton href="/signup?role=ARTISAN" size="lg" variant="secondary">
              Find work as an artisan
            </LinkButton>
          </div>
          <p className="mt-3 text-xs text-muted">
            Payment for jobs is arranged directly between you and your artisan —
            Deevi doesn&apos;t handle the money.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { icon: IconSearch, title: "Post & get applications", body: "Describe the job and where it is. Relevant artisans nearby apply with a price and timeline." },
            { icon: IconChat, title: "Compare & message", body: "See ratings, experience and verification. Message before you commit to anyone." },
            { icon: IconStar, title: "Hire & review", body: "Pick your artisan, get the work done, then leave a review to help the next customer." },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon size={20} />
              </div>
              <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Real catalogue */}
        {Object.keys(grouped).length > 0 && (
          <div className="mt-14">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              A few of the services on Deevi
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(grouped) as CategoryGroup[]).map((g) => (
                <div key={g} className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">{GROUP_LABEL[g] ?? g}</p>
                  <ul className="mt-2 space-y-1">
                    {grouped[g].slice(0, 6).map((name) => (
                      <li key={name} className="text-sm text-muted">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted sm:flex-row">
          <Logo size={22} />
          <p>Built for Nigeria. © {new Date().getFullYear()} Deevi.</p>
        </div>
      </footer>
    </div>
  );
}
