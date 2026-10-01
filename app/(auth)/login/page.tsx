"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { homePathFor, useAuth } from "@/lib/auth/context";
import { messageFor } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/primitives";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (params.get("registered") === "true") {
      toast.success(
        "Account created. Please confirm your email, then log in."
      );
    }
  }, [params, toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      const role = user.roles?.includes("ADMIN") || user.adminRole
        ? "ADMIN"
        : user.roles?.includes("ARTISAN")
          ? "ARTISAN"
          : "CUSTOMER";
      router.replace(next && next.startsWith("/") ? next : homePathFor(role));
    } catch (err) {
      setError(messageFor(err));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to your Deevi account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-600" role="alert">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Log in
        </Button>
      </form>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted">
        New to Deevi?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
