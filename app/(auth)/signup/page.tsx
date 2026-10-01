"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { homePathFor, useAuth } from "@/lib/auth/context";
import { messageFor } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/primitives";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { cn } from "@/lib/cn";
import { IconSearch, IconWrench } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";

type SignupRole = "CUSTOMER" | "ARTISAN";

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const initialRole = (params.get("role") === "ARTISAN" ? "ARTISAN" : "CUSTOMER") as SignupRole;

  const [role, setRole] = useState<SignupRole>(initialRole);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signup({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        role,
      });
      if (res.session?.accessToken) {
        router.replace(homePathFor(role));
      } else {
        // Email confirmation required — no session issued.
        // toast.success("Account created. Please confirm your email, then log in.");
        router.replace("/login?registered=true");
      }
    } catch (err) {
      setError(messageFor(err));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Join Deevi in under a minute.</p>

      {/* Role picker */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {([
          { value: "CUSTOMER", label: "I need a service", icon: IconSearch },
          { value: "ARTISAN", label: "I'm an artisan", icon: IconWrench },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            aria-pressed={role === opt.value}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition",
              role === opt.value
                ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                : "border-line bg-surface hover:border-brand-200",
            )}
          >
            <opt.icon size={20} className={role === opt.value ? "text-brand-600" : "text-muted"} />
            <span className="text-sm font-semibold text-ink">{opt.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-600" role="alert">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="firstName" required>
            <Input id="firstName" required value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
          </Field>
          <Field label="Last name" htmlFor="lastName" required>
            <Input id="lastName" required value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="Optional — helps artisans reach you faster.">
          <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="0803 000 0000" />
        </Field>
        <Field label="Password" htmlFor="password" required hint="At least 8 characters, with a letter and a number.">
          <Input id="password" type="password" required minLength={8} value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="••••••••" />
        </Field>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <GoogleButton role={role} />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
